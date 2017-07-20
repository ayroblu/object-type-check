//const schema = {
//    User: {
//        name: {type: 'string'},
//        isActive: {type: 'boolean', isNullable: true, isOptional: true},
//        gps: {type: 'Gps'},
//        thing: {type: 'symbol'},
//        otherNames: {type: 'string', isArray: true},
//    },
//    Gps: {
//        latitude: {type: 'number'},
//        longitude: {type: 'number'},
//    },
//}
//const response = {
//  name: 'Yolo',
//  isActive: null,
//  gps: {latitude: 5, longitude: 4},
//  thing: 'whatever symbols',
//  otherNames: ['first', 'last']
//}
//
//const matcher = new Schema(schema)
//matcher.check('User', response)

module.exports = class Schema {
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
    return checkType(this.schema, type, o)
  }
}

function checkType(schema, typeName, resp){
  const schemaType = schema[typeName]
  if (!schemaType) throw new Error('Type not found')
  Object.keys(schemaType).forEach(k=>{
    const {array, type} = schemaType[k]

    const oType = /^[A-Z]/.test(type)
    if (array) {
      const arrVal = typeof array === 'number' ? array : 1
      recurFunc(resp[k], k, arrVal, r=>{
        checkTypeValidity(schema, schemaType, k, r)
      })
    } else {
      checkTypeValidity(schema, schemaType, k, resp[k])
    }
  })
  return true
}
function checkTypeValidity(schema, schemaType, k, o){
  const {type} = schemaType[k]
  const oType = /^[A-Z]/.test(type)
  if (oType){
    checkType(schema, type, o)
    return
  }
  const validType = isValidType(schemaType[k], o)
  if (!validType) {
    throw new Error(`Invalid type on ${k}, expected ${type}`)
  }
}
function recurFunc(o, k, depth, func){
  if (!Array.isArray(o)) {
    throw new Error(`${k} should be an array`)
  }
  o.forEach(v=>{
    if (depth > 1){
      recurFunc(v, k, depth-1, func)
    } else {
      func(v)
    }
  })
}
function isValidType(typeDef, o){
  const {isNullable, isOptional, type} = typeDef

  return [
    typeof o === type
  , isNullable && o === null
  , isOptional && o === undefined
  ].some(a=>a)
}
