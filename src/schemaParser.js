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
  return newSchema
}
function stringTypeParser(stringType){
  if (/^.+\?.+$/.test(stringType)){
    throw new Error('Question mark found in middle of string')
  }
  const stripped = stringType.replace(/\?/g, '')
  const arr = /^((Array|Promise)<)+([^\s<>]*?)(>)+$/g.exec(stripped)
  const numLeft = stringType.replace(/[^<]/g, '').length
  const balanced = numLeft === stringType.replace(/[^>]/g, '').length
  return (arr ? [arr[3]] : stripped.split('|')).map(a=>({
    type: a,
    isOptional: /\?$/.test(stringType),
    isNullable: /^\?/.test(stringType),
    array: !!arr && balanced && numLeft
  }))
}

module.exports = {
  parseSchema,
  stringTypeParser,
}
