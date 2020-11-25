# MDBG

[![npm version](https://img.shields.io/npm/v/mdbg.svg)](https://www.npmjs.com/package/mdbg)
[![Travis Build Status](https://travis-ci.org/pepebecker/mdbg.svg)](https://travis-ci.org/pepebecker/mdbg)
[![dependency status](https://img.shields.io/david/pepebecker/mdbg.svg)](https://david-dm.org/pepebecker/mdbg)
[![dev dependency status](https://img.shields.io/david/dev/pepebecker/mdbg.svg)](https://david-dm.org/pepebecker/mdbg#info=devDependencies)
[![ISC-licensed](https://img.shields.io/github/license/pepebecker/mdbg.svg)](https://choosealicense.com/licenses/isc/)

## Install

```shell
npm install mdbg
```

## Usage

```js
const mdbg = require('mdbg')

mdbg.get('苹果') // mdbg.getByHanzi('苹果')
.then(console.log)
// {
//   "traditional": "蘋果",
//   "simplified": "苹果",
//   "definitions": {
//     ping2 guo3": {
//       "pinyin": "píng guǒ",
//       "zhuyin": "ㄆㄧㄥˊㄍㄨㄛˇ",
//       "translations": [
//         "apple"
//       ],
//       "classifiers": {
//         "ge4": {
//           "traditional": "個",
//           "simplified": "个",
//           "pinyin": "gè"
//         },
//         "ke1": {
//           "traditional": "顆",
//           "simplified": "颗",
//           "pinyin": "kē"
//         }
//       }
//     }
//   }
// }

mdbg.get('吗') // mdbg.getByHanzi('吗')
.then(console.log)
// {
//   "traditional": "嗎",
//   "simplified": "吗",
//   "definitions": {
//     "ma3": {
//       "pinyin": "mǎ",
//       "zhuyin": "ㄇㄚˇ",
//       "translations": [
//         "see 嗎啡|吗啡, morphine"
//       ]
//     },
//     "ma5": {
//       "pinyin": "ma",
//       "zhuyin": "ㄇㄚ˙",
//       "translations": [
//         "(question particle for \"yes-no\" questions)"
//       ]
//     }
//   }
// }

mdbg.get('wo3') // mdbg.getByPinyin('wo3')
.then(console.log)
// [
//   {
//     "traditional": "我",
//     "simplified": "我",
//     "definitions": {
//       "wo3": {
//         "pinyin": "wǒ",
//         "zhuyin": "ㄨㄛˇ",
//         "translations": [
//           "I",
//           "me",
//           "my"
//         ]
//       }
//     }
//   },
//   {
//     "traditional": "婐",
//     "simplified": "婐",
//     "definitions": {
//       "wo3": {
//         "pinyin": "wǒ",
//         "zhuyin": "ㄨㄛˇ",
//         "translations": [
//           "maid"
//         ]
//       }
//     }
//   }
// ]

mdbg.get('ㄒㄧˇㄏㄨㄢ˙') // mdbg.getByZhuyin('ㄒㄧˇㄏㄨㄢ˙')
// .then(console.log)
// [
//   {
//     "traditional": "喜歡",
//     "simplified": "喜欢",
//     "definitions": {
//       "xi3 huan5": {
//         "pinyin": "xǐ huan",
//         "zhuyin": "ㄒㄧˇㄏㄨㄢ˙",
//         "translations": [
//           "to like",
//           "to be fond of"
//         ]
//       }
//     }
//   }
// ]

mdbg.getIndexByPinyin('shui3')
.then(console.log)
// [ "水", "氵", "氺" ]

mdbg.getIndexByZhuyin('ㄍㄨㄛˇ')
.then(console.log)
// [ "惈", "槨", "猓", "粿", "菓", "蜾", "裹", "輠", "餜" ]
```

## Related

- [`pinyin-utils`](https://github.com/pepebecker/pinyin-utils)
- [`pinyin-split`](https://github.com/pepebecker/pinyin-split)
- [`zhuyin`](https://github.com/pepebecker/zhuyin)
- [`find-hanzi`](https://github.com/pepebecker/find-hanzi)
- [`hsk-words`](https://github.com/pepebecker/hsk-words)
- [`cedict`](https://github.com/pepebecker/cedict)
- [`pinyin-or-hanzi`](https://github.com/pepebecker/pinyin-or-hanzi)
- [`hanzi-to-pinyin`](https://github.com/pepebecker/hanzi-to-pinyin)
- [`pinyin-convert`](https://github.com/pepebecker/pinyin-convert)
- [`pinyin-rest`](https://github.com/pepebecker/pinyin-rest)
- [`pinyin-api`](https://github.com/pepebecker/pinyin-api)
- [`pinyin-bot-core`](https://github.com/pepebecker/pinyin-bot-core)
- [`pinyin-telegram`](https://github.com/pepebecker/pinyin-telegram)
- [`pinyin-messenger`](https://github.com/pepebecker/pinyin-messenger)
- [`pinyin-line`](https://github.com/pepebecker/pinyin-line)
- [`pinyin-chrome`](https://github.com/pepebecker/pinyin-chrome)
- [`pinyin-cli`](https://github.com/pepebecker/pinyin-cli)
- [`hanzi-cli`](https://github.com/pepebecker/hanzi-cli)

## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/pepebecker/mdbg/issues).
