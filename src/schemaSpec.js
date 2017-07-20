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
    ]}
    isOptional: 'boolean?',
    isNullable: 'boolean?',
  }
  LiteralType: {
    type: {type: 'literal', values: ['literal']},
    values: {type: 'any', array: true}
  }
}
function checkSchema(o){
  const matcher = new Schema()
  //matcher.safeCheck('safeCheck')
  // 1. Loop through schema, make sure everything is just simple objects
}

module.exports = checkSchema
