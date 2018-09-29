'use strict'

const pinyinUtils = require('pinyin-utils')
const pinyinSplit = require('pinyin-split')
const zhuyin = require('zhuyin')

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
      pinyin: pinyin.split(' ').map(pinyinUtils.numberToMark).join(' ')
    }
    return o
  }, {})
}

const mapDefinitions = defs => {
  return defs.reduce((o, def) => {
    const k = def.pinyin
    o[k] = def

    o[k].pinyin = pinyinUtils.numberToMark(def.pinyin.split(' ')).join(' ')
    o[k].zhuyin = zhuyin(def.pinyin).join(' ')

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

const getByHanzi = hanziDB => query => new Promise((resolve, reject) => {
  hanziDB.get(query, (err, data) => {
    if (err) reject(err)
    else resolve(processData(data))
  })
})

const getIndexByPinyin = (_, pinyinDB) => query => {
  const pinyinList = pinyinUtils.markToNumber(pinyinSplit(query))
  return new Promise((resolve, reject) => {
    pinyinDB.get(pinyinList.join(' ').toLowerCase(), (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
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
  return new Promise((resolve, reject) => {
    hskDB.get(query, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const getByHSK = (hanziDB, _, hskDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const indexByHSK = getIndexByHSK(null, null, hskDB)
  return query => indexByHSK(query)
  .then(list => Promise.all(list.map(byHanzi)))
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
