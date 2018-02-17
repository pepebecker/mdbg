'use strict'

const mdbg = require('../index')

describe('Get word data', () => {
	it('should get the correct data for the specified word', done => {
		const word = mdbg.get('吗')
		word.traditional.should.equal('嗎')
		word.simplified.should.equal('吗')
		word.data.ma3.mandarin.should.equal('mǎ')
		word.data.ma5.mandarin.should.equal('ma')
		done()
	})
})
