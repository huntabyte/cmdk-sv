module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'lastest',
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2024: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		// eslint
		'no-console': 'warn',

		// @typescript-eslint
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}
		],

		// eslint-plugin-svelte
		'svelte/no-target-blank': 'error',
		'svelte/no-immutable-reactive-statements': 'error',
		'svelte/prefer-style-directive': 'error',
		'svelte/no-reactive-literals': 'error',
		'svelte/no-useless-mustaches': 'error',
		// TODO: opt in to these at a later stage
		'svelte/button-has-type': 'off',
		'svelte/require-each-key': 'off',
		'svelte/no-at-html-tags': 'off',
		'svelte/no-unused-svelte-ignore': 'off',
		'svelte/require-stores-init': 'off'
	},
	globals: {
		NodeJS: true,
		$$Generic: 'readable'
	}
};
