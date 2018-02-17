'use strict'

const search = cedict => (query, max = 0) => {
  const list = []

  for (let key in cedict) {
    const data = cedict[key]

    for (const pinyin in data.d) {
      const defs = data.d[pinyin]
      for (const def of defs) {
        const re = new RegExp('\\b' + query + '\\b')
        if (def.match(re) && !list.includes(key)) {
          if (max > 0 && list.length >= max) {
            return list
          } else {
            list.push(key)
          }
        }
      }
    }
  }

  return list
}

module.exports = search
