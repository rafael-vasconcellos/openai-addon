import * as esbuild from 'esbuild';
import path from 'path';
import _package from './package.json' assert { type: "json" };
import fs from 'fs/promises';


const entryPoints = Object.keys(_package.dependencies).map(dep => 
    path.resolve('node_modules', dep)
);

esbuild.build({
  entryPoints, 
  target: 'ES2021',
  bundle: true,
  minify: false,  // mantém o código legível
  format: 'cjs', 
  outdir: './dist/gemini/lib',
  keepNames: true, // preserva nomes de variáveis/funções
  platform: 'browser', 
  external: ['fsevents', 'node:*'], // Evita que o esbuild tente resolver alguns imports problemáticos

  //sourcemap: true, 
  //splitting: true, 
}).then(() => {
    const src = path.resolve('./package.json');
    const dest = path.resolve('./dist/gemini/package.json');
    return fs.copyFile(src, dest)
});