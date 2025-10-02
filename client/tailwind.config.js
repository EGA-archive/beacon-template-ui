const config = require("./src/config/config.json");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', "sans-serif"],
      },
      spacing: {
        "logo-w": "132px",
        "logo-w-sm": "120px",
        "logo-h": "38px",
      },
      colors: {
        primary: {
          DEFAULT: config.ui.colors.primary,
        },
        secondary: {
          DEFAULT: config.ui.colors.secondary,
        },
      },
    },
  },
  plugins: [],
};
