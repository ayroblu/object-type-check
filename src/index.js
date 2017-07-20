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
      const {array, type} = schemaType[k]

      const oType = /^[A-Z]/.test(type)
      if (array) {
        const arrVal = typeof array === 'number' ? array : 1
        this._recurFunc(resp[k], k, arrVal, r=>{
          this._checkTypeValidity(schema, schemaType, k, r)
        })
      } else {
        this._checkTypeValidity(schema, schemaType, k, resp[k])
      }
    })
    return true
  }
  _checkTypeValidity(schema, schemaType, k, o){
    const {type} = schemaType[k]
    const oType = /^[A-Z]/.test(type)
    if (oType){
      this._checkType(schema, type, o)
      return
    }
    const validType = this._isValidType(schemaType[k], o)
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
  _isValidType(typeDef, o){
    const {isNullable, isOptional, type} = typeDef

    return [
      typeof o === type
    , isNullable && o === null
    , isOptional && o === undefined
    ].some(a=>a)
  }
}

module.exports = Schema
