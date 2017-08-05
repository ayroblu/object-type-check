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
  , ['support array in TypeDef - gps', 'Array<Basic>', [{name: 'hi'}, {name: 'yo'}]]
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
  , ['throws on no type provided', null, {name: 'hi'}]
  , ['throws on invalid type provided', 'Yolo', {name: 'hi'}]
  , ['throws on no object passed', 'Basic', null]
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
describe('Extra special checks', ()=>{
  it('allows extras when specified', ()=>{
    const matcher = new Schema(schema, {noExtras: false})
    matcher.check('Basic', {name: 'hi', water: true})
  })
  it('throws on no schema', ()=>{
    assert.throws(()=>{
      new Schema(null)
    })
  })
  //it('throws on function spec', ()=>{
  //  assert.throws(()=>{
  //    const partialSchema = {
  //      func(input){
  //        return input > 1
  //      },
  //      Basic: {
  //        name: {type: 'string'},
  //      },
  //    }
  //    const matcher = new Schema(partialSchema)
  //    matcher.check('Basic', {name: 'hi'})
  //  })
  //})
  it('throws non object schema', ()=>{
    assert.throws(()=>{
      const partialSchema = {
        Basic: null,
      }
      const matcher = new Schema(partialSchema)
      matcher.check('Basic', {name: 'hi'})
    })
  })
  it('throws non object schema', ()=>{
    assert.throws(()=>{
      const partialSchema = {
        Basic: 3,
      }
      new Schema(partialSchema)
    })
  })
})

const gSchema = {
  "Some<T>": {
    name: 'T',
  },
  Basic: {
    name: 'string',
  },
  "Something<R>": {
    name: 'R'
  , firstname: 'Some<R>'
  },
  Another: {
    Water: 'Some<number>',
    Air: 'Some<Basic>',
  },
}
describe('adding generics', ()=>{
  [
    ['checks basic generic', 'Some<number>', {name: 6}]
  , ['checks basic typed generic', 'Some<Basic>', {name: {name: 'hi'}}]
  , ['checks nested generic', 'Something<string>', {name: 'hi', firstname: {name: 'asdf'}}]
  , ['checks normal type', 'Another', {Water: {name: 1}, Air: {name: {name: 'asdf'}}}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      const matcher = new Schema(gSchema)
      const result = matcher.check(type, o)
      assert(result)
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(gSchema)
      const isValid = matcher.safeCheck(type, o)
      assert(isValid)
    })
  })
  it('has a defined generic type', ()=>{
    const tSchema = {
      T: {name: 'string'}
    , 'Basic<T>': {name: 'T'}
    }
    const matcher = new Schema(tSchema)
    let isValid = matcher.check('Basic<number>', {name: 3})
    assert(isValid)
    assert.throws(()=>{
      matcher.check('Basic<number>', {name: {name: 'hi'}})
    })
  })
})
describe('throws on bad generics', ()=>{
  [
    ['checks basic generic type check', 'Some<number>', {name: 'hi'}]
  , ['checks basic typed generic -wrong structure', 'Some<Basic>', {name: 'hi'}]
  , ['checks basic typed generic - wrong type', 'Some<Basic>', {name: {name: 1}}]
  , ['not a valid generic', 'Some<T>', {name: {name: 'hi'}}]
  , ['checks basic generic definition check - extras', 'Some<number, number>', {name: 3}]
  , ['checks basic generic definition check - no extras', 'Some', {name: 3}]
  , ['checks wrong type nested generic', 'Something<string>', {name: 'hi', firstname: {name: 123}}]
  , ['checks wrong generic definition', 'Another<string>', {name: 'hi', firstname: {name: 'asdf'}}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(gSchema)
        matcher.check(type, o)
      })
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(gSchema)
      const isValid = matcher.safeCheck(type, o)
      assert(!isValid)
    })
  })
})

const funcSchema = {
  User: {
    name: 'string',
    age: 'even',
  },
  even(input){
    return input % 2 === 0
  },
}
describe('adding functions', ()=>{
  [
    ['checks basic even function', 'even', 0]
  , ['checks user function', 'User', {name: 'hi', age: 0}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      const matcher = new Schema(funcSchema)
      const result = matcher.check(type, o)
      assert(result)
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(funcSchema)
      const isValid = matcher.safeCheck(type, o)
      assert(isValid)
    })
  })
})
describe('throws on bad functions', ()=>{
  [
    ['checks basic even function', 'even', 1]
  , ['checks invalid user function', 'User', {name: 'hi', age: 1}]
  ].forEach(([name, type, o])=>{
    it(name, ()=>{
      assert.throws(()=>{
        const matcher = new Schema(funcSchema)
        matcher.check(type, o)
      })
    })
    it('safe: ' + name, ()=>{
      const matcher = new Schema(funcSchema)
      const isValid = matcher.safeCheck(type, o)
      assert(!isValid)
    })
  })
})
