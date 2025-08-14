// tailwind.config.js
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx,html}',
    ],
    theme: {
      extend: {
        colors: {
          'star-wars-dark': '#1e1e1e',
          'star-wars-light': '#f0f0f0',
          'star-wars-accent': '#ffcc00', // Jaune emblématique de Star Wars
          'star-wars-red': '#ff0000',
          'star-wars-blue': '#0072ff',
        },
      },
    },
    plugins: [],
  }
  