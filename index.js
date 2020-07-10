'use strict'

const decode = require('cedict/decode')
const hsk = require('cedict/hsk')
const fetch = require('node-fetch')
const sublevel = require('sublevel')
const level = require('level-party')
const get = require('./lib/get')

let state = {
  db: null,
  hanziDB: null,
  pinyinDB: null,
  hskDB: null,
  pinyins: {},
  initializing: false,
  afterInitialized: []
}

const loadData = url => {
  if (url) {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(decode)
  } else {
    return Promise.resolve(require('cedict'))
  }
}

const saveEntry = (db, entry) => new Promise((resolve, reject) => {
  const data = {
    traditional: entry.traditional,
    definitions: [].concat(entry.definitions.map(def => {
      def.pinyin = def.pinyin.toLowerCase()
      return def
    }))
  }

  if (entry.simplified) data.simplified = entry.simplified
  if (entry.hsk > 0) data.hsk = entry.hsk

  for (const def of data.definitions) {
    state.pinyins[def.pinyin] = state.pinyins[def.pinyin] || {}
    state.pinyins[def.pinyin][data.simplified || data.traditional] = data.hsk
  }

  db.put(data.traditional, data, err => {
    if (err) reject(err)
    else {
      if (data.simplified) {
        db.put(data.simplified, data, err => {
          if (err) reject(err)
          else resolve()
        })
      } else {
        resolve()
      }
    }
  })
})

const savePinyinEntry = (db, pinyin, data) => new Promise((resolve, reject) => {
  const list = Object.keys(data).sort((a, b) => {
    if (data[a]) {
      if (data[b]) return data[a] - data[b]
      return -1
    } else return 1
  })
  db.put(pinyin, list, err => {
    if (err) reject(err)
    else resolve()
  })
})

const saveHSKEntry = (db, lvl, list) => new Promise((resolve, reject) => {
  db.put(lvl, list, err => {
    if (err) reject(err)
    else resolve()
  })
})

const importData = data => {
  return Promise.all(data.map(e => saveEntry(state.hanziDB, e)))
  .then(() => {
    return Promise.all(Object.keys(state.pinyins).map(pinyin => {
      return savePinyinEntry(state.pinyinDB, pinyin, state.pinyins[pinyin])
    }))
  })
  .then(() => Promise.all(hsk.map((list, i) => saveHSKEntry(state.hskDB, i + 1, list))))
  .then(() => {
    return new Promise((resolve, reject) => {
      state.db.put('cedict_available', true, err => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  })
}

const checkCedictAvailable = db => new Promise((resolve, reject) => {
  db.get('cedict_available', (err, value) => {
    if (err) {
      if (err.type === 'NotFoundError') resolve(false)
      else reject(err)
    }
    else resolve(value)
  })
})

const init = async (db = 'cedict_db', url) => {
  state.initializing = true
  if (state.db) {
    if (!state.hanziDB) state.hanziDB = sublevel(state.db, 'hanzi')
    if (!state.pinyinDB) state.pinyinDB = sublevel(state.db, 'pinyin')
    if (!state.hskDB) state.hskDB = sublevel(state.db, 'hsk')
    if (await checkCedictAvailable(state.db)) return state.db
  } else {
    if (typeof db === 'string') state.db = await level(db, { valueEncoding: 'json' })
    else state.db = db
    if (!state.hanziDB) state.hanziDB = sublevel(state.db, 'hanzi')
    if (!state.pinyinDB) state.pinyinDB = sublevel(state.db, 'pinyin')
    if (!state.hskDB) state.hskDB = sublevel(state.db, 'hsk')
    if (await checkCedictAvailable(state.db)) return state.db
  }

  const data = await loadData(url)
  await importData(data)
  state.initializing = false
  state.afterInitialized.forEach(cb => cb())
  state.afterInitialized = []
  return state.db
}

const createGet = async (getter, query) => {
  if (state[getter.name]) return state[getter.name](query)
  else {
    if (!state.hanziDB || !state.pinyinDB || !state.hskDB) {
      if (state.initializing) {
        await new Promise((resolve, reject) => state.afterInitialized.push(resolve))
      } else await init()
    }
    state[getter.name] = getter(state.hanziDB, state.pinyinDB, state.hskDB)
    return state[getter.name](query)
  }
}

module.exports = {
  init,
  get: query => createGet(get, query),
  getByHanzi: query => createGet(get.byHanzi, query),
  getByPinyin: query => createGet(get.byPinyin, query),
  getByZhuyin: query => createGet(get.byZhuyin, query),
  getByHSK: query => createGet(get.byHSK, query),
  getIndexByPinyin: query => createGet(get.indexByPinyin, query),
  getIndexByZhuyin: query => createGet(get.indexByZhuyin, query),
  getIndexByHSK: query => createGet(get.indexByHSK, query)
}
