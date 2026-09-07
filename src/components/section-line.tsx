export function SectionLine({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`section-line${className ? ` ${className}` : ""}`}>
      <span className="section-line-dashes" aria-hidden="true" />
      <span className="section-line-label">{label}</span>
    </div>
  );
}
