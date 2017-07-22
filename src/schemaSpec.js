const parseSchema = require('./schemaParser')
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
  //const matcher = new Schema(schema)

  if (typeof o !== 'object' || o === null) throw new Error('Schema not passed')
  Object.keys(o).forEach(k=>{
    Object.keys(o[k]).forEach(n=>{
      o[k][n].forEach(v=>{
        const isPrimitive = safeCheck(schema, 'Type|LiteralType', v)
        if (!isPrimitive){
          check(schema, 'ObjectType', v)
          if (!o[v.type]) {
            throw new Error('ObjectType not found')
          }
        }
      })
    })
  })
}

module.exports = checkSchema
