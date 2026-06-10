import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  ...nextCoreWebVitals.map((entry) => ({
    ...entry,
    rules: {
      ...(entry.rules || {}),
      'react-hooks/set-state-in-effect': 'off',
    },
  })),
];

export default config;
