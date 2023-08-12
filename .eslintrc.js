module.exports = {
	env: {
		node: true,
		jest: true,
		browser: true,
		commonjs: true,
		es2021: true,
	},
	extends: 'eslint:recommended',
	overrides: [
		{
			env: {
				node: true,
			},
			files: [
				'.eslintrc.{js,cjs}',
			],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		indent: [
			'error',
			'tab',
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'always',
		],
	},
};
