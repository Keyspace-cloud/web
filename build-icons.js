const path = require('path')
const fs = require('fs')

const IN_DIR = path.resolve(__dirname, './src/icons')
const OUT_DIR = path.resolve(__dirname, './src/icons/icons.json')

const buildIconsObject = (files) => {
  return files
    .map((file) => {
      const name = path.basename(file, '.svg')
      return name
    })
}

console.log(`Getting icons from ${IN_DIR}`)
const svgFiles = fs.readdirSync(IN_DIR).filter((file) => path.extname(file) === '.svg')

console.log(`Building ${OUT_DIR}...`)
const icons = buildIconsObject(svgFiles)

fs.writeFileSync(OUT_DIR, JSON.stringify(icons))