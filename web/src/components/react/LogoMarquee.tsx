/**
 * Infinite marquee trust strip. Pure CSS animation (animate-marquee) — the list
 * is duplicated so the loop is seamless. Pauses on hover; respects reduced-motion
 * via the `motion-reduce` Tailwind variant.
 */
const items = [
  'Google Business Profile',
  'Local SEO',
  'Google Ads',
  'Meta Ads',
  'Instagram + Facebook',
  'Reviews & Reputation',
  'Websites',
  'Stripe & ACH',
];

export default function LogoMarquee() {
  const row = [...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="flex shrink-0 animate-marquee items-center gap-4 pr-4 motion-reduce:animate-none hover:[animation-play-state:paused]">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted shadow-brand"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
