import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            importX.flatConfigs.recommended,
            importX.flatConfigs.typescript,
        ],
        languageOptions: { globals: globals.browser },
        settings: {
            'import-x/resolver': {
                typescript: { project: './tsconfig.app.json' },
                node: true,
            },
        },
        rules: {
            // Impossible to go up directories with "../"
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['../*'],
                            message:
                                'Use the absolute alias "@/..." instead of relative imports.',
                        },
                    ],
                },
            ],
            // Cleans "./foo/../bar" and other similar paths
            'import-x/no-useless-path-segments': [
                'error',
                { noUselessIndex: true },
            ],
            // Detect imports that can't be resolved to a file/module
            'import-x/no-unresolved': 'error',
            // Sort imports in a consistent order, with groups and alphabetization
            'import-x/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'after',
                        },
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
        },
    },
]);
