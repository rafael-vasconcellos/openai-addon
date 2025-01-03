import * as esbuild from 'esbuild';
import path from 'path';
import _package from './package.json' assert { type: "json" };
import fs from 'fs/promises';


const entryPoints = Object.keys(_package.dependencies).map(dep => 
    path.resolve('node_modules', dep)
);

const distDir = './dist/openai/';


esbuild.build({
  entryPoints, 
  target: 'ES2021',
  bundle: true,
  minify: false,  // mantém o código legível
  format: 'cjs', 
  outdir: distDir + 'lib',
  keepNames: true, // preserva nomes de variáveis/funções
  platform: 'browser', 
  external: ['fsevents', 'node:*'], // Evita que o esbuild tente resolver alguns imports problemáticos

  //sourcemap: true, 
  //splitting: true, 
}).then(() => {
    const files = [
        { src: './package.json', dest: distDir + 'package.json' },
        { src: './icon.png', dest: distDir + 'icon.png' },
        { src: './icon.ico', dest: distDir + 'icon.ico' },
        { src: './src/python/g4f-inference.py', dest: distDir + 'lib' + '/g4f-inference.py' },
        { src: './src/python/requirements.txt', dest: distDir + 'lib' + '/requirements.txt' },
    ];

    files.forEach(file => {
        fs.copyFile(path.resolve(file.src), path.resolve(file.dest));
    });
});