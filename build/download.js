'use strict'

const exec = require('child_process').exec

const pExec = cmd => new Promise((resolve, reject) => {
  exec(cmd, err => {
    if (err) reject(err)
    else resolve()
  })
})

module.exports = async (url, file) => {
  console.log('Downloading CEDICT Archive')
  await pExec(`curl -sL ${url} > ${file}.zip`)

  console.log('Unpacking CEDICT Archive')
  await pExec(`unzip -np ${file}.zip > ${file}`)

  console.log('Cleaning up')
  await pExec(`rm -rf ${file}.zip`)

  return file
}
