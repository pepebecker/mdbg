'use strict'

const Pbf = require('pbf')
const fs = require('fs')
const path = require('path')
const decoder = require('./data/mdbg.proto.js')

// const entries = require('./data/cedict')

let data = fs.readFileSync(path.join(__dirname, 'data', 'cedict.bin'))
const { entries } = decoder.Dict.read(new Pbf(data))
data = null

const get = require('./lib/get')(entries)

// TODO: support querying words by the definitions
// const query = require('./lib/query')(entries)

module.exports = { get }
