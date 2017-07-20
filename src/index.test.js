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
  Func: {
    name: {type: 'function'},
  },
  Thing: {
    name: {type: 'object'},
  },
  Recur: {
    name: {type: 'string'},
    recur: {type: 'Recur', isOptional: true},
  },
  Union: {
    name: {type: 'string|number'},
    age: {type: 'string|number'},
  },
  UnionUser: {
    name: {type: 'string|number'},
    gps: {type: 'string|Gps'},
  },
  Literal: {
    name: {type: 'literal', values: ['first']},
  },
  StringType: {
    name: 'string',
    age: 'string?',
    country: '?string',
    height: '?number?',
  },
  Any: {
    name: 'any'
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
  , ['check function types', 'Func', {name: ()=>{}}]
  , ['support generic objects', 'Thing', {name: {fiddle: true}}]
  , ['support recursive objects', 'Recur', {
      name: 's'
    , recur: {
        name: 'breathe'
      , recur: { name: 'yolo' }
      }
    }]
  , ['support union primitive types', 'Union', {name: 3, age: 'three'}]
  , ['support union object types - string', 'UnionUser', {name: 3, gps: 'three'}]
  , ['support union object types - object', 'UnionUser', {name: 3, gps: {latitude: 1, longitude: 3}}]
  , ['support literal types', 'Literal', {name: 'first'}]
  , ['support string types - all', 'StringType', {name: 'hi', age: 'hi', country: 'hi', height: 2}]
  , ['support string types - no age', 'StringType', {name: 'hi', country: 'hi', height: 2}]
  , ['support string types - null country', 'StringType', {name: 'hi', country: null, height: 2}]
  , ['support string types - no height', 'StringType', {name: 'hi', country: null}]
  , ['support string types - null height', 'StringType', {name: 'hi', country: null, height: null}]
  , ['support any type', 'Any', {name: 'hi'}]
  , ['support union in TypeDef - basic', 'Basic|Gps', {name: 'hi'}]
  , ['support union in TypeDef - gps', 'Basic|Gps', {latitude: 3, longitude: 4}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      const matcher = new Schema(schema)
      const result = matcher.check(type, o)
      assert(result)
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(schema)
      const isValid = matcher.safeCheck(type, o)
      assert(isValid)
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
  , ['check function types', 'Func', {name: 'name'}]
  , ['checks recursive objects types', 'Recur', {
      name: 's'
    , recur: {
        name: 'breathe'
      , recur: { name: 5 }
      }
    }]
  , ['checks union object types - object', 'UnionUser', {name: 3, gps: {latitude: 1}}]
  , ['checks union object types - string', 'UnionUser', {name: 3, gps: 3}]
  , ['check literal types', 'Literal', {name: 'firsta'}]
  , ['check no extra params', 'Basic', {name: 'first', age: 3}]
  , ['check no extra params - nested', 'Recur', {
      name: 's'
    , recur: {
        name: 'breathe'
      , recur: { name: 'hi', age: 9 }
      }
    }]
  , ['support string types - needs country', 'StringType', {name: 'hi'}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(schema)
        matcher.check(type, o)
      })
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(schema)
      const isValid = matcher.safeCheck(type, o)
      assert(!isValid)
    })
  })
})
