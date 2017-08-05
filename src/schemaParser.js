const genericChecker = require('./genericChecker')
const stringTypeParser = require('./stringTypeParser')

function parseSchema(schema){
  const newSchema = {}
  Object.keys(schema).forEach(k=>{
    const {key, val} = parseParams(schema, k)
    if (newSchema[key]) {
      throw new Error('Double defined schema:' + key)
    }
    newSchema[key] = val
  })
  return newSchema
}

function parseParams(schema, key){
  if (typeof schema[key] === 'function'){
    // basically don't need to do anything for a function
    return {key, val: schema[key]}
    //throw new Error('Not implemented: functions')
  }
  const generics = genericChecker(key)

  if (typeof schema[key] !== 'object' || !schema[key]) {
    throw new Error(`Object sub: ${key} is not an object`)
  }
  const oType = Object.assign({}, schema[key])
  Object.keys(oType).forEach(n=>{
    if (typeof oType[n] === 'string') {
      oType[n] = stringTypeParser(oType[n])
    }
    if (typeof oType[n] !== 'object'){
      throw new Error(`Type not recognised: ${key}: ${n}`)
    }
    if (!Array.isArray(oType[n])){
      const {type} = oType[n]
      if (!type || typeof type !== 'string'){
        throw new Error(`type ${type} isn't recognised string`)
      }
      oType[n] = type.split('|').map(t=>(
        Object.assign({}, oType[n], {type: t})
      ))
    }
  })
  if (generics) {
    const allSpeced = generics.params.every(p=>(
      Object.keys(oType).find(n=>(
        oType[n].find(t=>t.type===p)
      ))
    ))
    if (!allSpeced) {
      throw new Error('Generic types have not been defined in:' + key)
    }
    oType.__generics = generics
  }
  return {key: generics ? generics.name : key, val: oType}
}

module.exports = parseSchema
