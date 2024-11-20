import * as esbuild from 'esbuild';
import path from 'path';
import _package from './package.json' assert { type: "json" };


const entryPoints = Object.keys(_package.dependencies).map(dep => 
    path.resolve('node_modules', dep)
);

esbuild.build({
  entryPoints, 
  bundle: true,
  minify: false,  // mantém o código legível
  format: 'cjs', 
  outdir: './dist/lib',
  keepNames: true, // preserva nomes de variáveis/funções
  sourcemap: true,
  platform: 'browser', 

  //splitting: true,
  // Evita que o esbuild tente resolver alguns imports problemáticos
  external: ['fsevents', 'node:*'],
})