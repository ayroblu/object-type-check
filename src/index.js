const {parseSchema, stringTypeParser} = require('./schemaParser')
const primitiveTypes = [
  'string',
  'number',
  'boolean',
  'symbol',
  'object',
  'function',
  'literal', // not a primitive but special cased
]

class Schema {
  constructor(schema, {noExtras}={noExtras:true}){
    if (!schema){
      throw new Error('Schema not specified')
    }
    this.schema = parseSchema(schema)
    this.noExtras = noExtras
  }
  safeCheck(type, o){
    try {
      return this.check(type, o)
    } catch (err) {
      return false
    }
  }
  check(type, o){
    if (typeof o !== 'object') {
      throw new Error('Object not provided')
    }
    const v = stringTypeParser(type)
    this._typeCheck(this.schema, v, o)
    return true
  }
  _runTypeCheck(schema, typeName, resp){
    const schemaType = schema[typeName]
    if (!schemaType) throw new Error('Type not found')

    if (this.noExtras){
      const hasExtra = this._checkHasExtra(schemaType, resp)
      if (hasExtra) throw new Error(`Has extra params`)
    }

    Object.keys(schemaType).forEach(k=>{
      this._typeCheck(schema, schemaType[k], resp[k], k)
    })
    return true
  }
  _typeCheck(schema, fullTypeDef, o, k='input'){
    const isValid = fullTypeDef.some(s=>{
      const {array} = s

      try {
        if (array) {
          const arrVal = typeof array === 'number' ? array : 1
          this._recurFunc(o, k, arrVal, r=>{
            this._checkTypeValidity(schema, s, k, r)
          })
        } else {
          this._checkTypeValidity(schema, s, k, o)
        }
      } catch (err){
        if (fullTypeDef.length === 1)
          throw err

        return false
      }
      return true
    })
    if (!isValid) throw new Error('Did not match any type')
  }
  _checkHasExtra(stt, resp){
    return !Object.keys(resp).every(k=>stt[k])
  }
  _checkTypeValidity(schema, schemaTypeType, k, o){
    const {type} = schemaTypeType
    const validType = this._isValidType(schema, schemaTypeType, o)
    if (!validType) {
      throw new Error(`Invalid type on ${k}, expected ${type}`)
    }
  }
  _recurFunc(o, k, depth, func){
    if (!Array.isArray(o)) {
      throw new Error(`${k} should be an array`)
    }
    o.forEach(v=>{
      if (depth > 1){
        this._recurFunc(v, k, depth-1, func)
      } else {
        func(v)
      }
    })
  }
  _isValidType(schema, typeDef, o){
    const {isNullable, isOptional, values, type} = typeDef

    // is Object type check (perhaps capitalization is better?)
    const oType = !primitiveTypes.includes(type)

    return [
      typeof o === type
    , isNullable && o === null
    , isOptional && o === undefined
    , type==='literal' && Array.isArray(values) && values.some(v=>o===v)
    , type==='any'
    ].some(a=>a) || (
      oType && this._runTypeCheck(schema, type, o)
    )
  }
}

module.exports = Schema
