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
  pinyins: {}
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
    definitions: [].concat(entry.definitions)
  }

  if (entry.simplified) data.simplified = entry.simplified

  for (const def of data.definitions) {
    const key = def.pinyin.toLowerCase()
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

const init = (dbName, url) => new Promise((resolve, reject) => {
  level(dbName, { valueEncoding: 'json' }, (err, db) => {
    if (err) return reject(err)

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

      if (available) resolve()
      else reject()
    })
  })
})

const createGetter = (getter, ...dbs) => {
  if (state.db) {
    return getter(...dbs.map(db => state[db]))
  } else {
    return query => init('cedict_db').then(() => {
      return getter(...dbs.map(db => state[db]))(query)
    })
  }
}

module.exports = {
  init,
  get: createGetter(get, 'hanziDB', 'pinyinDB'),
  getByHanzi: createGetter(get.byHanzi, 'hanziDB'),
  getByPinyin: createGetter(get.byPinyin, 'hanziDB', 'pinyinDB'),
  getListByPinyin: createGetter(get.listByPinyin, 'pinyinDB')
}

module.exports.getListByPinyin('shui3')
.then(data => {
  console.log(JSON.stringify(data, null, '  '))
})
.catch(console.error)