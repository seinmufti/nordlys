export function getScrollContainer(): HTMLElement | null {
  return document.querySelector(".phone-screen");
}

function getHeaderOffset(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 0;
}

export function scrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
): void {
  const container = getScrollContainer();
  if (!container) return;

  if (hash === "#top" || hash === "" || hash === "#") {
    container.scrollTo({ top: 0, behavior });
    return;
  }

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return;

  const headerOffset = getHeaderOffset();
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const top =
    container.scrollTop +
    targetRect.top -
    containerRect.top -
    headerOffset;

  container.scrollTo({
    top: Math.max(0, top),
    behavior,
  });
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
