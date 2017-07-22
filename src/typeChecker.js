const stringTypeParser = require('./stringTypeParser')

const primitiveTypes = [
  'string',
  'number',
  'boolean',
  'symbol',
  'object',
  'function',
  'literal', // not a primitive but special cased
  'any', // not a primitive but special cased
]

function safeCheck(schema, type, o, options){
  try {
    return check(schema, type, o, options)
  } catch (err) {
    return false
  }
}
function check(schema, type, o, options={noExtras: true}){
  if (typeof o !== 'object' || o === null) {
    throw new Error('Object not provided')
  }
  const v = stringTypeParser(type)
  typeCheck(schema, v, o, 'input', options)
  return true
}
function runTypeCheck(schema, typeName, resp, {noExtras}){
  const schemaType = schema[typeName]
  if (!schemaType) throw new Error('Type not found')

  if (noExtras){
    const hasExtra = checkHasExtra(schemaType, resp)
    if (hasExtra) throw new Error(`Has extra params`)
  }

  Object.keys(schemaType).forEach(k=>{
    typeCheck(schema, schemaType[k], resp[k], k, {noExtras})
  })
  return true
}
function typeCheck(schema, fullTypeDef, o, k='input', options){
  const isValid = fullTypeDef.some(s=>{
    const {array} = s

    try {
      if (array) {
        const arrVal = typeof array === 'number' ? array : 1
        recurFunc(o, k, arrVal, r=>{
          checkTypeValidity(schema, s, k, r, options)
        })
      } else {
        checkTypeValidity(schema, s, k, o, options)
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
function checkHasExtra(stt, resp){
  return !Object.keys(resp).every(k=>stt[k])
}
function checkTypeValidity(schema, schemaTypeType, k, o, options){
  const {type} = schemaTypeType
  const validType = isValidType(schema, schemaTypeType, o, options)
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
function isValidType(schema, typeDef, o, options){
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
    oType && runTypeCheck(schema, type, o, options)
  )
}

module.exports = {check, safeCheck, primitiveTypes}
