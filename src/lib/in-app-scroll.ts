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

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const top =
    container.scrollTop +
    targetRect.top -
    containerRect.top -
    getHeaderOffset();

  container.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToId(
  id: string,
  behavior: ScrollBehavior = "smooth",
): void {
  scrollToHash(`#${id}`, behavior);
}
