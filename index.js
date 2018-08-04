'use strict'

const decode = require('cedict/decode')
const fetch = require('node-fetch')
const level = require('level')
const sublevel = require('sublevel')
const get = require('./lib/get')

let state = {
  db: null,
  hanziDB: null,
  pinyinDB: null,
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

  for (const def of data.definitions) {
    const key = def.pinyin
    state.pinyins[key] = state.pinyins[key] || []
    if (!state.pinyins[key].includes(data.traditional)) {
      state.pinyins[key] = state.pinyins[key].concat(data.traditional)
    }
    if (data.traditional !== data.simplified && state.pinyins[key].includes(data.simplified)) {
      const index = state.pinyins[key].indexOf(data.simplified)
      state.pinyins[key].splice(index, 1)
    }
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

const savePinyinEntry = (db, pinyin, list) => new Promise((resolve, reject) => {
  db.put(pinyin, list, err => {
    if (err) reject(err)
    else resolve()
  })
})

const importData = data => {
  return Promise.all(data.map(e => saveEntry(state.hanziDB, e)))
  .then(() => {
    Promise.all(Object.keys(state.pinyins).map(pinyin => {
      return savePinyinEntry(state.pinyinDB, pinyin, state.pinyins[pinyin])
    }))
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      state.db.put('cedict_available', true, err => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  })
}

const init = (dbName = 'cedict_db', url) => new Promise((resolve, reject) => {
  state.initializing = true
  level(state.dbName || dbName, { valueEncoding: 'json' }, (err, db) => {
    if (err) return reject(err)

    state.dbName = dbName
    state.db = db
    state.hanziDB = sublevel(db, 'hanzi')
    state.pinyinDB = sublevel(db, 'pinyin')

    db.get('cedict_available', (err, available) => {
      if (err && err.type === 'NotFoundError') {
        return loadData(url)
        .then(data => importData(data))
        .then(resolve)
        .catch(reject)
      } else if (err) {
        return reject(err)
      }

      if (available) {
        resolve()
        state.initializing = false
        for (const callback of state.afterInitialized) {
          callback()
        }
        state.afterInitialized = []
      }
      else reject()
    })
  })
})

const createGet = async (getter, query) => {
  if (state[getter.name]) return state[getter.name](query)
  else {
    if (!state.hanziDB || !state.pinyinDB) {
      if (state.initializing) {
        await new Promise((resolve, reject) => state.afterInitialized.push(resolve))
      } else await init()
    }
    state[getter.name] = getter(state.hanziDB, state.pinyinDB)
    return state[getter.name](query)
  }
}

module.exports = {
  init,
  get: query => createGet(get, query),
  getByHanzi: query => createGet(get.byHanzi, query),
  getByPinyin: query => createGet(get.byPinyin, query),
  getByZhuyin: query => createGet(get.byZhuyin, query),
  getIndexByPinyin: query => createGet(get.indexByPinyin, query),
  getIndexByZhuyin: query => createGet(get.indexByZhuyin, query)
}
