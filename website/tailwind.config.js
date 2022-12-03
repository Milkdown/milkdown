/* Copyright 2021, Milkdown by Mirone. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**/*.tsx', '**/*.ts'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
