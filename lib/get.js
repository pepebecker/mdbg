'use strict'

const pinyinUtils = require('pinyin-utils')

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

module.exports = (db, query) => new Promise((resolve, reject) => {
  db.get(query, (err, data) => {
    if (err) reject(err)
    else resolve(processData(data))
  })
})
