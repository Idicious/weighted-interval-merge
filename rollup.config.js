import babel from 'rollup-plugin-babel';

// rollup.config.js
export default {
  input: 'index.js',
  output: {
    file: 'dist/weighted-interval-merge.js',
    format: 'umd',
    name: 'intervalMerge',
    exports: 'named'
  },
  plugins: [
    babel(),
  ]
};