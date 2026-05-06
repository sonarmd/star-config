import starConfig from './eslint/flat.mjs';

export default [
  {
    ignores: ['.claude/', '.agent/', 'dist/', 'node_modules/', 'scripts/', 'security/', 'quality/'],
  },
  ...starConfig({
    typescript: false,
    react: false,
    iac: false,
  }),
];
