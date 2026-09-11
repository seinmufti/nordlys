function isVerticallyScrollable(el: HTMLElement | null): el is HTMLElement {
  return !!el && el.scrollHeight - el.clientHeight > 1;
}

export function getScrollContainer(): HTMLElement {
  const doc = document.documentElement;
  const body = document.body;
  const scrolling = (document.scrollingElement ?? doc) as HTMLElement;

  // Desktop locks .phone-device to the viewport. Combined with overflow-x:hidden
  // on body (which computes overflow-y:auto), body becomes the real scroller
  // while document.scrollingElement (html) cannot move.
  if (isVerticallyScrollable(scrolling)) return scrolling;
  if (isVerticallyScrollable(body)) return body;
  if (isVerticallyScrollable(doc)) return doc;
  return scrolling;
}

function getScrollPaddingTop(): number {
  const padding = parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  if (Number.isFinite(padding) && padding > 0) return padding;

  return document.querySelector("header")?.getBoundingClientRect().height ?? 0;
}

function resolveScrollBehavior(
  behavior: ScrollBehavior = "smooth",
): ScrollBehavior {
  if (behavior === "auto") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : behavior;
}

export function getScrollTop(): number {
  return getScrollContainer().scrollTop;
}

export function setScrollTop(
  top: number,
  behavior: ScrollBehavior = "auto",
): void {
  getScrollContainer().scrollTo({
    top: Math.max(0, top),
    behavior: resolveScrollBehavior(behavior),
  });
}

export function scrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
): void {
  const resolvedBehavior = resolveScrollBehavior(behavior);

  if (hash === "#top" || hash === "" || hash === "#") {
    setScrollTop(0, resolvedBehavior);
    return;
  }

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return;

  const container = getScrollContainer();
  const top =
    target.getBoundingClientRect().top +
    container.scrollTop -
    getScrollPaddingTop();

  setScrollTop(top, resolvedBehavior);
}

export function scrollToId(
  id: string,
  behavior: ScrollBehavior = "smooth",
): void {
  scrollToHash(`#${id}`, behavior);

  if (typeof history !== "undefined") {
    history.pushState(null, "", `#${id}`);
  }
}

/** Before opening a hosted project, anchor back navigation to the projects section. */
export function markProjectsReturnPoint(): void {
  if (typeof window === "undefined") return;

  const { pathname } = window.location;
  if (pathname !== "/" && pathname !== "") return;

  history.replaceState(null, "", "#projects");
}
