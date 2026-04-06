import starConfig from './eslint/flat.mjs';

export default [
  {
    ignores: ['.claude/', 'dist/', 'node_modules/'],
  },
  ...starConfig({
    typescript: false,
    react: false,
    iac: false,
  }),
];
