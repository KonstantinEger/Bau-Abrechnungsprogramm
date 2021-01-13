import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-html';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import { join } from 'path';

const production = process.env.BUILD === 'release';
console.log(`Building in ${production ? 'PROD' : 'DEV'} mode...`);

const srcDir = join(__dirname, './app/scripts/src/');
const distDir = join(__dirname, './app/scripts/dist/');

export default {
    input: [
        join(srcDir, 'index.ts'),
        join(srcDir, 'new_material.ts'),
        join(srcDir, 'new_project.ts'),
        join(srcDir, 'new_worker_type.ts'),
    ],
    output: {
        format: 'cjs',
        dir: distDir,
        entryFileNames: '[name]-entry.js',
        chunkFileNames: '[name]-chunk-[hash].js',
        sourcemap: true
    },
    plugins: [
        del({
            targets: './app/scripts/dist/*',
            verbose: true
        }),
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
    external: [
        'fs',
        'electron',
        '@electron/remote'
    ]
};
