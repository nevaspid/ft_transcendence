// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pressstart: ['"Press Start 2P"', 'cursive'],
        starjout: ['Starjout', 'sans-serif'],
        starjedi: ['Starjedi', 'sans-serif'],
        starjhol: ['Starjhol', 'sans-serif'],
        anakinmono: ['anakinmono', 'monospace'],
      },
      keyframes: {
        neonGlow: {
          '0%':   { borderColor: '#fde047', boxShadow: '0 0 12px 4px rgba(253,224,71,0.6)' },
          '33%':  { borderColor: '#f97316', boxShadow: '0 0 12px 4px rgba(249,115,22,0.6)' },
          '66%':  { borderColor: '#dc2626', boxShadow: '0 0 12px 4px rgba(220,38,38,0.6)' },
          '100%': { borderColor: '#fde047', boxShadow: '0 0 12px 4px rgba(253,224,71,0.6)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        gradient_301: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulse_3011: {
          '0%':   { transform: 'scale(0.75)', boxShadow: '0 0 0 0 rgba(0,0,0,0.7)' },
          '70%':  { transform: 'scale(1)',     boxShadow: '0 0 0 10px rgba(0,0,0,0)' },
          '100%': { transform: 'scale(0.75)',  boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        },
        starfield: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        crawl: {
          '0%': { transform: 'rotateX(40deg) translateY(80%)', opacity: '1' },
          '10%': { opacity: '1' },
          '100%': { transform: 'rotateX(20deg) translateY(-300%)', opacity: '0' },
        },
      },
      animation: {
        neonGlow: 'neonGlow 3s linear infinite',
        orbit5: 'orbit 5s linear infinite',
        orbit8: 'orbit 8s linear infinite',
        orbit10: 'orbit 10s linear infinite',
        animStar: "animStar 60s linear infinite",
        animStarRotate: "animStarRotate 90s linear infinite",
        gradient301: "gradient_301 5s ease infinite",
        pulse3011: "pulse_3011 2s infinite",
        starfield: 'starfield 100s linear infinite',
        crawl: 'crawl 90s linear forwards',
      },
      colors: {
        'star-wars-dark': '#1e1e1e',
        'star-wars-light': '#f0f0f0',
        'star-wars-accent': '#ffcc00', // Jaune emblématique de Star Wars
        'star-wars-red': '#ff0000',
        'star-wars-blue': '#0072ff',
        'cyan-light': 'rgba(0,204,255,0.6)',
        'cyan-dark': 'rgba(0,80,130,0.6)',
      },
    },
  },
  plugins: [],
}

