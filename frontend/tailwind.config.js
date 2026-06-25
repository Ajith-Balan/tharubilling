/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {fontFamily: {
      'barlow': ['Barlow Condensed', 'sans-serif'],
      'playfair': ['Playfair Display', 'serif'],
      'roboto': ['Roboto', 'sans-serif'],
      'space-grotesk': ['Space Grotesk', 'sans-serif'],
    },},
  },
  plugins: [ require('tailwind-scrollbar'),],
}

