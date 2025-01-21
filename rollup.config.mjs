import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const peerDeps = Object.keys(pkg.peerDependencies || {});

const preserveUseClient = () => ({
    name: 'preserve-use-client',
    transform(code, id) {
        const useClientPattern = /^['"]use client['"];?\r?\n/;
        const hasUseClient = useClientPattern.test(code);

        if (hasUseClient) {
            const codeWithoutDirective = code.replace(useClientPattern, '');
            return {
                code: "'use client';\n" + codeWithoutDirective,
                map: null
            };
        }
        return null;
    }
});

export default {
    input: 'src/index.ts',
    output: [
        {
            dir: 'dist',
            format: 'esm',
            sourcemap: true,
            exports: 'named',
            preserveModules: false,
            entryFileNames: 'index.mjs',
            banner: "'use client';"
        },
        {
            dir: 'dist',
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
            preserveModules: false,
            entryFileNames: 'index.cjs',
            banner: "'use client';"
        }
    ],
    external: [
        ...peerDeps,
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@radix-ui\/./, 
        /^framer-motion\/./, 
    ],
    plugins: [
        preserveUseClient(),
        postcss({
            config: false,
            plugins: [
                tailwindcss('./tailwind.config.js'),
                autoprefixer()
            ],
            extract: false, // Change to false to inject CSS
            modules: false,
            minimize: true,
            inject: true, // Change to true to inject CSS into JS
            // Ensure CSS is included in the bundle
            onwarn: (warning, warn) => {
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
                warn(warning);
            }
        }),
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            preferBuiltins: true
        }),
        commonjs({
            include: 'node_modules/',
            requireReturnsDefault: 'auto'
        }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: 'dist/types',
            outDir: 'dist',
            exclude: ['/.test.tsx', '**/.test.ts', '/*.stories.tsx']
        }),
        babel({
            exclude: 'node_modules/',
            babelHelpers: 'bundled',
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            presets: [
                '@babel/preset-react',
                '@babel/preset-typescript',
                ['@babel/preset-env', { targets: { node: 'current' } }]
            ]
        })
    ]
};