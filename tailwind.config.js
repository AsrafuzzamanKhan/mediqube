/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT:'#1a6b3a', light:'#2d9b5a', dark:'#0f4023' } },
      boxShadow: { card:'0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)', hover:'0 4px 12px rgba(0,0,0,.10)' },
    },
  },
  plugins: [],
};
