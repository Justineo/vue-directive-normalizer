const buble = require('@rollup/plugin-buble')
const { terser } = require('rollup-plugin-terser')

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    {
      file: 'dist/index.umd.js',
      name: 'VueDirectiveNormalizer',
      format: 'umd'
    }
  ],
  plugins: [buble(), terser()]
}
