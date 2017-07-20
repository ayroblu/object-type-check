const schema = {
    User: {
        name: {type: 'string'},
        isActive: {type: 'boolean', isNullable: true, isOptional: true},
        gps: {type: 'Gps'},
        thing: {type: 'symbol'},
        otherNames: {type: 'string', isArray: true},
    },
    Gps: {
        latitude: {type: 'number'},
        longitude: {type: 'number'},
    },
}
const response = {
  name: 'Yolo',
  isActive: null,
  gps: {latitude: 5, longitude: 4},
  thing: 'whatever symbols'
  otherNames: ['first', 'last']
}

const matcher = new Schema(schema)
matcher.check('User', response)

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
    checkType(this.schema, type, o)
  }
}

function checkType(schema, typeName, resp){
  const schemaType = schema[typeName]
  if (!schemaType) throw new Error('Type not found')
  Object.keys(schemaType).forEach(k=>{
    const {isArray, type} = schemaType[k]

    const oType = /^[A-Z]/.test(type)
    if (oType){
      checkType(schema, type, resp[k])
    }
    if (isArray) {
      if (!Array.isArray(resp[k])) {
        throw new Error(`${k} should be an array`)
      }
      resp[k].forEach(r=>{
        const validType = isValidType(schemaType[k], r)

        if (!validType) {
          throw new Error(`Invalid type on ${k}, expected ${type}`)
        }
      })
    } else {
      const validType = isValidType(schemaType[k], resp[k])
      if (!validType) {
        throw new Error(`Invalid type on ${k}, expected ${type}`)
      }
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
