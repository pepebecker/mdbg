'use strict'

const { numberToMark, markToNumber } = require('pinyin-utils')
const { split: splitPinyin } = require('pinyin-split')
const { fromPinyin } = require('zhuyin')
const { promisify } = require('util')

const mapClassifiers = classifiers => {
  classifiers = classifiers.reduce((list, cls) => {
    return list.concat(cls.substr(3).split(','))
  }, [])
  return classifiers.reduce((o, cl) => {
    const parts = cl.split('[')
    const characters = parts[0].split('|')
    const pinyin = parts[1].split(']')[0]
    o[pinyin] = {
      traditional: characters[0],
      simplified: characters[1],
      pinyin: pinyin.split(' ').map(numberToMark).join(' ')
    }
    return o
  }, {})
}

const mapDefinitions = defs => {
  return defs.reduce((o, def) => {
    const k = def.pinyin
    o[k] = def

    o[k].pinyin = numberToMark(def.pinyin.split(' ')).join(' ')
    o[k].zhuyin = fromPinyin(def.pinyin).join(' ')

    const classifiers = def.translations.filter(eng => eng.substr(0, 3) === 'CL:')
    o[k].translations = def.translations.filter(eng => !classifiers.includes(eng))
    if (classifiers.length > 0) def.classifiers = mapClassifiers(classifiers)

    return o
  }, {})
}

const processData = data => {
  data.simplified = data.simplified || data.traditional
  data.definitions = mapDefinitions(data.definitions)
  return data
}

const getByHanzi = hanziDB => {
  const get = (query, split) => new Promise((resolve, reject) => {
    hanziDB.get(query, async (err, data) => {
      if (err && err.type == 'NotFoundError' && split) {
        const list = []
        let index = 0
        while (index < query.length) {
          let count = query.length - index
          while (count >= 0) {
            const word = query.substr(index, count)
            try {
              const entry = await get(word)
              index += count - 1
              list.push(entry)
              break
            } catch (err) {
              if (err.type !== 'NotFoundError') console.error(err)
            }
            count--
          }
          index ++
        }
        resolve(list)
      }
      else if (err) reject(err)
      else resolve(processData(data))
    })
  })
  return get
}

const getIndexByPinyin = (_, pinyinDB) => query => {
  const pinyinList = markToNumber(splitPinyin(query))
  return promisify(pinyinDB.get.bind(pinyinDB))(pinyinList.join(' ').toLowerCase())
}

const getByPinyin = (hanziDB, pinyinDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const indexByPinyin = getIndexByPinyin(null, pinyinDB)
  return query => indexByPinyin(query)
  .then(list => Promise.all(list.map(byHanzi)))
}

const getIndexByZhuyin = (_, pinyinDB) => query => {
  const indexByPinyin = getIndexByPinyin(null, pinyinDB)
  return indexByPinyin(zhuyin.toPinyin(query, { numbered: true }))
}

const getByZhuyin = (hanziDB, pinyinDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const indexByZhuyin = getIndexByZhuyin(null, pinyinDB)
  return query => indexByZhuyin(query)
  .then(list => Promise.all(list.map(byHanzi)))
}

const getIndexByHSK = (_, __, hskDB) => query => {
  return promisify(hskDB.get.bind(hskDB))(query)
}

const getByHSK = (hanziDB, _, hskDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const indexByHSK = getIndexByHSK(null, null, hskDB)
  return query => indexByHSK(query)
  .then(list => Promise.all(list.map(item => byHanzi(item, true))))
}

module.exports = (hanziDB, pinyinDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const byPinyin = getByPinyin(hanziDB, pinyinDB)
  const byZhuyin = getByZhuyin(hanziDB, pinyinDB)
  return query => byHanzi(query)
  .catch(err => {
    if (err.type === 'NotFoundError' && query) {
      return byPinyin(query)
    } else {
      return err
    }
  })
  .catch(err => {
    if (err.type === 'NotFoundError' && query) {
      return byZhuyin(query)
    } else {
      return err
    }
  })
}

module.exports.byHanzi = getByHanzi
module.exports.byPinyin = getByPinyin
module.exports.byZhuyin = getByZhuyin
module.exports.byHSK = getByHSK
module.exports.indexByPinyin = getIndexByPinyin
module.exports.indexByZhuyin = getIndexByZhuyin
module.exports.indexByHSK = getIndexByHSK
