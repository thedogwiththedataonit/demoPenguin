const safelist = require('./tailwind-safelist.json');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    ...safelist,
    'dp-overlay',
    'dp-modal',
    'dp-title',
    'dp-text'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts with consuming applications
}
}   