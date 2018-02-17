const cedict = require('./data/cedict')
const get = require('./lib/get')(cedict)

// TODO: support querying words by the definitions
// const query = require('./lib/query')(cedict)

module.exports = { get }

console.log(JSON.stringify(get('苹果'), null, '    '))
