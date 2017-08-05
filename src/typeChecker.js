const stringTypeParser = require('./stringTypeParser')
const genericChecker = require('./genericChecker')

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
  //if (typeof o !== 'object' || o === null) {
  //  throw new Error('Object not provided')
  //}
  const v = stringTypeParser(type)
  typeCheck(schema, v, o, 'input', options)
  return true
}
function genericType(schemaType, type, generics){
  if (schemaType.__generics.params.length !== generics.params.length){
    const name = `${generics.name}<${generics.params.join(',')}>`
    throw new Error('Generics were of incorrect parameter length: ' + name)
  }
  const genericMap = schemaType.__generics.params.reduce((a,n,i)=>{
    a[n] = generics.params[i]
    return a
  }, {})
  const genericsType = genericChecker(type)
  const gType = genericsType ? `${genericsType.name}<${genericsType.params.map(p=>genericMap[p]).join(',')}>` : null
  return genericMap[type] || gType
}
function runTypeCheck(schema, typeName, resp, {noExtras}){
  const generics = genericChecker(typeName)
  const type = generics ? generics.name : typeName
  if (!schema[type]) throw new Error(`Type ${type} not found`)

  if (typeof schema[type] === 'function'){
    if (!schema[type](resp)){
      throw new Error(`Function ${typeName} returned falsy`)
    }
  } else {
    const schemaType = Object.assign({}, schema[type])
    if (generics) {
      Object.keys(schemaType).forEach(k=>{
        if (k.startsWith('__')) return
        schemaType[k] = schemaType[k].map(s=>Object.assign({}, s, {type: genericType(schemaType, s.type, generics)}))
      })
    }

    if (noExtras){
      const hasExtra = checkHasExtra(schemaType, resp)
      if (hasExtra) throw new Error(`Has extra params`)
    }

    Object.keys(schemaType).forEach(k=>{
      if (k.startsWith('__')) return
      typeCheck(schema, schemaType[k], resp[k], k, {noExtras})
    })
  }
  return true
}
function typeCheck(schema, fullTypeDef, o, k, options){
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
