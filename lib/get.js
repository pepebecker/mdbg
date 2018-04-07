'use strict'

const pinyinUtils = require('pinyin-utils')

const get = cedict => key => {
  let entry = cedict[key]
  if (!entry) return
  
  entry = JSON.parse(JSON.stringify(entry))

  const mapClassifiers = cls => {
    cls = cls.substr(3).split(',')
    return cls.reduce((o, cl) => {
      const parts = cl.split('[')
      const characters = parts[0].split('|')
      const pinyin = parts[1].split(']')[0]
      o[pinyin] = {
        traditional: characters[0],
        simplified: characters[1],
        mandarin: pinyin.split(' ').map(pinyinUtils.numberToMark).join(' '),
        definition: cedict[characters[0]].d[pinyin].find(def => def.substr(0, 14) === 'classifier for')
      }
      return o
    }, {})
  }

  const mapDefinitions = defs => {
    for (key in defs) {
      const d = {}
      const classifiers = defs[key].find(def => def.substr(0, 3) === 'CL:')
      d.mandarin = key.split(' ').map(pinyinUtils.numberToMark).join(' ')
      d.definitions = defs[key].filter(def => def !== classifiers)
      if (classifiers) {
        d.classifiers = mapClassifiers(classifiers)
      }
      defs[key] = d
    }
    return defs
  }

  const data = {
    traditional: entry.t || key,
    simplified: entry.s || key,
    data: mapDefinitions(entry.d)
  }

  return data
}

module.exports = get
