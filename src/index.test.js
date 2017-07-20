var assert = require('assert')
const Schema = require('./')

const schema = {
  Basic: {
    name: {type: 'string'},
  },
  User: {
    name: {type: 'string'},
    age: {type: 'number'},
    country: {type: 'string', isOptional: true},
  },
}
describe('Correctly checks types', ()=>{
  [
    ['checks basic object', 'Basic', {name: 'hi'}]
  , ['checks user object no country', 'User', {name: 'hi', age: 3}]
  , ['checks user object no country', 'User', {name: 'hi', age: 3, country: 'NZ'}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      const matcher = new Schema(schema)
      const result = matcher.check(type, o)
      assert(result)
    })
  })
})

describe('Correctly checks invalid types', ()=>{
  [
    ['checks null basic object', 'Basic', {name: null}]
  , ['checks undefined basic object', 'Basic', {name: undefined}]
  , ['checks missing user object', 'User', {name: 'hi'}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(schema)
        matcher.check(type, o)
      })
    })
  })
})
