# MDBG

[![Greenkeeper badge](https://badges.greenkeeper.io/pepebecker/mdbg.svg)](https://greenkeeper.io/)

[![npm version](https://img.shields.io/npm/v/mdbg.svg)](https://www.npmjs.com/package/mdbg)
[![Travis Build Status](https://travis-ci.org/pepebecker/mdbg.svg)](https://travis-ci.org/pepebecker/mdbg)
[![Coverage Status](https://coveralls.io/repos/github/pepebecker/mdbg/badge.svg)](https://coveralls.io/github/pepebecker/mdbg)
[![dependency status](https://img.shields.io/david/pepebecker/mdbg.svg)](https://david-dm.org/pepebecker/mdbg)
[![dev dependency status](https://img.shields.io/david/dev/pepebecker/mdbg.svg)](https://david-dm.org/pepebecker/mdbg#info=devDependencies)
[![MIT-licensed](https://img.shields.io/github/license/pepebecker/mdbg.svg)](https://opensource.org/licenses/MIT)
[![chat on gitter](https://badges.gitter.im/pepebecker.svg)](https://gitter.im/pepebecker)

## Install

```shell
npm install pepebecker/mdbg
```

## Usage

```js
const mdbg = require('mdbg')
mdbg.get('苹果')
// {
//   "traditional": "蘋果",
//   "simplified": "苹果",
//   "data": {
//     "ping2 guo3": {
//       "mandarin": "píng guó",
//       "definitions": [
//         "apple"
//       ],
//       "classifiers": {
//         "ge4": {
//           "traditional": "個",
//           "simplified": "个",
//           "mandarin": "gè",
//           "definition": "classifier for people or objects in general"
//         },
//         "ke1": {
//           "traditional": "顆",
//           "simplified": "颗",
//           "mandarin": "kē",
//           "definition": "classifier for small spheres, pearls, corn grains, teeth, hearts, satellites etc"
//         }
//       }
//     }
//   }
// }
mdbg.get('嗎')
// {
//   "traditional": "嗎",
//   "simplified": "吗",
//   "data": {
//     "ma3": {
//       "mandarin": "mǎ",
//       "definitions": [
//         "see 嗎啡|吗啡, morphine"
//       ]
//     },
//     "ma5": {
//       "mandarin": "ma",
//       "definitions": [
//         "(question particle for \"yes-no\" questions)"
//       ]
//     }
//   }
// }
```

## Related

- [`pinyin-utils`](https://github.com/pepebecker/pinyin-utils)
- [`pinyin-split`](https://github.com/pepebecker/pinyin-split)
- [`find-hanzi`](https://github.com/pepebecker/find-hanzi)
- [`hsk-words`](https://github.com/pepebecker/hsk-words)
- [`pinyin-or-hanzi`](https://github.com/pepebecker/pinyin-or-hanzi)
- [`hanzi-to-pinyin`](https://github.com/pepebecker/hanzi-to-pinyin)
- [`pinyin-convert`](https://github.com/pepebecker/pinyin-convert)
- [`pinyin-rest`](https://github.com/pepebecker/pinyin-rest)
- [`pinyin-api`](https://github.com/pepebecker/pinyin-api)
- [`pinyin-bot-core`](https://github.com/pepebecker/pinyin-bot-core)
- [`pinyin-telegram`](https://github.com/pepebecker/pinyin-telegram)
- [`pinyin-messenger`](https://github.com/pepebecker/pinyin-messenger)

## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/pepebecker/mdbg/issues).