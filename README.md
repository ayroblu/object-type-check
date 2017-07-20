JS Type Checker
===============

Specifically this is for JSON to JS type checking, typically from URL calls.
For better type checking, probably using json-schema is what you want

Okay, actually looks pretty good, I want to support the optional spec too to some degree

* Optional types-> array of types, just do the array of types
* Includes enums + literal types

* So first, take stt and convert to array, where type is the split '|' but all other params are equal
    * this will not support array
    * actually its manually definable so its fine, just check if is array then do stuff
* Literals: add a literal type - list of primitives, add a 'values' field

Also have option to check for extra params

* Object.keys(resp).every(k=>type[k])


Given what this does, schema verification is probably a big deal

// Next: Should seperate out in to steps, 
// 1. validate schema
// 2. parse to proper schema type
// 3. Checker just checks against schema
