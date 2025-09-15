/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,svelte}",
    "./overlay.html",
    "./v2/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'baloo': ['"Baloo Tammudu 2"', 'cursive'],
        'comfortaa': ['Comfortaa', 'cursive'],
        'dancing': ['"Dancing Script"', 'cursive'],
        'indie': ['"Indie Flower"', 'cursive'],
        'lato': ['Lato', 'sans-serif'],
        'noto': ['"Noto Sans JP"', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'source': ['"Source Code Pro"', 'monospace'],
        'impact': ['Impact', 'sans-serif'],
        'press': ['"Press Start 2P"', 'monospace'],
        'wallpoet': ['Wallpoet', 'cursive'],
        'segoe': ['"Segoe UI"', 'sans-serif'],
      },
      colors: {
        'chat-bg': 'rgb(34, 34, 34)',
        'form-bg': 'rgb(43, 43, 43)',
        'accent': 'rgb(14, 207, 255)',
        'cheer': 'rgb(189, 98, 255)',
      },
    },
  },
  plugins: [],
}

