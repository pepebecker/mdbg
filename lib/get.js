'use strict'

const pinyinUtils = require('pinyin-utils')
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

const mapDefinitions = async defs => {
  return defs.reduce(async (promise, def) => {
    const o = await promise
    const k = def.pinyin
    o[k] = def

    o[k].pinyin = pinyinUtils.numberToMark(def.pinyin.split(' ')).join(' ')
    o[k].zhuyin = (await zhuyin(def.pinyin)).join('')

    const classifiers = def.translations.filter(eng => eng.substr(0, 3) === 'CL:')
    o[k].translations = def.translations.filter(eng => !classifiers.includes(eng))
    if (classifiers.length > 0) def.classifiers = mapClassifiers(classifiers)

    return o
  }, Promise.resolve({}))
}

const processData = async data => {
  data.simplified = data.simplified || data.traditional
  data.definitions = await mapDefinitions(data.definitions)
  return data
}

const getByHanzi = (hanziDB, _) => query => new Promise((resolve, reject) => {
  hanziDB.get(query, (err, data) => {
    if (err) reject(err)
    else resolve(processData(data))
  })
})

const getListByPinyin = (_, pinyinDB) => query => new Promise((resolve, reject) => {
  pinyinDB.get(query, (err, data) => {
    if (err) reject(err)
    else resolve(data)
  })
})

const getByPinyin = (hanziDB, pinyinDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const listByPinyin = getListByPinyin(null, pinyinDB)
  return query => listByPinyin(query)
  .then(list => Promise.all(list.map(byHanzi)))
}

module.exports = (hanziDB, pinyinDB) => {
  const byHanzi = getByHanzi(hanziDB)
  const byPinyin = getByPinyin(hanziDB, pinyinDB)
  return query => byHanzi(query).catch(err => {
    if (err.type === 'NotFoundError' && query) {
      return byPinyin(query)
    } else {
      return err
    }
  })
}

module.exports.byHanzi = getByHanzi
module.exports.byPinyin = getByPinyin
module.exports.listByPinyin = getListByPinyin
