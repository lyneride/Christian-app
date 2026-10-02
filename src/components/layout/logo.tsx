export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      <rect width="64" height="64" rx="14" fill="currentColor" opacity="0.1" />
      <path
        d="M32 12c-7 0-11 4-12 9v23c0 1.2 1.3 2 2.4 1.4C25 44 28.4 43 32 43s7 1 9.6 2.4c1.1.6 2.4-.2 2.4-1.4V21c-1-5-5-9-12-9z"
        fill="currentColor"
      />
      <path d="M32 14v29" stroke="var(--background)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="26" r="2.6" fill="var(--accent)" />
    </svg>
  );
}
