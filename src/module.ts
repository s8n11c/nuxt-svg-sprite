import path from 'node:path'
import fs from 'node:fs'
import { defineNuxtModule, addComponent } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  inputDir: string
  outputFile: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'svg-sprite',
    configKey: 'svgSprite',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    inputDir: 'assets/icons',
    outputFile: 'public/sprite.svg',
  },
  setup(options, nuxt) {
    // check if the inputDir exists
    if (!fs.existsSync(path.resolve(nuxt.options.srcDir, options.inputDir))) {
      console.log(`The input directory ${options.inputDir} does not exist`)
      return
    }

    const inputDir = path.resolve(nuxt.options.srcDir, options.inputDir)
    const outputFile = path.resolve(nuxt.options.rootDir, options.outputFile)

    // Function to generate the sprite
    const generateSprite = () => {
      const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.svg'))
      // if there is no svg files, do nothing
      if (files.length === 0) {
        console.warn('No SVG files found in the input directory')
        return
      }

      const symbols = files.map((file) => {
        const content = fs.readFileSync(path.join(inputDir, file), 'utf-8')
        const id = path.basename(file, '.svg')
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/)
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'
        const contentMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)
        const innerContent = contentMatch ? contentMatch[1] : ''
        return `<symbol id="${id}" viewBox="${viewBox}">${innerContent}</symbol>`
      })
      const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
${symbols.join('\n')}
</svg>`
      fs.writeFileSync(outputFile, spriteContent)
    }

    // Generate sprite initially
    generateSprite()

    // Watch for changes in development
    if (nuxt.options.dev) {
      nuxt.hook('builder:watch', async (event, file) => {
        if (file.startsWith(inputDir)) {
          generateSprite()
        }
      })
    }

    // Add public file to static assets
    nuxt.hook('nitro:config', (config) => {
      config.publicAssets = config.publicAssets || []
      config.publicAssets.push({
        dir: path.dirname(outputFile),
        maxAge: 31536000,
      })
    })

    // Add svg component to Nuxt app
    addComponent({
      name: 'SvgIcon',
      filePath: path.resolve(__dirname, './runtime/components/SvgIcon.vue'),
    })
  },
})
