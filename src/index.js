export function normalize (
  { arg: bArg, modifiers: bModifiers = {}, value: bValue },
  { arg, modifiers, value }
) {
  const specified =
    !isObject(bValue) && value ? (bValue ? { [value]: bValue } : {}) : bValue

  const extracted = {}

  if (arg) {
    const [, name, array] = arg.match(/^(\w+)(\[\])?$/)
    if (name) {
      if (array) {
        extracted[name] = bArg ? bArg.split(',').filter((t) => t) : []
      } else if (bArg) {
        extracted[name] = bArg
      }
    }
  }

  if (modifiers) {
    Object.keys(modifiers).forEach((name) => {
      const modifier = modifiers[name]
      if (Array.isArray(modifier)) {
        modifier.forEach((val) => {
          if (val === null) {
            return
          }

          if (bModifiers[val]) {
            if (name in extracted) {
              throw new Error(
                `[${name}] value cannot be both [${extracted[name]}] and [${val}].`
              )
            }
            extracted[name] = val
          }
        })

        // Fill in the default value if necessary
        if (!(name in extracted) && modifier[0] != null) {
          extracted[name] = modifier[0]
        }

        return
      }

      if (typeof modifier === 'boolean') {
        if (bModifiers[name]) {
          extracted[name] = true
        } else {
          extracted[name] = modifier
        }

        return
      }

      if (typeof modifier === 'number') {
        const numValue = find(Object.keys(bModifiers), (key) => {
          const num = Number(key)
          return !isNaN(num) && num > 0
        })

        if (numValue != null) {
          extracted[name] = Number(numValue)
        } else {
          extracted[name] = modifier
        }
      }
    })
  }

  return assign(extracted, specified)
}

function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

function find (array, predicate) {
  let result = null
  array.some((item) => {
    if (predicate(item)) {
      result = item
      return true
    }
    return false
  })
  return result
}

function assign (target, ...sources) {
  if (target == null) {
    // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const to = Object(target)

  sources.forEach((source) => {
    if (source != null) {
      // Skip over if undefined or null
      for (const key in source) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          to[key] = source[key]
        }
      }
    }
  })

  return to
}
