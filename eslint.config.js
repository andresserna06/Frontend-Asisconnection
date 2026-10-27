// https://docs.expo.dev/guides/using-eslint/
const fs = require('node:fs');
const path = require('node:path');

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

// Architecture rules from AGENTS.md (sections 3 and 4), checked on every lint.
const MODULES = fs
  .readdirSync(path.join(__dirname, 'src/modules'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const OTHER_MODULE_INTERNALS = {
  message: 'Use the other module only through its index.ts (@/modules/<name>).',
};

// What each layer of a module must not import.
const LAYER_PATTERNS = {
  ui: [
    {
      group: ['@/modules/*/services', '@/modules/*/services/**', '**/services/**'],
      message: 'ui asks application for data; it never uses services directly.',
    },
  ],
  application: [],
  domain: [
    {
      group: ['react', 'react-native', 'expo', 'expo-*', '@expo/*', '@/shared/ui/**'],
      message: 'domain is pure TypeScript: no React, React Native or Expo.',
    },
    {
      group: [
        '@/modules/*/ui/**',
        '@/modules/*/application/**',
        '@/modules/*/services/**',
        '../ui/**',
        '../application/**',
        '../services/**',
      ],
      message: 'domain does not import the other layers.',
    },
  ],
  services: [
    {
      group: ['@/modules/*/ui/**', '@/modules/*/application/**', '@/shared/ui/**'],
      message: 'services only call the backend; no UI or hooks.',
    },
  ],
};

function moduleConfigs(moduleName) {
  const boundary = {
    group: ['@/modules/*/**', `!@/modules/${moduleName}/**`],
    ...OTHER_MODULE_INTERNALS,
  };
  const layers = Object.entries(LAYER_PATTERNS).map(([layer, patterns]) => ({
    files: [`src/modules/${moduleName}/${layer}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ['error', { patterns: [boundary, ...patterns] }] },
  }));
  const root = {
    files: [`src/modules/${moduleName}/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ['error', { patterns: [boundary] }] },
  };
  return [root, ...layers];
}

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
  {
    // The shared HTTP client is the only place that calls fetch.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/lib/http/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use the HttpClient from @/shared/lib/http in services/.' },
      ],
    },
  },
  {
    // Routes only compose screens: no styles, no module internals.
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['StyleSheet'],
              message: 'Routes have no styles: build the screen inside its module.',
            },
          ],
          patterns: [{ group: ['@/modules/*/**'], ...OTHER_MODULE_INTERNALS }],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/modules/**'], message: 'shared never imports modules.' }] },
      ],
    },
  },
  {
    files: ['src/shared/ui/atoms/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/modules/**'], message: 'shared never imports modules.' },
            {
              group: [
                '@/shared/ui/molecules/**',
                '@/shared/ui/organisms/**',
                '@/shared/ui/templates/**',
                '../molecules/**',
                '../organisms/**',
                '../templates/**',
              ],
              message: 'An atom only uses other atoms.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/ui/molecules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/modules/**'], message: 'shared never imports modules.' },
            {
              group: [
                '@/shared/ui/organisms/**',
                '@/shared/ui/templates/**',
                '../organisms/**',
                '../templates/**',
              ],
              message: 'A molecule only uses atoms and molecules.',
            },
          ],
        },
      ],
    },
  },
  ...MODULES.flatMap(moduleConfigs),
]);
