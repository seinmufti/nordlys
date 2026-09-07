const BRAID_WIDTH = 420;
const BRAID_HEIGHT = 56;
const BRAID_CYCLES = 2.25;
const BRAID_AMPLITUDE = 10;
const BRAID_CENTER_Y = 28;
const BRAID_SEGMENTS = 12;

const STRANDS = [
  { className: "section-braid-strand--green", phase: 0 },
  { className: "section-braid-strand--navy", phase: (2 * Math.PI) / 3 },
  { className: "section-braid-strand--purple", phase: (4 * Math.PI) / 3 },
] as const;

function strandY(x: number, phase: number) {
  return (
    BRAID_CENTER_Y +
    BRAID_AMPLITUDE *
      Math.sin((BRAID_CYCLES * 2 * Math.PI * x) / BRAID_WIDTH + phase)
  );
}

function segmentPath(strandIndex: number, startX: number, endX: number) {
  const phase = STRANDS[strandIndex].phase;
  const step = (endX - startX) / 8;
  let path = `M ${startX.toFixed(2)} ${strandY(startX, phase).toFixed(2)}`;

  for (let x = startX + step; x <= endX + 0.01; x += step) {
    const clampedX = Math.min(x, endX);
    path += ` L ${clampedX.toFixed(2)} ${strandY(clampedX, phase).toFixed(2)}`;
  }

  return path;
}

function buildBraidSegments() {
  const segmentWidth = BRAID_WIDTH / BRAID_SEGMENTS;
  const segments: Array<{ strandIndex: number; d: string; className: string }> =
    [];

  for (let segment = 0; segment < BRAID_SEGMENTS; segment += 1) {
    const startX = segment * segmentWidth;
    const endX = (segment + 1) * segmentWidth;
    const midX = (startX + endX) / 2;

    const drawOrder = [0, 1, 2].sort(
      (a, b) => strandY(midX, STRANDS[a].phase) - strandY(midX, STRANDS[b].phase),
    );

    for (const strandIndex of drawOrder) {
      segments.push({
        strandIndex,
        className: STRANDS[strandIndex].className,
        d: segmentPath(strandIndex, startX, endX),
      });
    }
  }

  return segments;
}

const BRAID_SEGMENTS_DATA = buildBraidSegments();

export function SectionBraid() {
  return (
    <div className="section-braid" aria-hidden="true">
      <svg
        className="section-braid-svg"
        viewBox={`0 0 ${BRAID_WIDTH} ${BRAID_HEIGHT}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {BRAID_SEGMENTS_DATA.map((segment, index) => (
          <path
            key={`${segment.strandIndex}-${index}`}
            className={`section-braid-strand ${segment.className}`}
            d={segment.d}
            pathLength={100}
          />
        ))}
      </svg>
    </div>
  );
}
