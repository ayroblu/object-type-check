var assert = require('assert')
const Schema = require('./')

describe('Correctly checks types', ()=>{
  const schema = {
    Basic: {name: 'string'}
  }
  [
    ['checks basic object', {name: 'hi'}]
  ].forEach(([name, o])=>{
    it(name, ()=>{
      const matcher = new Schema(schema)
      const result = matcher.check('Basic', o)
      assert(result)
    })
  })
})
