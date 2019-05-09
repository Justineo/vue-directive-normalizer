const buble = require('rollup-plugin-buble')
const { terser } = require('rollup-plugin-terser')

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    name: 'VueDirectiveNormalizer',
    format: 'umd'
  },
  plugins: [buble(), terser()]
}
