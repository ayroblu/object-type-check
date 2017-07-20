Object Type Check
=================

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
        country: 'string?',
        isActive: '?boolean',
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
