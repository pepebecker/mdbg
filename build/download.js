'use strict'

const path = require('path')
const execSync = require('child_process').execSync

module.exports = async (url, file) => {
  console.log('Prepare CEDICT Directory')
  execSync(`mkdir -p ${path.dirname(file)}`)

  console.log('Downloading CEDICT Archive')
  execSync(`curl -sL ${url} > ${file}.zip`)

  console.log('Unpacking CEDICT Archive')
  execSync(`unzip -np ${file}.zip > ${file}`)

  console.log('Cleaning up')
  execSync(`rm -rf ${file}.zip`)

  return file
}
