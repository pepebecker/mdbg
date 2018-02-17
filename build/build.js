#!/usr/bin/env node

'use strict'

const download = require('./download')
const readline = require('readline')
const path = require('path')
const fs = require('fs')

const PATHS = {
  download: 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip',
  cedict: path.join(__dirname, '../data/cedict_ts.u8'),
  json: path.join(__dirname, '../data/cedict.json')
}

const build = file => {
  const data = {}
  const rl = readline.createInterface({
    input: fs.createReadStream(file)
  })
  rl.on('line', line => {
    if (line == '' || /^#/.test(line)) {
      return
    }

    const params = line.slice(0, -1).split('/')
    const mandarin = params[0].slice(0, -1).substr(0, params[0].length - 2).split(' [')
    const definitions = params.slice(1)

    const characters = mandarin[0].split(' ')
    const traditional = characters[0]
    const simplified = characters[1]
    const pinyin = mandarin[1].replace(/\u:/g, 'ü')

    data[simplified] = data[simplified] || {}
    data[simplified].d = data[simplified].d || {}
    data[simplified].d[pinyin] = (data[simplified].d[pinyin] || []).concat(definitions)

    if (simplified !== traditional) {
      data[simplified].t = traditional
      data[traditional] = {
        d: data[simplified].d,
        s: simplified
      }
    }
  })
  rl.on('close', () => {
    fs.writeFile(path.join(__dirname, '../data/cedict.json'), JSON.stringify(data), err => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log('Successfully built cedict.json')
      fs.unlink(PATHS.cedict, error => {
        console.log('Successfully deleted cedict_ts.u8')
      })
    })
  })
}

download(PATHS.download, PATHS.cedict).then(build)
