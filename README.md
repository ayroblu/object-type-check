Object Type Check
=================

[![Build Status](https://travis-ci.org/ayroblu/object-type-check.svg?branch=master)](https://travis-ci.org/ayroblu/object-type-check)
[![Coverage Status](https://coveralls.io/repos/github/ayroblu/object-type-check/badge.svg?branch=master)](https://coveralls.io/github/ayroblu/object-type-check?branch=master)

Specifically this is for JSON to JS type checking, typically from URL calls.
For better type checking, probably using json-schema is what you want

I got the inspiration from flow for compile time but not runtime checking, and I wanted to do some runtime checking, so I made this

TODO: Explain how this works cause its pretty simple

Installation
-------------
yarn add object-type-check

Usage
-----
```javascript
const Schema = require('object-type-check')

const schema = {
    User: {
        id: 'number',
        name: 'string',
        age: 'string|number',
        country: 'string?', //Allow it to be undefined / missing
        isActive: '?boolean', // Allow it to be null
        friends: 'Array<string>'
    }
}
const matcher = new Schema(schema)
// this throws on error
matcher.check('User', {
    id: 123
    name: 'Jules'
    age: '23'
    isActive: null
})
// this doesn't throw
const isValid = matcher.check('User', {
    id: 123,
    name: 'Jules',
    age: '23',
    country: 123,
    isActive: null,
})
```

Schema Definition
-----------------
It should probably be noted that I haven't covered all the possible ways to break this, but there's a bunch of tests and they're pretty good

Conventionally definitions should probably start with a capital letter, but that isn't enforced

### String definition
As seen above, using strings to define the types

```javascript
const schema = {
    User: {
        id: 'number',
        name: 'string',
        age: 'string|number', // union / or operator
        country: 'string?', //Allow it to be undefined / missing
        isActive: '?boolean', // Allow it to be null
        friends: 'Array<string>', // Arrays can't be unioned
        answers: 'Array<Array<number>>',
    }
}
```

### Object definition
This is probably the more traditional - using an object definition - something like swagger uses this I believe

```javascript
const schema = {
    User: {
        id: {type: 'number'},
        name: {type: 'string'},
        age: {type: 'string|number'},
        country: {type: 'string', isOptional: true},
        isActive: {type: 'boolean', isNullable: true},
        friends: {type: 'string', array: true},
        answers: {type: 'number', array: 2},
    }
}
```

### Array Object definition
This is how I actually represent the data in the end, so everything is cast to this, and gives you the most control, but doesn't make much difference for the effort

```javascript
const schema = {
    User: {
        id: [{type: 'number'}],
        name: [{type: 'string'}],
        age: [{type: 'string'}, {type: 'number', array: true}], // the only way to specify an array union type
        country: [{type: 'string', isOptional: true}],
        isActive: [{type: 'boolean', isNullable: true}],
        friends: [{type: 'string', array: true}],
        answers: [{type: 'number', array: 2}],
    }
}
```

TODO
----
* Generics
    * being about to specify something like `Parent<Child>`, where the parent would be the same, but the child would be different - for example in an api call that returns a results object (json-api) with counts etc
    * Rename generics to `Parent<T1, T2>`, then you can search them
* Functions
    * Being about to specify your own custom checker like `Even()`, where `"Even": o=>typeof o === 'number' && o % 2 === 0`
    * Should I be able to specify a type with a custom function?
    * & is probably too hard a thing to incorporate, especially with | though I guess we can allow only one, otherwise brackets and more
        * Only useful with a custom function
        * `Even<number>()` maybe?

Note
----
This generic type test is important, if you define a generic, then you can define with an existing type and it won't check it, and instead will do generic substitution first

```javascript
it('has a defined generic type', ()=>{
  const tSchema = {
    T: {name: 'string'}
  , 'Basic<T>': {name: 'T'}
  }
  const matcher = new Schema(tSchema)
  let isValid = matcher.check('Basic<number>', {name: 3})
  assert(isValid)
  assert.throws(()=>{
    matcher.check('Basic<number>', {name: {name: 'hi'}})
  })
})
```
