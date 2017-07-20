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
    thoughts: {type: 'string', array: true},
  },
  ArrayGpsUser:{
    name: {type: 'string'},
    locations: {type: 'Gps', array: true},
  },
  ArrayArrayGpsUser:{
    name: {type: 'string'},
    locationsArray: {type: 'Gps', array: 2},
  },
  ArrayGpsArrayGpsUser:{
    name: {type: 'string'},
    locationsArray: {type: 'ArrayGpsUser', array: true},
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
  , ['checks array user empty array', 'ArrayUser', {name: 'hi', thoughts: []}]
  , ['checks array gps user', 'ArrayGpsUser', {
      name: 'hi', locations: [{
        latitude: 23, longitude: 13,
      }, {
        latitude: 23, longitude: 135,
      }]
    }]
  , ['checks nested array gps user', 'ArrayArrayGpsUser', {
      name: 'hi', locationsArray: [[{
        latitude: 23, longitude: 13,
      }, {
        latitude: 23, longitude: 135,
      }], [{
        latitude: 23, longitude: 13,
      }, {
        latitude: 23, longitude: 135,
      }]]
    }]
  , ['checks array gps user with sub array', 'ArrayGpsArrayGpsUser', {
      name: 'hi',
      locationsArray: [{
        name: 'first',
        locations: [{
          latitude: 23, longitude: 13,
        }, {
          latitude: 23, longitude: 135,
        }]
      }]
    }]
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
  , ['checks user object invalid active', 'User', {name: 'hi', age: 3, country: 'NZ', isActive: '3'}]
  , ['checks gps user', 'GpsUser', {name: 'hi', gps: {latitude: 3, longitude: 'hi'}}]
  , ['checks gps user missing', 'GpsUser', {name: 'hi', gps: {latitude: 3}}]
  , ['checks invalid array user', 'ArrayUser', {name: 'hi', thoughts: [3, 'cute']}]
  , ['checks array user no array', 'ArrayUser', {name: 'hi', thoughts: {}}]
  , ['checks array gps user second missing', 'ArrayGpsUser', {
      name: 'hi', locations: [{
        latitude: 23, longitude: 13,
      }, {
        latitude: 23
      }]
    }]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(schema)
        matcher.check(type, o)
      })
    })
  })
})
