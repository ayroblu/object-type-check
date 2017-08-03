const genericChecker = require('./genericChecker')
const stringTypeParser = require('./stringTypeParser')

function parseSchema(schema){
  const newSchema = {}
  Object.keys(schema).forEach(k=>{
    const {key, val} = parseParams(schema, k)
    newSchema[key] = val
  })
  return newSchema
}

function parseParams(schema, key){
  if (typeof schema[key] === 'function'){
    throw new Error('Not implemented: functions')
  }
  const generics = genericChecker(key)
    // You need to check that generic type is not specified cause confused

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
    oType.__generics = generics
  }
  return {key: generics ? generics.name : key, val: oType}
  //throw new Error('Not implemented: generics')
  //return {key, val: Object.assign({}, schema[key])}
}

// parse generics: 
// Some<Thing, Else> -> Some<T1, T2>
// line 6: newSchema[k] = {...newSchema[k]} // change here
// if I rename them, then I might overlap with an existing type
// Also, this syntax supports overloading - don't support this
// Just use a sub property

module.exports = parseSchema
