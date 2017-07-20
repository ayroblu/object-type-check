const {parseSchema} = require('./schemaParser')
const Schema = require('./')

const schema = {
  Type: {
    type: {type: 'literal', values: [
      'string',
      'number',
      'boolean',
      'symbol',
      'object',
      'function',
    ]},
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
}
function checkSchema(o){
  const matcher = new Schema(schema)

  o = parseSchema(o)
  if (typeof o !== 'object') throw new Error('Schema not passed')
  Object.keys(o).forEach(k=>{
    if (typeof o[k] !== 'object') throw new Error('Type object not valid: ' + o[k])
    Object.keys(o[k]).forEach(n=>{
      o[k][n].forEach(v=>{
        const isPrimitive = matcher.safeCheck('Type|LiteralType', v)
        if (!isPrimitive){
          matcher.check('ObjectType', v)
          if (!o[v.type]) {
            throw new Error('ObjectType not found')
          }
        }
      })
    })
  })
}

module.exports = checkSchema
