/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Crimson Text"', 'serif'],
        serif: ['"Crimson Text"', 'serif'],
        display: ['Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif']
      },
      colors: {
        'bb-obsidian': '#00301E',
        'bb-brunswick': '#1C3D2E',
        'bb-gold': '#D4B06A',
        'bb-apricot': '#F5E7C4',
        'bb-tan': '#E9DCBE',
      }
    },
  },
  plugins: [],
}
