const {check, safeCheck} = require('./typeChecker')
const parseSchema = require('./schemaParser')
const stringTypeParser = require('./stringTypeParser')

class Schema {
  constructor(schema, {noExtras}={noExtras:true}){
    if (!schema){
      throw new Error('Schema not specified')
    }
    this.schema = parseSchema(schema)
    this.noExtras = noExtras
  }
  safeCheck(type, o, options){
    return safeCheck(schema, type, o, options)
  }
  check(type, o, options={noExtras: this.noExtras}){
    check(schema, type, o, options)
  }
}

module.exports = Schema
