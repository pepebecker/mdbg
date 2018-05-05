'use strict'

const mdbg = require('../index')

describe('我 should be the same in both forms', () => {
	it('should have the traditional hanzi 我', () => {
		return mdbg.get('我')
		.then(data => data.traditional.should.equal('我'))
	})
	it('should have the simplified hanzi 我', () => {
		return mdbg.get('我')
		.then(data => data.simplified.should.equal('我'))
	})
})

describe('门 should have 2 different forms', () => {
	it('should have the traditional hanzi 門', () => {
		return mdbg.get('门')
		.then(data => data.traditional.should.equal('門'))
	})
	it('should have the simplified hanzi 门', () => {
		return mdbg.get('門')
		.then(data => data.simplified.should.equal('门'))
	})
})

describe('喜欢 should have the correct pinyin', () => {
	it('喜 should have the 3rd tone', () => {
		return mdbg.get('喜')
		.then(data => data.definitions['xi3'].pinyin.should.equal('xǐ'))
	})
	it('欢 should have the 1st tone', () => {
		return mdbg.get('欢')
		.then(data => data.definitions['huan1'].pinyin.should.equal('huān'))
	})
	it('欢 in 喜欢 should have the 5th tone', () => {
		return mdbg.get('喜欢')
		.then(data => data.definitions['xi3 huan5'].pinyin.should.equal('xǐ huan'))
	})
})
