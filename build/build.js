#!/usr/bin/env node

'use strict'

const download = require('./download')
const pump = require('pump')
const byline = require('byline')
const path = require('path')
const fs = require('fs')
const PBF = require('pbf')
const through = require('through2')
const reduce = require('through2-reduce')
const encoder = require('../data/mdbg.proto.js')

const PATHS = {
  download: 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip',
  cedict: path.join(__dirname, '../data/cedict_ts.u8'),
  dest: path.join(__dirname, '../data/cedict.bin')
}

const parseLine = (line, _, done) => {
  if (line == '' || /^#/.test(line)) {
    return done()
  }
  line = line.toString('utf8')

  const params = line.slice(0, -1).split('/')
  const mandarin = params[0].slice(0, -1).substr(0, params[0].length - 2).split(' [')
  const translations = params.slice(1)

  const characters = mandarin[0].split(' ')
  const traditional = characters[0]
  const simplified = characters[1]
  const pinyin = mandarin[1].replace(/\u:/g, 'ü')

  done(null, {
    traditional,
    simplified: simplified !== traditional ? traditional : null,
    pinyin,
    translations
  })
}

const reduceLines = (acc, line) => {
  let entry = acc[line.traditional]
  if (!acc[line.traditional]) {
    entry = acc[line.traditional] = {
      traditional: line.traditional,
      simplified: line.simplified,
      definitions: []
    }
  }
  entry.definitions.push({
    pinyin: line.pinyin,
    translations: line.translations
  })
  return acc
}

const encodeEntries = (entries, _, done) => {
  const dict = {entries: []}
  for (let traditional in entries) {
    dict.entries.push(entries[traditional])
  }
  
  const pbf = new PBF()
  encoder.Dict.write(dict, pbf)
  done(null, pbf.finish())
}

const build = file => new Promise((resolve, reject) => {
  pump(
    fs.createReadStream(file),
    byline.createStream(),
    through.obj(parseLine),
    reduce.obj(reduceLines, Object.create(null)),
    through.obj(encodeEntries),
    fs.createWriteStream(PATHS.dest),
    (err) => {
      if (err) reject(err)
      else resolve()
    }
  )
})

download(PATHS.download, PATHS.cedict)
.then(build)
.then(() => {
  console.log('Successfully built cedict.bin')
  fs.unlink(PATHS.cedict, error => {
    // todo: handle error
    console.log('Successfully deleted cedict_ts.u8')
  })
})
.catch((err) => {
  console.error(err)
  process.exitCode = 1
})
