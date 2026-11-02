/**
 * ESLint flat config — Blitzmire
 *
 * Enforces the CLAUDE.md CODE RULES. Requires ESLint 9+ (flat config only;
 * .eslintrc.* is no longer read). Run with `npm run lint`.
 *
 * Self-contained on purpose: no @eslint/js or globals package dependency,
 * so `npm install` version drift cannot break linting. Browser globals are
 * listed explicitly below — add to BROWSER_GLOBALS as new APIs are used.
 */

const BROWSER_GLOBALS = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  structuredClone: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  fetch: 'readonly',
  location: 'readonly',
  devicePixelRatio: 'readonly',
  Image: 'readonly',
  Audio: 'readonly',
  AudioContext: 'readonly',
  WebSocket: 'readonly',
  URL: 'readonly',
  Blob: 'readonly',
  Event: 'readonly',
  CustomEvent: 'readonly',
  TouchEvent: 'readonly',
  PointerEvent: 'readonly',
  KeyboardEvent: 'readonly',
  ResizeObserver: 'readonly',
  HTMLElement: 'readonly',
  HTMLCanvasElement: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'assets/**', 'public/**'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: BROWSER_GLOBALS,
    },
    rules: {
      // CLAUDE.md #1 — max file length 150 lines (split before hitting it).
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      // CLAUDE.md #10 — max 50 lines per function.
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      // CLAUDE.md #3 — no god classes: keep signatures and branching in check.
      'max-params': ['warn', 5],
      complexity: ['warn', 15],
      'max-depth': ['warn', 4],

      // CLAUDE.md #4 — named exports only.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Named exports only (CLAUDE.md rule #4). No default exports.',
        },
      ],

      // CLAUDE.md #6 — no magic numbers; tuneables belong in src/config/.
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],

      // Baseline correctness (replaces the eslint:recommended preset).
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
    },
  },
  {
    // src/config/ is the sanctioned home for tuneable constants.
    files: ['src/config/**/*.js'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },
];
