import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-html';

const commons = {
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        }),
        html({
            include: '**/*.html',
            minifierOptions: {
                collapseWhitespace: true,
                minifyJS: true
            }
        })
    ],
    format: 'cjs',
    externals: [
        'fs',
        'electron',
        '@electron/remote'
    ]
}

export default [
    {
        input: './app/scripts/src/index.ts',
        output: {
            file: './app/scripts/dist/main-bundle.js',
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: './app/scripts/src/new_project.ts',
        output: {
            file: './app/scripts/dist/new-project-bundle.js',
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: './app/scripts/src/new_material.ts',
        output: {
            file: './app/scripts/dist/new-material-bundle.js',
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    },
    {
        input: './app/scripts/src/new_worker_type.ts',
        output: {
            file: './app/scripts/dist/new-worker-bundle.js',
            format: commons.format,
            sourcemap: true
        },
        plugins: commons.plugins,
        external: commons.externals,
    }
]