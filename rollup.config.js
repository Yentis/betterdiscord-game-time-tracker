import nodeResolve from '@rollup/plugin-node-resolve'
import packageJson, { main as outputFile } from './package.json'
import sucrase from '@rollup/plugin-sucrase'
import prettier from 'rollup-plugin-prettier'

const banner = `/**
 * @name ${packageJson.name}
 * @version ${packageJson.version}
 * @description ${packageJson.description}
 * @license ${packageJson.license}
 * @author ${packageJson.author}
 * @authorId ${packageJson.authorId}
 * @website ${packageJson.website}
 * @source ${packageJson.source}
 */`

export default {
  input: 'src/index.ts',
  output: {
    file: outputFile,
    format: 'cjs',
    exports: 'auto',
    interop: 'esModule',
    banner,
  },
  treeshake: 'smallest',
  // These modules already exist in Discord, don't package them
  external: ['electron', 'fs'],
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    sucrase({
      transforms: ['typescript'],
      disableESTransforms: true,
    }),
    prettier({
      parser: 'babel',
      singleQuote: true,
    }),
  ],
}
