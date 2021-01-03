import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-html';

const plugins = [
	typescript({
		removeComments: true,
		target: 'ES2017',
		downlevelIteration: true
	}),
	html({
		include: '**/*.html',
		minifierOptions: {
			collapseWhitespace: true,
			minifyJS: true
		}
	})
];

export default [
	{
		input: './app/scripts/src/index.ts',
		output: {
			file: './app/scripts/dist/main-bundle.js',
			format: 'iife'
		},
		plugins
	},
	{
		input: './app/scripts/src/new_project.ts',
		output: {
			file: './app/scripts/dist/new-project-bundle.js',
			format: 'iife'
		},
		plugins
	},
	{
		input: './app/scripts/src/new_material.ts',
		output: {
			file: './app/scripts/dist/new-material-bundle.js',
			format: 'iife'
		},
		plugins
	},
	{
		input: './app/scripts/src/new_worker_type.ts',
		output: {
			file: './app/scripts/dist/new-worker-bundle.js',
			format: 'iife'
		},
		plugins
	}
]