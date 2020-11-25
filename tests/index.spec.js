'use strict'

require('mocha')
const { expect } = require('chai')

const mdbg = require('../index')

describe('我 should be the same in both forms', () => {
	it('should have the traditional hanzi 我', async () => {
		const data = await mdbg.get('我')
		expect(data.traditional).equal('我')
	})
	it('should have the simplified hanzi 我', async () => {
		const data = await mdbg.get('我')
		expect(data.simplified).equal('我')
	})
})

describe('门 should have 2 different forms', () => {
	it('should have the traditional hanzi 門', async () => {
		const data = await mdbg.get('门')
		expect(data.traditional).equal('門')
	})
	it('should have the simplified hanzi 门', async () => {
		const data = await mdbg.get('門')
		expect(data.simplified).equal('门')
	})
})

describe('喜欢 should have the correct pinyin', () => {
	it('喜 should have the 3rd tone', async () => {
		const data = await mdbg.get('喜')
		expect(data.definitions['xi3'].pinyin).equal('xǐ')
	})
	it('欢 should have the 1st tone', async () => {
		const data = await mdbg.get('欢')
		expect(data.definitions['huan1'].pinyin).equal('huān')
	})
	it('欢 in 喜欢 should have the 5th tone', async () => {
		const data = await mdbg.get('喜欢')
		expect(data.definitions['xi3 huan5'].pinyin).equal('xǐ huan')
	})
})
