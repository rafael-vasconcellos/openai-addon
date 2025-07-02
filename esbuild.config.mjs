import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import { downloadPython, downloadFile } from './python.download.mjs'
//import _package from './package.json' assert { type: "json" };


const distDir = './dist/www/addons/openai/';
const DOWNLOAD_PYTHON = false

const _package = JSON.parse(fs.readFileSync('./package.json'))
const entryPoints = Object.keys(_package.dependencies).map(dep => 
    path.resolve('node_modules', dep)
).filter(dep => !dep.endsWith('openai'));

const build_options = {
    entryPoints, 
    target: 'ES2021',
    bundle: true,
    minify: false,  // mantém o código legível
    format: 'cjs', 
    outdir: distDir + 'lib',
    keepNames: true, // preserva nomes de variáveis/funções
    platform: 'node', 
    external: ['fsevents', 'node:*'], // Evita que o esbuild tente resolver alguns imports problemáticos
    //outExtension: { '.js': '.js' },
    //sourcemap: true, 
    //splitting: true, 
}

const openai_options = {
    ...build_options,
    entryPoints: [ path.resolve('node_modules', 'openai'), path.resolve('node_modules', 'openai/helpers/zod') ],
    platform: 'browser'
};


Promise.all([ esbuild.build(build_options), esbuild.build(openai_options) ])
.then(() => {
    const files = [
        { src: './package.json', dest: distDir + 'package.json' },
        { src: './icon.png', dest: distDir + 'icon.png' },
        { src: './icon.ico', dest: distDir + 'icon.ico' },
    ];

    downloadFile(
        "https://gist.githubusercontent.com/rafael-vasconcellos/6ec7af6c2601e0aa428b1ab727d459ac/raw/36df02e20aba2b3bfe97648309ff96d2ee7b97c2/trans.js", 
        path.resolve("./dist/www/js/trans.js")
    )

    files.forEach(file => {
        fs.copyFile(path.resolve(file.src), path.resolve(file.dest), (err) => {
            if (err) { throw err }
        });
    });

}).then(async() => { 
    if (DOWNLOAD_PYTHON) { downloadPython() }

}).catch(e => console.log(e.stack));


const default_options = {
    entryPoints: ['input.js'], // Seu arquivo de entrada
    format: 'esm',             // Manter como ES Modules (ou 'cjs' para CommonJS)

    bundle: false,             // Não agrupar módulos
    minify: false,             // Não minimizar
    sourcemap: false,          // Sem sourcemaps
    target: ['esnext'],        // Evita transpilações
    keepNames: true,           // Mantém nomes de funções e classes
    treeShaking: false,        // Não remover código não utilizado
    legalComments: 'none',     // Remove comentários automáticos de licenças
    charset: 'utf8',           // Mantém a codificação UTF-8 sem conversões
}

