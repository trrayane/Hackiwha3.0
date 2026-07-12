

/**
 * EqualizerGlyph
 * Small decorative three-bar "sound" icon used faintly in the corner of
 * StatCard. Matches the original hand-drawn bar shapes (not a stock icon).
 */
export default function EqualizerGlyph({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="4" height="14" rx="2" />
      <rect x="10" y="4" width="4" height="20" rx="2" />
      <rect x="16" y="14" width="4" height="10" rx="2" />
    </svg>
  );
}