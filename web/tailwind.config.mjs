/** @type {import('tailwindcss').Config} */
// Brand tokens mirrored from the legacy /styles.css :root block so new React
// islands match the existing design (accent #2563eb, Inter, 12px radius, soft shadow).
export default {
  // Only scan our source; Tailwind utilities are used exclusively by new components.
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  // Preflight is disabled via @astrojs/tailwind applyBaseStyles:false (no global reset).
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563eb', // --accent
          hover: '#1d4ed8', // --accent-hover
          light: '#dbeafe', // --accent-light
        },
        ink: '#1a1a2e', // --text
        muted: '#64748b', // --text-secondary
        line: '#e2e8f0', // --border
        surface: '#f8fafc', // --bg-secondary
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px', // --radius
        xl2: '20px', // --radius-lg
      },
      boxShadow: {
        brand: '0 4px 20px rgba(0, 0, 0, 0.08)', // --shadow
        'brand-lg': '0 10px 40px rgba(0, 0, 0, 0.12)', // --shadow-lg
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) scale(1.1)' },
          '66%': { transform: 'translate(-4%, 4%) scale(0.95)' },
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        spotlight: 'spotlight 2s ease 0.75s 1 forwards',
      },
    },
  },
  plugins: [],
};
