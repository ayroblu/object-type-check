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
    isActive: {type: 'boolean', isNullable: true, isOptional: true},
  },
  GpsUser:{
    name: {type: 'string'},
    gps: {type: 'Gps'},
  },
  Gps: {
    latitude: {type: 'number'},
    longitude: {type: 'number'},
  },
  ArrayUser:{
    name: {type: 'string'},
    thoughts: {type: 'string', isArray: true},
  },
  ArrayGpsUser:{
    name: {type: 'string'},
    thoughts: {type: 'Gps', isArray: true},
  },
}
describe('Correctly checks types', ()=>{
  [
    ['checks basic object', 'Basic', {name: 'hi'}]
  , ['checks user object no country', 'User', {name: 'hi', age: 3}]
  , ['checks user object no country', 'User', {name: 'hi', age: 3, country: 'NZ'}]
  , ['checks user object null active', 'User', {name: 'hi', age: 3, country: 'NZ', isActive: null}]
  , ['checks user object active', 'User', {name: 'hi', age: 3, country: 'NZ', isActive: true}]
  , ['checks gps user', 'GpsUser', {name: 'hi', gps: {latitude: 3, longitude: 3}}]
  , ['checks array user', 'ArrayUser', {name: 'hi', thoughts: ['Bro', 'cute']}]
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
  , ['checks gps user', 'GpsUser', {name: 'hi', gps: {latitude: 3, longitude: 'hi'}}]
  , ['checks invalid array user', 'ArrayUser', {name: 'hi', thoughts: [3, 'cute']}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(schema)
        matcher.check(type, o)
      })
    })
  })
})
