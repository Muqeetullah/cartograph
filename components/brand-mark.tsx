export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M10 11h12M10 11v10m0 0h12m0 0V11M10 11l12 10" stroke="white" strokeWidth="1.5" opacity=".55" />
      <rect x="7.5" y="8.5" width="5" height="5" rx="1.5" fill="white" />
      <rect x="19.5" y="8.5" width="5" height="5" rx="1.5" fill="white" />
      <rect x="7.5" y="18.5" width="5" height="5" rx="1.5" fill="white" />
      <rect x="19.5" y="18.5" width="5" height="5" rx="1.5" fill="white" />
    </svg>
  );
}

export function RepositoryIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 4h12a2 2 0 0 1 2 2v14H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" />
      <path d="M4 16h15M8 8h6M8 11h4" />
    </svg>
  );
}

export function ArrowRight({ className = "size-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}
