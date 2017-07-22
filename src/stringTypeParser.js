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

module.exports = stringTypeParser
