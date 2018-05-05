'use strict'

const decode = require('cedict/decode')
const fetch = require('node-fetch')
const level = require('level-browserify')
const get = require('./lib/get')

let state = {
  db: null
}

const loadData = (() => {
  if (process.browser) {
    return url => fetch(url || 'https://files.pepebecker.com/cedict/cedict.bin')
    .then(res => res.arrayBuffer())
    .then(decode)
  } else {
    return url => {
      if (url) {
        return fetch(url)
        .then(res => res.arrayBuffer())
        .then(decode)
      } else {
        return Promise.resolve(require('cedict'))
      }
    }
  }
})()

const saveEntry = (db, entry) => new Promise((resolve, reject) => {
  const data = {
    traditional: entry.traditional,
    definitions: [].concat(entry.definitions)
  }

  if (entry.simplified) data.simplified = entry.simplified

  db.put(data.traditional, data, err => {
    if (err) reject(err)
    else {
      if (data.simplified) {
        db.put(data.simplified, data, err => {
          if (err) reject(err)
          else resolve(data)
        })
      } else {
        resolve(data)
      }
    }
  })
})

const importData = (db, data) => {
  return Promise.all(data.map(e => saveEntry(db, e)))
  .then(() => {
    return new Promise((resolve, reject) => {
      db.put('cedict_available', true, err => {
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
    db.get('cedict_available', (err, available) => {
      if (err && err.type === 'NotFoundError') {
        return loadData(url)
        .then(data => importData(db, data))
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

const loadAndGet = query => {
  if (!state.db) {
    return init('cedict_db').then(() => get(state.db, query))
  } else {
    return get(state.db, query)
  }
}

module.exports = {
  init,
  get: loadAndGet
}
