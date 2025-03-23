import { defineConfig } from 'vitest/config';


export default defineConfig({ 
    cacheDir: '.vitest',
    resolve: { 
        extensions: ['.js', '.ts', '.json'],
    },
    build: { 
      /* commonjsOptions: { 
          transformMixedEsModules: true,
          extensions: ['.js'],
          include: ".js",
      },
      rollupOptions: { 
          output: { 
              format: 'commonjs',
              //amd: { forceJsExtensionForImports: true }, 
          }, 
      } */
    },
    //define, // global constants
    //esbuild: { //format: 'cjs', platform: 'node', }, //platform, tsconfigRaw 
});
