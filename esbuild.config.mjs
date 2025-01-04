import * as esbuild from 'esbuild';
import path from 'path';
import _package from './package.json' assert { type: "json" };
import fs from 'fs';
import { downloadFile, unzipFile } from './python.download.mjs';
//import { unzip } from 'zlib';


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
    ];

    files.forEach(file => {
        fs.copyFile(path.resolve(file.src), path.resolve(file.dest), (err) => {
            if (err) { throw err }
        });
    });

}).then(async() => { 
    const packageURL = 'https://www.python.org/ftp/python/3.8.10/python-3.8.10-embed-amd64.zip'
    const outputDirPath = path.resolve('./python')
    const outputZipPath = path.resolve('./python', 'python-3.8.10-embed-amd64.zip');
    if (!fs.existsSync(outputZipPath)) { 
        if (!fs.existsSync(outputDirPath)) {  fs.mkdirSync(outputDirPath); }
        await downloadFile(packageURL, outputZipPath); 
    }
    unzipFile(outputZipPath, path.resolve(distDir, 'lib', 'python'));

}).catch(e => console.log(e.stack));