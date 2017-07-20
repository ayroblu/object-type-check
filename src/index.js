const primitiveTypes = [
  'string',
  'number',
  'boolean',
  'symbol',
  'object',
  'function',
]

class Schema {
  constructor(schema){
    if (!schema){
      throw new Error('Schema not specified')
    }
    this.schema = schema
  }
  check(type, o){
    if (typeof o !== 'object') {
      throw new Error('Object not provided')
    }
    return this._checkType(this.schema, type, o)
  }
  _checkType(schema, typeName, resp){
    const schemaType = schema[typeName]
    if (!schemaType) throw new Error('Type not found')
    Object.keys(schemaType).forEach(k=>{
      const stt = typeof schemaType[k] === 'string'
        ? this._stringTypeParser(schemaType[k])
        : schemaType[k]
      const {array, type} = stt

      if (array) {
        const arrVal = typeof array === 'number' ? array : 1
        this._recurFunc(resp[k], k, arrVal, r=>{
          this._checkTypeValidity(schema, stt, k, r)
        })
      } else {
        this._checkTypeValidity(schema, stt, k, resp[k])
      }
    })
    return true
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
    const {isNullable, isOptional, type} = typeDef

    const oType = this._isObjectType(type)

    return [
      typeof o === type
    , isNullable && o === null
    , isOptional && o === undefined
    ].some(a=>a) || (
      oType && this._checkType(schema, type, o)
    )
  }
  _stringTypeParser(stringType){
    const arr = /^((Array|Promise)<)+([^\s<>]*?)(>)+$/g.exec(stringType)
    const numLeft = stringType.replace(/[^<]/g, '').length
    const balanced = numLeft === stringType.replace(/[^>]/g, '').length
    return {
      type: stringType.replace(/\?/g, ''),
      isOptional: /\?$/.test(stringType),
      isNullable: /^\?/.test(stringType),
      array: !!arr && balanced && numLeft
    }
  }
  _isObjectType(type){
    return !primitiveTypes.includes(type)
    // Or capitalise?
    //return /^[A-Z]/.test(type)
  }
}

module.exports = Schema
