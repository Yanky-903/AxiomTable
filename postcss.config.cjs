// postcss.config.cjs
module.exports = {
  plugins: {
    // Tailwind v4 uses a separate PostCSS wrapper package
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
