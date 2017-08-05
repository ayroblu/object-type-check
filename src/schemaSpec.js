const parseSchema = require('./schemaParser')
const genericChecker = require('./genericChecker')
const {check, safeCheck, primitiveTypes} = require('./typeChecker')

const schema = parseSchema({
  Type: {
    type: {type: 'literal', values: primitiveTypes},
    isOptional: 'boolean?',
    isNullable: 'boolean?',
    array: 'number|boolean?',
  },
  LiteralType: {
    type: {type: 'literal', values: ['literal']},
    values: {type: 'any', array: true}
  },
  ObjectType: {
    type: 'string',
    isOptional: 'boolean?',
    isNullable: 'boolean?',
    array: 'number|boolean?',
  },
}, true)
// once you've parsed the schema, then you can check it
function checkSchema(o){
  if (typeof o !== 'object' || o === null) throw new Error('Schema not passed')
  Object.keys(o).forEach(k=>{
    Object.keys(o[k]).forEach(n=>{
      if (n.startsWith('__')) return
      o[k][n].forEach(v=>{
        const isPrimitive = safeCheck(schema, 'function|Type|LiteralType', v)
        if (!isPrimitive){
          check(schema, 'ObjectType', v)
          // Don't check the schema for generic types (e.g. T)
          if (o[k].__generics && o[k].__generics.params.includes(v.type)){
            return
          }
          
          const generics = genericChecker(v.type)
          const type = generics ? generics.name : v.type
          if (!o[type]) {
            throw new Error(`ObjectType ${type} not found`)
          }
          if (generics) {
            if (generics.params.length !== o[type].__generics.params.length) {
              throw new Error('Did not receive the correct number of generic arguments')
            }
            generics.params.forEach(p=>{
              const isGenericPrimitive = safeCheck(schema, 'Type|LiteralType', {type:p})
              if (isGenericPrimitive) return
              if (!o[p] && (!o[k].__generics || !o[k].__generics.params.includes(p))){
                throw new Error('Generic param not found: ' + p)
              }
            })
          } else {
            if (o[type].__generics){
              throw new Error(`Generic type needs parameters: ${type}`)
            }
          }
        }
      })
    })
  })
}

module.exports = checkSchema
