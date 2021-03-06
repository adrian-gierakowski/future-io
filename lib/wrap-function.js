const IO = require('./io')
const Task = require('data.task')
const isPromise = require('is-promise')
const $ = require('./types')

function wrapFunction (name, f) {
  return function wrapper (args) {
    return new IO(
      (interpreter) => interpreter(
        name,
        function wrapper (/* arguments */) {
          try {
            const result = f.apply(null, arguments)
            if (isPromise(result)) {
              return new Task((reject, resolve) => result.then(resolve, reject))
            } else if (isTask(result)) {
              return result
            } else {
              return Task.of(result)
            }
          } catch (error) {
            return Task.rejected(error)
          }
        },
        Array.prototype.slice.call(arguments)
      )
    )
  }
}

// isTask :: Task -> Boolean
function isTask (maybeTask) {
  maybeTask = maybeTask || {}
  const hasFork = maybeTask.fork instanceof Function
  const hasMap = maybeTask.map instanceof Function
  return (hasFork && hasMap)
}

module.exports = $.def(
  'wrapFunction',
  {},
  [$.String, $.Function, $.Function],
  wrapFunction
)
