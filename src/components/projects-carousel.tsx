"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { projects, type Project, getProjectLink } from "@/data/projects";

const ADVANCE_MS = 3000;
const SLIDE_MS = 350;
const SWIPE_THRESHOLD = 48;
const SWIPE_LINK_THRESHOLD = 12;
const TAP_THRESHOLD = 10;
const SWIPE_SUPPRESS_MS = 300;
const LOOP_COPIES = 3;

function ProjectCardContent({ project }: { project: Project }) {
  return (
    <>
      <span className="text-[10px] tracking-[0.2em] text-muted uppercase sm:text-xs sm:tracking-[0.22em]">
        {project.tag}
      </span>

      <div className="projects-carousel-card-image flex min-h-0 flex-1 flex-col">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 30vw"
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
  isActive,
  cardRef,
  shouldSuppressClick,
}: {
  project: Project;
  isActive: boolean;
  cardRef: (node: HTMLAnchorElement | null) => void;
  shouldSuppressClick: () => boolean;
}) {
  return (
    <a
      ref={cardRef}
      href={getProjectLink(project)}
      draggable={false}
      onClick={(event) => {
        if (shouldSuppressClick()) {
          event.preventDefault();
          return;
        }
        if (window.matchMedia("(pointer: coarse)").matches) {
          event.preventDefault();
          window.location.assign(getProjectLink(project));
        }
      }}
      className={`projects-carousel-card flex shrink-0 flex-col justify-between rounded-2xl p-3 sm:p-4${
        isActive ? " is-active" : ""
      }`}
    >
      <ProjectCardContent project={project} />
    </a>
  );
}

export function ProjectsCarousel() {
  const projectCount = projects.length;
  const loopProjects = useMemo(
    () =>
      Array.from({ length: LOOP_COPIES }, () => projects).flat(),
    [],
  );
  const middleStart = projectCount;

  const [trackIndex, setTrackIndex] = useState(middleStart);
  const [translateX, setTranslateX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [autoKey, setAutoKey] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const didSwipeRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const pressedLinkRef = useRef<HTMLAnchorElement | null>(null);
  const lastSwipeTimeRef = useRef(0);
  const blockedNavigationRef = useRef(false);
  const trackIndexRef = useRef(trackIndex);
  const isSnappingRef = useRef(false);
  const hasPositionedRef = useRef(false);

  const logicalIndex =
    ((trackIndex % projectCount) + projectCount) % projectCount;

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  const centerOnIndex = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (!viewport || !track || !card) return 0;

    const sidePad = Math.max(0, viewport.clientWidth / 2 - card.offsetWidth / 2);
    track.style.paddingLeft = `${sidePad}px`;
    track.style.paddingRight = `${sidePad}px`;

    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const nextTranslate = cardCenter - viewport.clientWidth / 2;
    setTranslateX(nextTranslate);
    return nextTranslate;
  }, []);

  const normalizeTrackIndex = useCallback(
    (index: number) => {
      if (index >= projectCount * 2) {
        return index - projectCount;
      }
      if (index < projectCount) {
        return index + projectCount;
      }
      return index;
    },
    [projectCount],
  );

  const navigateBy = useCallback((delta: number) => {
    setDragOffset(0);
    setTransitionEnabled(true);
    setTrackIndex((current) => current + delta);
    lastSwipeTimeRef.current = Date.now();
    setPaused(false);
    setAutoKey((key) => key + 1);
  }, []);

  useLayoutEffect(() => {
    centerOnIndex(trackIndex);
    setDragOffset(0);

    if (!hasPositionedRef.current) {
      hasPositionedRef.current = true;
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setIsReady(true);
      });
    }

    if (isSnappingRef.current) {
      isSnappingRef.current = false;
      trackRef.current?.classList.remove("is-snapping");
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    }
  }, [trackIndex, centerOnIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      centerOnIndex(trackIndexRef.current);
      setDragOffset(0);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [centerOnIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== "transform") return;

      const index = trackIndexRef.current;
      const normalized = normalizeTrackIndex(index);
      if (normalized === index) return;

      isSnappingRef.current = true;
      track.classList.add("is-snapping");
      setTransitionEnabled(false);
      setTrackIndex(normalized);
    };

    track.addEventListener("transitionend", onTransitionEnd);
    return () => track.removeEventListener("transitionend", onTransitionEnd);
  }, [normalizeTrackIndex]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || paused || isInteracting || !isReady) return;

    const timer = window.setInterval(() => {
      setTrackIndex((current) => current + 1);
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, autoKey, isInteracting, isReady]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const stopTracking = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };

    const finishDrag = (openLink = false) => {
      viewport.classList.remove("is-dragging");
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setTransitionEnabled(true);
      stopTracking();

      if (openLink && pressedLinkRef.current && !blockedNavigationRef.current) {
        window.location.assign(pressedLinkRef.current.href);
      }
      pressedLinkRef.current = null;
    };

    const releaseVerticalScroll = () => {
      blockedNavigationRef.current = true;
      didSwipeRef.current = true;
      viewport.classList.remove("is-dragging");
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setTransitionEnabled(true);
      setDragOffset(0);
      stopTracking();
      pressedLinkRef.current = null;
      setIsInteracting(false);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (
        activePointerIdRef.current === null ||
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      const dx = event.clientX - dragStartXRef.current;
      const dy = event.clientY - dragStartYRef.current;

      if (
        !isDraggingRef.current &&
        Math.abs(dy) > TAP_THRESHOLD &&
        Math.abs(dy) > Math.abs(dx)
      ) {
        releaseVerticalScroll();
        return;
      }

      if (!isDraggingRef.current) {
        const threshold = pressedLinkRef.current
          ? SWIPE_LINK_THRESHOLD
          : SWIPE_THRESHOLD / 3;
        if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) {
          return;
        }
        isDraggingRef.current = true;
        viewport.classList.add("is-dragging");
      }

      event.preventDefault();
      didSwipeRef.current = true;
      setDragOffset(-dx);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (
        activePointerIdRef.current === null ||
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      const dx = event.clientX - dragStartXRef.current;
      const dy = event.clientY - dragStartYRef.current;
      const offset = -dx;
      const isTap = Math.hypot(dx, dy) < TAP_THRESHOLD;
      const shouldOpenLink =
        Boolean(pressedLinkRef.current) &&
        isTap &&
        !didSwipeRef.current &&
        !blockedNavigationRef.current;

      if (isDraggingRef.current) {
        if (offset > SWIPE_THRESHOLD) {
          navigateBy(1);
        } else if (offset < -SWIPE_THRESHOLD) {
          navigateBy(-1);
        } else {
          setDragOffset(0);
        }
        finishDrag(false);
      } else if (
        isTap &&
        !didSwipeRef.current &&
        !blockedNavigationRef.current
      ) {
        const rect = viewport.getBoundingClientRect();
        const tapX = event.clientX - rect.left;
        const leftZone = rect.width * 0.33;
        const rightZone = rect.width * 0.67;

        if (pressedLinkRef.current?.classList.contains("is-active")) {
          finishDrag(true);
        } else if (pressedLinkRef.current) {
          const linkRect = pressedLinkRef.current.getBoundingClientRect();
          const linkCenter = linkRect.left + linkRect.width / 2 - rect.left;
          navigateBy(linkCenter < rect.width / 2 ? -1 : 1);
          finishDrag(false);
        } else if (tapX < leftZone) {
          navigateBy(-1);
          finishDrag(false);
        } else if (tapX > rightZone) {
          navigateBy(1);
          finishDrag(false);
        } else {
          finishDrag(false);
        }
      } else {
        finishDrag(shouldOpenLink);
      }

      const hadManualSwipe = didSwipeRef.current;
      setIsInteracting(false);

      if (hadManualSwipe || Date.now() - lastSwipeTimeRef.current < 50) {
        setPaused(false);
        setAutoKey((key) => key + 1);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const target = event.target;
      pressedLinkRef.current =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a.projects-carousel-card")
          : null;

      activePointerIdRef.current = event.pointerId;
      dragStartXRef.current = event.clientX;
      dragStartYRef.current = event.clientY;
      didSwipeRef.current = false;
      blockedNavigationRef.current = false;
      isDraggingRef.current = false;
      setTransitionEnabled(false);
      setIsInteracting(true);

      document.addEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

    viewport.addEventListener("pointerdown", onPointerDown);

    return () => {
      stopTracking();
      viewport.removeEventListener("pointerdown", onPointerDown);
    };
  }, [navigateBy]);

  const shouldSuppressClick = () =>
    blockedNavigationRef.current ||
    Date.now() - lastSwipeTimeRef.current < SWIPE_SUPPRESS_MS;

  return (
    <div
      className={`projects-carousel${isReady ? " is-ready" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="projects-carousel-fade">
        <div ref={viewportRef} className="projects-carousel-viewport">
          <div
            ref={trackRef}
            className="projects-carousel-track projects-carousel-track--spotlight"
            style={{
              transform: `translate3d(-${translateX + dragOffset}px, 0, 0)`,
              transitionDuration: transitionEnabled ? `${SLIDE_MS}ms` : "0ms",
            }}
          >
            {loopProjects.map((project, index) => (
              <ProjectCard
                key={`loop-${index}-${project.name}`}
                project={project}
                isActive={index % projectCount === logicalIndex}
                shouldSuppressClick={shouldSuppressClick}
                cardRef={(node) => {
                  cardRefs.current[index] = node;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
