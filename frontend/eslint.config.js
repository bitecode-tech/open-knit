import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {ignores: ['dist']},
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            'no-unused-vars': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['modules/**/*.{ts,tsx}'],
        ignores: ['modules/_common/**'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: [{
                    name: 'flowbite-react',
                    importNames: ['Button'],
                    message: 'Use @common/components/blocks/GenericButton.tsx in feature modules.',
                }],
            }],
        },
    },
    {
        files: ['modules/**/*.tsx'],
        ignores: [
            'modules/_common/**',
            // These existing controls are specialized chat/OCR or compact row actions.
            'modules/ai/components/chat/user-configurable-chat/chat-provider/components/ChatComposer.tsx',
            'modules/ai/components/chat/user-configurable-chat/chat-provider/components/QuickReplies.tsx',
            'modules/ocr/components/OcrWorkspaceSection.tsx',
            'modules/payment/components/PaymentHistoryTable.tsx',
            'modules/transaction/components/TransactionEventsTable.tsx',
            // This file's table is a compact dataset preview, not a data grid.
            'modules/ai/components/chat/NavbarAiChat.tsx',
        ],
        rules: {
            'no-restricted-syntax': ['error', {
                selector: "JSXOpeningElement[name.name='button']",
                message: 'Use a shared _common button primitive in feature modules, or document why a native control is required.',
            }, {
                selector: "JSXOpeningElement[name.name='table']",
                message: 'Use GenericTable for feature data tables; document specialized semantic table exceptions.',
            }],
        },
    },
)
