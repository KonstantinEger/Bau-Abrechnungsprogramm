import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-html';
import { terser } from 'rollup-plugin-terser';
import { join } from 'path';

const production = process.env.BUILD === 'release';
console.log(`Building in ${production ? 'PROD' : 'DEV'} mode...`);

const commons = {
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        }),
        html({
            include: '**/*.html',
            htmlMinifierOptions: {
                collapseWhitespace: production,
                minifyJS: production
            }
        }),
        production ? terser() : undefined
    ],
    format: 'cjs',
    externals: [
        'fs',
        'electron',
        '@electron/remote'
    ]
};

const srcDir = join(__dirname, './app/scripts/src/');
const distDir = join(__dirname, './app/scripts/dist/');

export default [
    {
        input: join(srcDir, 'index.ts'),
        output: {
            file: join(distDir, 'main-bundle.js'),
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: join(srcDir, 'new_project.ts'),
        output: {
            file: join(distDir, 'new-project-bundle.js'),
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: join(srcDir, 'new_material.ts'),
        output: {
            file: join(distDir, 'new-material-bundle.js'),
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: join(srcDir, 'new_worker_type.ts'),
        output: {
            file: join(distDir, 'new-worker-bundle.js'),
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    }
]