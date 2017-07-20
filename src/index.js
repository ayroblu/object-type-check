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
  constructor(schema){
    if (!schema){
      throw new Error('Schema not specified')
    }
    this.schema = schema
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
    return type.split('|').some(t=>{
      try {
        return this._checkType(this.schema, t, o)
      } catch (err) {
        if (type.split('|').length === 1){
          throw err
        }
        return false
      }
    })
  }
  _checkType(schema, typeName, resp){
    const schemaType = schema[typeName]
    if (!schemaType) throw new Error('Type not found')

    const hasExtra = this._checkHasExtra(schemaType, resp)
    if (hasExtra) throw new Error(`Has extra params`)

    Object.keys(schemaType).forEach(k=>{
      const stt = typeof schemaType[k] === 'string'
        ? this._stringTypeParser(schemaType[k])
        : schemaType[k]
      const stta = !Array.isArray(stt)
        ? this._getTypeOptions(stt)
        : stt
      const isValid = stta.some(s=>{
        const {array} = s

        try {
          if (array) {
            const arrVal = typeof array === 'number' ? array : 1
            this._recurFunc(resp[k], k, arrVal, r=>{
              this._checkTypeValidity(schema, s, k, r)
            })
          } else {
            this._checkTypeValidity(schema, s, k, resp[k])
          }
        } catch (err){
          if (stta.length === 1)
            throw err

          return false
        }
        return true
      })
      if (!isValid) throw new Error('Did not match any type')
    })
    return true
  }
  _checkHasExtra(stt, resp){
    return !Object.keys(resp).every(k=>stt[k])
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
  _getTypeOptions(schemaTypeType) {
    const {type} = schemaTypeType
    return type.split('|').map(t=>(
      Object.assign({}, schemaTypeType, {type: t})
    ))
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

    const oType = this._isObjectType(type)

    return [
      typeof o === type
    , isNullable && o === null
    , isOptional && o === undefined
    , type==='literal' && Array.isArray(values) && values.some(v=>o===v)
    , type==='any'
    ].some(a=>a) || (
      oType && this._checkType(schema, type, o)
    )
  }
}

module.exports = Schema
