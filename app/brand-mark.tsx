export function BrandMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 40 40"
    >
      <rect fill="#08b887" height="40" rx="10" width="40" />
      <path d="M11 27.5 19.8 10h4.3L33 27.5h-5l-1.8-3.8h-9l-1.8 3.8H11Z" fill="#fff" />
      <path d="m19 19.8 2.9-5.8 2.9 5.8H19Z" fill="#08775c" />
      <path d="M27.5 10H33v5.5" stroke="#d6fff2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}
