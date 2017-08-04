var assert = require('assert')
//const Schema = require('./')
const parseSchema = require('./schemaParser')
const checkSchema = require('./schemaSpec')

describe('Successfully creates schema', ()=>{
  [
    ['basic schema', {Basic: {name: {type: 'string'}}}],
    ['basic schema - number', {Basic: {name: {type: 'number'}}}],
    ['schema with Object Types', {
      Basic: {name: {type: 'number'}, sec: {type: 'Sec'}},
      Sec: {name: {type: 'string'}},
    }],
    ['basic schema - optional', {Basic: {name: {type: 'number', isOptional: true}}}],
    ['basic schema - nullable', {Basic: {name: {type: 'number', isNullable: true}}}],
    ['basic schema - array', {Basic: {name: {type: 'number', array: true}}}],
    ['basic schema - array number', {Basic: {name: {type: 'number', array: 2}}}],

    // Support string types
    ['basic string schema', {Basic: {name: 'string'}}],
    ['basic string schema optional', {Basic: {name: 'string?'}}],
    ['basic string schema, nullable', {Basic: {name: '?string'}}],
    ['basic string schema, nullable + optional', {Basic: {name: '?string?'}}],
    ['basic string schema, union', {Basic: {name: 'string|number'}}],
    ['basic string schema, Object', {
      Basic: {name: 'Sec'}
    , Sec: {name: 'string'}
    }],
    ['basic string schema, union object', {
      Basic: {name: 'string|Sec'}
    , Sec: {name: 'string'}
    }],
    ['basic string schema, array', {Basic: {name: 'Array<string>'}}],
    ['basic string schema, array - layered object', {Basic: {name: 'Array<Array<string>>'}}],
  ].forEach(([name, schema])=>{
    it(name, ()=>{
      //const matcher = new Schema(schema)
      checkSchema(parseSchema(schema))
    })
  })
})
describe('Gets invalid schema', ()=>{
  [
    ['no object', 'lol'],
    ['no nested object', {name: 'string'}],
    ['invalid type name', {Basic: {name: 'wat'}}],
    ['basic schema - optional type', {Basic: {name: {type: 'number', isOptional: 1}}}],
    ['basic schema - nullable type', {Basic: {name: {type: 'number', isNullable: 1}}}],
    ['basic schema - array type', {Basic: {name: {type: 'number', array: 's'}}}],
    ['basic schema - extra', {Basic: {name: {type: 'number', thing: true}}}],

    // string types
    ['basic string schema, question mark', {Basic: {name: 'strin?g'}}],
    ['basic string schema, union - bad types', {Basic: {name: 'string|nmber'}}],
    ['basic string schema, array - space start', {Basic: {name: ' Array<string>'}}],
    ['basic string schema, array - space end', {Basic: {name: 'Array<string> '}}],
    ['basic string schema, array - space middle', {Basic: {name: 'Array< string>'}}],
    ['basic string schema, array - bracket', {Basic: {name: ' Array<<string>'}}],
    ['basic string schema, array - bracket end', {Basic: {name: ' Array<string>>'}}],
    ['basic string schema, array - layered object', {Basic: {name: 'Array<Array<num>>'}}],

    // generics types
    ['basic generic schema - no generic type', {
      'Basic<T>': {name: 'string'}
    }],
    ['generic same name', {
      'Basic': {name: 'string'}
    , 'Basic<T>': {name: 'T'}
    }],
    ['no generic use ', {
      'Basic': {name: 'Some'}
    , 'Some<T>': {name: 'T'}
    }],
    ['generic to non generic ', {
      'Basic': {name: 'string'}
    , 'Some<T>': {name: 'Basic<T>'}
    }],
    ['generics wrong num arguments', {
      'Basic': {name: 'Some<string, number>'}
    , 'Some<T>': {name: 'T'}
    }],
    ['generics wrong naming', {
      'Basic': {name: 'Some<T>'}
    , 'Some<T>': {name: 'T'}
    }],

    // other
    ['non string type', {Basic: {name: 5}}],
    ['non string type in typename', {Basic: {name: {type: 3}}}],
  ].forEach(([name, schema])=>{
    it(name, ()=>{
      assert.throws(()=>{
        //const matcher = new Schema(schema)
        checkSchema(parseSchema(schema))
      })
    })
  })
})
describe('Extra checks', ()=>{
  it('fail check schema', ()=>{
    assert.throws(()=>{
      checkSchema(null)
    })
  })
})
