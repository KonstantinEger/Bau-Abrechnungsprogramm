/* eslint-disable @typescript-eslint/naming-convention */
import del from 'rollup-plugin-delete';
import html from 'rollup-plugin-html';
import { join } from 'path';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const production = process.env.BUILD === 'release';
console.log(`Building in ${production ? 'PROD' : 'DEV'} mode...`);

const srcDir = join(__dirname, './app/scripts/src/');
const distDir = join(__dirname, './app/scripts/dist/');

export default {
    input: [
        join(srcDir, 'index.ts'),
        join(srcDir, 'new_material.ts'),
        join(srcDir, 'new_project.ts'),
        join(srcDir, 'new_worker_type.ts')
    ],
    output: {
        format: 'cjs',
        dir: distDir,
        entryFileNames: '[name]-entry.js',
        chunkFileNames: '[name]-chunk-[hash].js',
        sourcemap: production ? false : 'inline'
    },
    plugins: [
        production ? del({
            targets: './app/scripts/dist/*',
            verbose: true
        }) : undefined,
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: !production
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
    external: [
        'fs',
        'electron',
        '@electron/remote'
    ]
};
