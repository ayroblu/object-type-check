function genericChecker(key){
  const genericKey = /^(\w+)<([\w,\s]+)>$/g.exec(key)
  let generics = null
  if (genericKey) {
    const name = genericKey[1]
    const params = genericKey[2].trim().split(/[\s,]/)
    generics = {
      name, params
    }
    // You need to check that generic type is not specified cause confused
  }
  return generics
}

module.exports = genericChecker
