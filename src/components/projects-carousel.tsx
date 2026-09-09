"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { projects, type Project, type ProjectDevice, getProjectLink } from "@/data/projects";
import {
  getScrollContainer,
  markProjectsReturnPoint,
} from "@/lib/in-app-scroll";

const ADVANCE_MS = 6000;
const AUTO_ADVANCE_ENABLED = true;
const SLIDE_MS = 350;
const SWIPE_THRESHOLD = 48;
const SWIPE_THRESHOLD_COARSE = 36;
const SWIPE_LINK_THRESHOLD = 12;
const TAP_THRESHOLD = 10;
const SWIPE_SUPPRESS_MS = 300;
const LOOP_COPIES = 3;

function MobileDeviceIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

function DesktopDeviceIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function ProjectCardDevices({ devices }: { devices?: ProjectDevice[] }) {
  if (!devices?.length) {
    return <div className="projects-carousel-card-devices" aria-hidden="true" />;
  }

  const visibleDevices = devices.filter(
    (device): device is ProjectDevice =>
      device === "mobile" || device === "desktop",
  );

  return (
    <div
      className={`projects-carousel-card-devices${
        visibleDevices.length === 1 ? " projects-carousel-card-devices--single" : ""
      }`}
    >
      {visibleDevices.map((device) => (
        <div key={device} className="projects-carousel-card-device-slot">
          {device === "mobile" ? (
            <MobileDeviceIcon className="projects-carousel-card-device-icon" />
          ) : (
            <DesktopDeviceIcon className="projects-carousel-card-device-icon" />
          )}
        </div>
      ))}
    </div>
  );
}

const DESCRIPTION_SLOT_COUNT = 6;

function ProjectCardDescription({ project }: { project: Project }) {
  const summary = project.description?.paragraphs[0];
  if (!summary) return null;

  return (
    <div className="projects-carousel-card-description">
      <p className="projects-carousel-card-description-paragraph">{summary}</p>
    </div>
  );
}

function ProjectCardContent({ project }: { project: Project }) {
  return (
    <>
      <div
        className={`projects-carousel-card-image w-full shrink-0${
          project.image ? "" : " projects-carousel-card-image--placeholder"
        }`}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 30vw"
            unoptimized
            className="object-cover object-center"
            draggable={false}
          />
        ) : (
          <span
            className="projects-carousel-card-image-skeleton"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="projects-carousel-card-meta shrink-0">
        <div className="projects-carousel-card-title-row">
          <p className="projects-carousel-card-name">{project.name}</p>
          <div className="projects-carousel-card-title-side">
            <span className="projects-carousel-card-category">{project.tag}</span>
            <ProjectCardDevices devices={project.devices} />
          </div>
        </div>
        <div className="projects-carousel-card-body">
          {project.description ? (
            <ProjectCardDescription project={project} />
          ) : (
            <p className="projects-carousel-card-tagline">{project.tagline}</p>
          )}
        </div>
      </div>
    </>
  );
}

function ProjectCard({
  project,
  isActive,
  cardRef,
  shouldSuppressClick,
  showAutoProgress,
  autoProgressPaused,
  autoProgressKey,
}: {
  project: Project;
  isActive: boolean;
  cardRef: (node: HTMLAnchorElement | null) => void;
  shouldSuppressClick: () => boolean;
  showAutoProgress?: boolean;
  autoProgressPaused?: boolean;
  autoProgressKey?: string;
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
        markProjectsReturnPoint();
        if (window.matchMedia("(pointer: coarse)").matches) {
          event.preventDefault();
          window.location.assign(getProjectLink(project));
        }
      }}
      className={`projects-carousel-card flex shrink-0 flex-col justify-start rounded-2xl${
        isActive ? " is-active" : ""
      }`}
      style={{ "--project-accent": project.accent } as CSSProperties}
    >
      <div className="projects-carousel-card-surface flex min-h-0 flex-1 flex-col justify-start overflow-hidden rounded-2xl">
        <ProjectCardContent project={project} />
        <div
          className="projects-carousel-card-progress"
          aria-hidden={showAutoProgress ? undefined : true}
        >
          {showAutoProgress ? (
            <div
              key={autoProgressKey}
              className={`projects-carousel-card-progress-fill${
                autoProgressPaused ? " is-paused" : ""
              }`}
              style={{ animationDuration: `${ADVANCE_MS}ms` }}
            />
          ) : null}
        </div>
      </div>
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
  const [reducedMotion, setReducedMotion] = useState(false);
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
  const pendingScrollUnlockRef = useRef(false);
  const scrollUnlockTimerRef = useRef<number | null>(null);
  const normalizeFallbackTimerRef = useRef<number | null>(null);
  const lockedScrollTopRef = useRef(0);

  const clearScrollUnlockTimer = useCallback(() => {
    if (scrollUnlockTimerRef.current !== null) {
      window.clearTimeout(scrollUnlockTimerRef.current);
      scrollUnlockTimerRef.current = null;
    }
  }, []);

  const preventLockedScroll = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const pinLockedScroll = useCallback(() => {
    const container = getScrollContainer();
    if (!container?.classList.contains("is-carousel-scroll-locked")) return;

    if (container.scrollTop !== lockedScrollTopRef.current) {
      container.scrollTop = lockedScrollTopRef.current;
    }
  }, []);

  const unlockCarouselScroll = useCallback(() => {
    const container = getScrollContainer();
    pendingScrollUnlockRef.current = false;
    clearScrollUnlockTimer();

    if (!container) return;

    container.classList.remove("is-carousel-scroll-locked");
    container.removeEventListener("scroll", pinLockedScroll);
    container.removeEventListener("wheel", preventLockedScroll);
    container.removeEventListener("touchmove", preventLockedScroll);
  }, [clearScrollUnlockTimer, pinLockedScroll, preventLockedScroll]);

  const lockCarouselScroll = useCallback(() => {
    const container = getScrollContainer();
    if (!container) return;

    lockedScrollTopRef.current = container.scrollTop;
    container.classList.add("is-carousel-scroll-locked");
    container.addEventListener("scroll", pinLockedScroll, { passive: true });
    container.addEventListener("wheel", preventLockedScroll, { passive: false });
    container.addEventListener("touchmove", preventLockedScroll, { passive: false });

    clearScrollUnlockTimer();
    scrollUnlockTimerRef.current = window.setTimeout(() => {
      pendingScrollUnlockRef.current = false;
      unlockCarouselScroll();
    }, SLIDE_MS + 500);
  }, [
    clearScrollUnlockTimer,
    pinLockedScroll,
    preventLockedScroll,
    unlockCarouselScroll,
  ]);

  const logicalIndex =
    ((trackIndex % projectCount) + projectCount) % projectCount;

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

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

  const clearNormalizeFallback = useCallback(() => {
    if (normalizeFallbackTimerRef.current !== null) {
      window.clearTimeout(normalizeFallbackTimerRef.current);
      normalizeFallbackTimerRef.current = null;
    }
  }, []);

  const applyNormalizeIfNeeded = useCallback(() => {
    const index = trackIndexRef.current;
    const normalized = normalizeTrackIndex(index);
    if (normalized === index) return false;

    isSnappingRef.current = true;
    trackRef.current?.classList.add("is-snapping");
    setTransitionEnabled(false);
    setTrackIndex(normalized);
    return true;
  }, [normalizeTrackIndex]);

  const scheduleNormalizeFallback = useCallback(() => {
    clearNormalizeFallback();
    normalizeFallbackTimerRef.current = window.setTimeout(() => {
      normalizeFallbackTimerRef.current = null;
      applyNormalizeIfNeeded();
    }, SLIDE_MS + 80);
  }, [clearNormalizeFallback, applyNormalizeIfNeeded]);

  const navigateBy = useCallback(
    (delta: number) => {
      setDragOffset(0);
      setTransitionEnabled(true);
      setTrackIndex((current) => current + delta);
      lastSwipeTimeRef.current = Date.now();
      setPaused(false);
      setAutoKey((key) => key + 1);
      lockCarouselScroll();
      pendingScrollUnlockRef.current = true;
      scheduleNormalizeFallback();
    },
    [lockCarouselScroll, scheduleNormalizeFallback],
  );

  useLayoutEffect(() => {
    if (trackIndex >= loopProjects.length) {
      isSnappingRef.current = true;
      trackRef.current?.classList.add("is-snapping");
      setTransitionEnabled(false);
      setTrackIndex(normalizeTrackIndex(trackIndex));
      return;
    }

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
  }, [trackIndex, centerOnIndex, loopProjects.length, normalizeTrackIndex]);

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

      if (pendingScrollUnlockRef.current) {
        unlockCarouselScroll();
      }

      clearNormalizeFallback();
      applyNormalizeIfNeeded();
    };

    track.addEventListener("transitionend", onTransitionEnd);
    return () => {
      track.removeEventListener("transitionend", onTransitionEnd);
      clearNormalizeFallback();
    };
  }, [applyNormalizeIfNeeded, clearNormalizeFallback, unlockCarouselScroll]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || !AUTO_ADVANCE_ENABLED || paused || isInteracting || !isReady) return;

    const timer = window.setInterval(() => {
      navigateBy(1);
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, autoKey, isInteracting, isReady, navigateBy]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const stopTracking = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };

    const releasePointer = () => {
      const pointerId = activePointerIdRef.current;
      if (pointerId === null) return;

      try {
        if (viewport.hasPointerCapture(pointerId)) {
          viewport.releasePointerCapture(pointerId);
        }
      } catch {
        // Pointer may already be released on touch devices.
      }
    };

    const finishDrag = (openLink = false) => {
      viewport.classList.remove("is-dragging");
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setTransitionEnabled(true);
      stopTracking();
      releasePointer();

      if (wasDragging) {
        pendingScrollUnlockRef.current = true;
      } else if (!pendingScrollUnlockRef.current) {
        unlockCarouselScroll();
      }

      if (openLink && pressedLinkRef.current && !blockedNavigationRef.current) {
        markProjectsReturnPoint();
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
      releasePointer();
      pressedLinkRef.current = null;
      setIsInteracting(false);
      unlockCarouselScroll();
    };

    const getSwipeThreshold = () =>
      window.matchMedia("(pointer: coarse)").matches
        ? SWIPE_THRESHOLD_COARSE
        : SWIPE_THRESHOLD;

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
        lockCarouselScroll();
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
        const swipeThreshold = getSwipeThreshold();
        if (offset > swipeThreshold) {
          navigateBy(1);
        } else if (offset < -swipeThreshold) {
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

      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers reject capture on certain touch targets.
      }

      document.addEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

    viewport.addEventListener("pointerdown", onPointerDown, { capture: true });

    return () => {
      stopTracking();
      viewport.removeEventListener("pointerdown", onPointerDown, { capture: true });
      unlockCarouselScroll();
    };
  }, [navigateBy, lockCarouselScroll, unlockCarouselScroll, clearScrollUnlockTimer]);

  const shouldSuppressClick = () =>
    blockedNavigationRef.current ||
    Date.now() - lastSwipeTimeRef.current < SWIPE_SUPPRESS_MS;

  const activeProject = projects[logicalIndex];
  const activeDescriptionTail =
    activeProject.description?.paragraphs.slice(1) ?? [];
  const activeDescriptionItems = activeDescriptionTail.flatMap((block) =>
    block.split(/\n\n+/).filter(Boolean),
  );
  const descriptionSlots = Array.from(
    { length: DESCRIPTION_SLOT_COUNT },
    (_, index) => activeDescriptionItems[index] ?? null,
  );

  const autoProgressKey = `${logicalIndex}-${autoKey}`;
  const autoProgressPaused = paused || isInteracting;
  const showAutoProgress =
    AUTO_ADVANCE_ENABLED && isReady && !reducedMotion;

  return (
    <div className="projects-carousel-shell">
      <div
        className={`projects-carousel${isReady ? " is-ready" : ""}`}
        onMouseEnter={() => {
          if (window.matchMedia("(pointer: fine)").matches) return;
          setPaused(true);
        }}
        onMouseLeave={() => {
          if (window.matchMedia("(pointer: fine)").matches) return;
          setPaused(false);
        }}
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
                  isActive={index === trackIndex}
                  shouldSuppressClick={shouldSuppressClick}
                  showAutoProgress={
                    showAutoProgress && index === trackIndex
                  }
                  autoProgressPaused={autoProgressPaused}
                  autoProgressKey={autoProgressKey}
                  cardRef={(node) => {
                    cardRefs.current[index] = node;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="projects-description-card"
        style={{ "--project-accent": activeProject.accent } as CSSProperties}
      >
        <ul className="projects-description-card-list">
          {descriptionSlots.map((item, index) => (
            <li
              key={`${logicalIndex}-${index}`}
              className={`projects-description-card-list-item${
                item ? "" : " is-placeholder"
              }`}
              aria-hidden={item ? undefined : true}
            >
              {item ?? "\u00a0"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
