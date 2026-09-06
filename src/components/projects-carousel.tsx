"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { projects, type Project, getProjectLink, isInternalProject } from "@/data/projects";

const AUTO_DURATION_S = 40;
const MOBILE_AUTO_DURATION_S = 35;
const DRAG_THRESHOLD = 6;
const MOMENTUM_FRICTION = 0.92;
const MIN_VELOCITY = 0.35;
const SYNTHETIC_MOUSE_GRACE_MS = 1500;
const STALL_RECOVERY_MS = 2000;
const CAROUSEL_OFFSET_KEY = "nordlys-projects-carousel-offset";
const CAROUSEL_SAVE_INTERVAL_MS = 1000;

function ProjectCardContent({ project }: { project: Project }) {
  return (
    <>
      <span className="text-[10px] tracking-[0.2em] text-muted uppercase sm:text-xs sm:tracking-[0.22em]">
        {project.tag}
      </span>

      <div className="projects-carousel-card-image">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 640px) 11rem, (max-width: 1024px) 14rem, 16rem"
            unoptimized
            className="object-contain object-center"
            draggable={false}
          />
        ) : null}
      </div>

      <div>
        <p className="text-base font-medium tracking-tight text-white sm:text-xl">
          {project.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted sm:text-xs">
          {project.tagline}
        </p>
      </div>
    </>
  );
}

function ProjectCard({
  project,
  className,
  interactive = true,
}: {
  project: Project;
  className?: string;
  interactive?: boolean;
}) {
  if (!interactive) {
    return (
      <div className={className}>
        <ProjectCardContent project={project} />
      </div>
    );
  }

  return (
    <a
      href={getProjectLink(project)}
      {...(isInternalProject(project)
        ? {}
        : { target: "_blank", rel: "noreferrer" })}
      draggable={false}
      className={
        className ??
        "projects-carousel-card flex shrink-0 flex-col justify-between rounded-2xl p-3 transition duration-300 active:brightness-125 sm:p-4 sm:hover:-translate-y-1 sm:hover:brightness-110"
      }
    >
      <ProjectCardContent project={project} />
    </a>
  );
}

export function ProjectsCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopSetRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const dragActiveRef = useRef(false);
  const lastXRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const velocityRef = useRef(0);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const loopSet = loopSetRef.current;
    if (!viewport || !track || !loopSet) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const usingTouchHandlers = isCoarse;

    let rafId = 0;
    let lastTime = 0;
    let speed = 0;
    let activePointerId: number | null = null;
    let hoverPaused = false;
    let interactionPaused = false;
    let ignoreHoverPause = false;
    let interactionSafetyTimer: number | undefined;
    let lastTouchEndTime = 0;
    let pausedSince = 0;
    let lastSaveTime = 0;

    const saveOffset = () => {
      const loop = loopWidthRef.current;
      if (loop <= 0) return;

      try {
        sessionStorage.setItem(
          CAROUSEL_OFFSET_KEY,
          String(offsetRef.current / loop),
        );
      } catch {
        // Ignore storage failures (private mode, quota, etc.).
      }
    };

    const restoreOffset = () => {
      const loop = loopWidthRef.current;
      if (loop <= 0) return;

      try {
        const saved = sessionStorage.getItem(CAROUSEL_OFFSET_KEY);
        if (!saved) return;

        const ratio = parseFloat(saved);
        if (!Number.isFinite(ratio)) return;

        offsetRef.current = ratio * loop;
        normalizeOffset();
        apply();
      } catch {
        // Ignore storage failures.
      }
    };

    const measure = () => {
      const trackStyle = getComputedStyle(track);
      const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0");
      loopWidthRef.current = loopSet.offsetWidth + gap;
      const duration = isCoarse ? MOBILE_AUTO_DURATION_S : AUTO_DURATION_S;
      speed =
        loopWidthRef.current > 0 ? loopWidthRef.current / duration : 0;
    };

    const normalizeOffset = () => {
      const loop = loopWidthRef.current;
      if (loop <= 0) return;

      while (offsetRef.current >= loop) {
        offsetRef.current -= loop;
      }
      while (offsetRef.current < 0) {
        offsetRef.current += loop;
      }
    };

    const apply = () => {
      track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
    };

    const shiftOffset = (delta: number) => {
      offsetRef.current += delta;
      normalizeOffset();
      apply();
    };

    const shouldAutoRun = () => {
      if (dragActiveRef.current || interactionPaused) return false;
      if (ignoreHoverPause) return true;
      return !hoverPaused;
    };

    const resumeAuto = () => {
      interactionPaused = false;
      ignoreHoverPause = true;
      pausedSince = 0;
      lastTime = 0;
    };

    const pauseInteraction = () => {
      interactionPaused = true;
      lastTime = 0;
      if (pausedSince === 0) pausedSince = Date.now();
    };

    const shouldIgnorePointerDown = (pointerType: string) => {
      if (pointerType === "mouse" && isCoarse) return true;
      if (
        pointerType === "mouse" &&
        Date.now() - lastTouchEndTime < SYNTHETIC_MOUSE_GRACE_MS
      ) {
        return true;
      }
      return false;
    };

    const stopTracking = () => {
      document.removeEventListener("pointermove", onDocumentPointerMove);
      document.removeEventListener("pointerup", onDocumentPointerUp);
      document.removeEventListener("pointercancel", onDocumentPointerUp);
      document.removeEventListener("touchmove", onDocumentTouchMove);
      document.removeEventListener("touchend", onDocumentTouchEnd);
      document.removeEventListener("touchcancel", onDocumentTouchEnd);
    };

    const finishInteraction = () => {
      window.clearTimeout(interactionSafetyTimer);
      stopTracking();
      dragActiveRef.current = false;
      activePointerId = null;

      if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
        velocityRef.current = 0;
        resumeAuto();
      }
    };

    const beginInteraction = (id: number, x: number, y: number) => {
      stopTracking();
      activePointerId = id;
      dragActiveRef.current = false;
      suppressClickRef.current = false;
      startXRef.current = x;
      startYRef.current = y;
      lastXRef.current = x;
      velocityRef.current = 0;
      ignoreHoverPause = false;
      pauseInteraction();

      window.clearTimeout(interactionSafetyTimer);
      interactionSafetyTimer = window.setTimeout(() => {
        if (activePointerId === id) {
          finishInteraction();
        }
      }, 4000);
    };

    const moveInteraction = (
      x: number,
      y: number,
      preventDefault?: () => void,
    ) => {
      if (activePointerId === null) return;

      if (!dragActiveRef.current) {
        const totalX = Math.abs(x - startXRef.current);
        const totalY = Math.abs(y - startYRef.current);
        if (totalX > DRAG_THRESHOLD && totalX > totalY) {
          dragActiveRef.current = true;
          suppressClickRef.current = true;
        } else {
          return;
        }
      }

      preventDefault?.();
      const dx = x - lastXRef.current;
      shiftOffset(-dx);
      velocityRef.current = -dx;
      lastXRef.current = x;
    };

    const endInteraction = (id: number, isTouchEnd = false) => {
      if (activePointerId === null || activePointerId !== id) return;

      if (isTouchEnd) {
        lastTouchEndTime = Date.now();
      }

      finishInteraction();
    };

    const onDocumentPointerMove = (event: PointerEvent) => {
      if (activePointerId === null || event.pointerId !== activePointerId) {
        return;
      }
      moveInteraction(event.clientX, event.clientY, () =>
        event.preventDefault(),
      );
    };

    const onDocumentPointerUp = (event: PointerEvent) => {
      endInteraction(event.pointerId, event.pointerType === "touch");
    };

    const onDocumentTouchMove = (event: TouchEvent) => {
      if (activePointerId === null) return;
      const touch = Array.from(event.changedTouches).find(
        (t) => t.identifier === activePointerId,
      );
      if (!touch) return;
      moveInteraction(touch.clientX, touch.clientY, () =>
        event.preventDefault(),
      );
    };

    const onDocumentTouchEnd = (event: TouchEvent) => {
      if (activePointerId === null) return;
      const touch = Array.from(event.changedTouches).find(
        (t) => t.identifier === activePointerId,
      );
      if (!touch) return;
      endInteraction(touch.identifier, true);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (usingTouchHandlers) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (shouldIgnorePointerDown(event.pointerType)) return;

      beginInteraction(event.pointerId, event.clientX, event.clientY);

      document.addEventListener("pointermove", onDocumentPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onDocumentPointerUp);
      document.addEventListener("pointercancel", onDocumentPointerUp);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!usingTouchHandlers) return;
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      beginInteraction(touch.identifier, touch.clientX, touch.clientY);

      document.addEventListener("touchmove", onDocumentTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", onDocumentTouchEnd);
      document.addEventListener("touchcancel", onDocumentTouchEnd);
    };

    const tick = (time: number) => {
      const loop = loopWidthRef.current;

      if (
        interactionPaused &&
        !dragActiveRef.current &&
        Math.abs(velocityRef.current) < MIN_VELOCITY &&
        pausedSince > 0 &&
        Date.now() - pausedSince > STALL_RECOVERY_MS
      ) {
        resumeAuto();
      }

      if (loop > 0 && !dragActiveRef.current) {
        if (Math.abs(velocityRef.current) >= MIN_VELOCITY) {
          shiftOffset(velocityRef.current);
          velocityRef.current *= MOMENTUM_FRICTION;

          if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
            velocityRef.current = 0;
            if (interactionPaused) {
              resumeAuto();
            }
          }

          lastTime = 0;
        } else if (shouldAutoRun()) {
          if (lastTime > 0) {
            const dt = (time - lastTime) / 1000;
            shiftOffset(speed * dt);
          }
          lastTime = time;
        } else {
          lastTime = 0;
        }
      } else {
        lastTime = 0;
      }

      if (time - lastSaveTime >= CAROUSEL_SAVE_INTERVAL_MS) {
        saveOffset();
        lastSaveTime = time;
      }

      rafId = requestAnimationFrame(tick);
    };

    const onClick = (event: MouseEvent) => {
      if (suppressClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }
    };

    const onMouseEnter = () => {
      if (canHover && !ignoreHoverPause) {
        hoverPaused = true;
        lastTime = 0;
      }
    };

    const onMouseLeave = () => {
      if (canHover) {
        hoverPaused = false;
        lastTime = 0;
      }
    };

    measure();
    restoreOffset();
    apply();
    rafId = requestAnimationFrame(tick);

    const onPageHide = () => {
      saveOffset();
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      normalizeOffset();
      apply();
    });
    resizeObserver.observe(loopSet);

    viewport.addEventListener("pointerdown", onPointerDown, true);
    viewport.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: false,
    });
    viewport.addEventListener("click", onClick, true);
    viewport.addEventListener("mouseenter", onMouseEnter);
    viewport.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      saveOffset();
      cancelAnimationFrame(rafId);
      window.clearTimeout(interactionSafetyTimer);
      stopTracking();
      window.removeEventListener("pagehide", onPageHide);
      resizeObserver.disconnect();
      viewport.removeEventListener("pointerdown", onPointerDown, true);
      viewport.removeEventListener("touchstart", onTouchStart, true);
      viewport.removeEventListener("click", onClick, true);
      viewport.removeEventListener("mouseenter", onMouseEnter);
      viewport.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const cardClassName =
    "projects-carousel-card flex shrink-0 flex-col justify-between rounded-2xl p-3 transition duration-300 active:brightness-125 sm:p-4 sm:hover:-translate-y-1 sm:hover:brightness-110";

  return (
    <div className="projects-carousel">
      <div className="projects-carousel-fade">
        <div ref={viewportRef} className="projects-carousel-viewport">
          <div ref={trackRef} className="projects-carousel-track">
            <div ref={loopSetRef} className="projects-carousel-set">
              {projects.map((project) => (
                <ProjectCard
                  key={`loop-a-${project.name}`}
                  project={project}
                  className={cardClassName}
                />
              ))}
            </div>
            <div className="projects-carousel-set" aria-hidden="true" inert>
              {projects.map((project) => (
                <ProjectCard
                  key={`loop-b-${project.name}`}
                  project={project}
                  className={cardClassName}
                  interactive={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
