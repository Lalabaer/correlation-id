import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default [
    eslint.configs.recommended,
    {
        ignores: ['dist/**', 'coverage/**', '.yarn/**', '.pnp.*'],
    },
    ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] })),
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            import: importPlugin,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',

            'import/no-default-export': 'error',
            'import/no-useless-path-segments': 'error',

            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'no-restricted-syntax': [
                'error',
                {
                    selector: 'VariableDeclaration[kind="let"]',
                    message: 'Do not use `let`. Use `const`, and mutate an object property when state must change.',
                },
            ],

            'padding-line-between-statements': [
                'error',
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['if', 'for', 'while', 'do', 'switch', 'try'],
                },
                { blankLine: 'always', prev: 'block-like', next: '*' },
                { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'expression' },
                { blankLine: 'always', prev: 'expression', next: 'return' },
            ],
        },
    },
    {
        files: ['vitest.config.ts'],
        rules: {
            'import/no-default-export': 'off',
        },
    },
    eslintConfigPrettier,
]
