import {
  SiGooglemaps,
  SiYelp,
  SiNextdoor,
  SiMeta,
  SiFacebook,
  SiInstagram,
  SiFoursquare,
  SiApple,
  SiTripadvisor,
  SiThumbtack
} from 'react-icons/si';
import { FaSearch, FaShieldAlt, FaTools, FaHome, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Infinite marquee trust strip. Pure CSS animation (animate-marquee) — the list
 * is duplicated so the loop is seamless. Pauses on hover; respects reduced-motion
 * via the `motion-reduce` Tailwind variant.
 */
const items = [
  { name: 'Google Maps (GBP)', icon: SiGooglemaps, color: 'text-[#4285F4]' },
  { name: 'Локальное SEO', icon: FaMapMarkerAlt, color: 'text-[#EA4335]' },
  { name: 'Yelp', icon: SiYelp, color: 'text-[#FF1A1A]' },
  { name: 'Nextdoor', icon: SiNextdoor, color: 'text-[#8ED500]' },
  { name: 'Meta Ads', icon: SiMeta, color: 'text-[#0468FF]' },
  { name: 'Facebook', icon: SiFacebook, color: 'text-[#1877F2]' },
  { name: 'Instagram', icon: SiInstagram, color: 'text-[#E4405F]' },
  { name: 'Bing', icon: FaSearch, color: 'text-[#00809D]' },
  { name: 'Foursquare', icon: SiFoursquare, color: 'text-[#F94877]' },
  { name: 'BBB', icon: FaShieldAlt, color: 'text-[#005A9C]' },
  { name: 'Apple Maps', icon: SiApple, color: 'text-gray-800' },
  { name: 'TripAdvisor', icon: SiTripadvisor, color: 'text-[#34E0A1]' },
  { name: 'Thumbtack', icon: SiThumbtack, color: 'text-[#0096FF]' },
  { name: 'Angi', icon: FaTools, color: 'text-[#E52D27]' },
  { name: 'HomeAdvisor', icon: FaHome, color: 'text-[#F47920]' },
];

export default function LogoMarquee() {
  const row = [...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="flex shrink-0 animate-marquee items-center gap-4 pr-4 motion-reduce:animate-none hover:[animation-play-state:paused]">
        {row.map((item, i) => {
          const Icon = item.icon;
          return (
            <span
              key={`${item.name}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted shadow-brand"
            >
              <Icon className={`h-4 w-4 ${item.color}`} />
              {item.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
