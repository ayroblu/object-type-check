const stringTypeParser = require('./stringTypeParser')
const checkSchema = require('./schemaSpec')

function parseSchema(schema){
  const newSchema = Object.assign({}, schema)
  Object.keys(newSchema).forEach(k=>{
    newSchema[k] = Object.assign({}, newSchema[k])
    Object.keys(newSchema[k]).forEach(n=>{
      if (typeof newSchema[k][n] === 'string'){
        newSchema[k][n] = stringTypeParser(newSchema[k][n])
      }
      if (typeof newSchema[k][n] !== 'object'){
        throw new Error(`Type not recognised: ${k}: ${n}`)
      }
      if (!Array.isArray(newSchema[k][n])){
        const {type} = newSchema[k][n]
        if (!type || typeof type !== 'string'){
          throw new Error("type isn't recognised string")
        }
        newSchema[k][n] = type.split('|').map(t=>(
          Object.assign({}, newSchema[k][n], {type: t})
        ))
      }
    })
  })

  checkSchema(newSchema)
  return newSchema
}

module.exports = parseSchema
