import autoprefixer from 'autoprefixer'
import nested from 'postcss-nested'

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, nested],
}

export default config
