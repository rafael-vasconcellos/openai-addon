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
    const package_src = path.resolve('./package.json');
    const package_dest = path.resolve('./dist/gemini/package.json');
    const icon_src = path.resolve('./icon.png');
    const icon_dest = path.resolve('./dist/gemini/icon.png');
    fs.copyFile(package_src, package_dest)
    fs.copyFile(icon_src, icon_dest)
});