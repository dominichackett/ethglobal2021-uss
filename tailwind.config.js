const colors = require('tailwindcss/colors')

module.exports = {

  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "my-green":
        {
          light:"#00DE8E",
          DEFAULT: "#4cbf4a",
          alt:"#00B9A3",
          alt2: "#8CB485",
          alt3:"#DDF8D7",
          alt4:"#514e7f",
          alt5: "#004B75",
          alt6:"#497BA9"
         },

         cyan: colors.cyan,

      },

    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active', 'disabled'],
    textColor: ['responsive', 'hover', 'focus', 'active', 'disabled'],
    extend: {
      // ...
     opacity: ['disabled'],
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),


  ],
}
