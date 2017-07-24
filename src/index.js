const {check, safeCheck} = require('./typeChecker')
const parseSchema = require('./schemaParser')
const checkSchema = require('./schemaSpec')

class Schema {
  constructor(schema, {noExtras}={noExtras:true}){
    if (!schema){
      throw new Error('Schema not specified')
    }
    this.schema = parseSchema(schema)
    checkSchema(this.schema)
    this.noExtras = noExtras
  }
  safeCheck(type, o, options){
    return safeCheck(this.schema, type, o, options)
  }
  check(type, o, options={noExtras: this.noExtras}){
    return check(this.schema, type, o, options)
  }
}

module.exports = Schema
