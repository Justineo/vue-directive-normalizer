require('jsdom-global')()
const Vue = require('vue/dist/vue')
const test = require('ava')
const { normalize } = require('./src/index')

function handler () {}

const OPTIONS = {
  drag: {
    arg: 'targets[]',
    modifiers: {
      type: ['translate', 'rotate'],
      axis: [null, 'y', 'x']
    },
    value: 'drag'
  },
  outside: {
    arg: 'targets[]',
    value: 'handler',
    modifiers: {
      trigger: ['click', 'mousedown', 'mouseup', 'hover', 'focus'],
      delay: 0,
      excludeSelf: false
    }
  },
  shortkey: {
    value: 'keys',
    modifiers: {
      once: false,
      focus: false,
      push: false,
      avoid: false
    }
  }
}

function mount (options) {
  const el = document.createElement('div')
  document.body.appendChild(el)

  const vm = new Vue({
    el,
    created () {
      this.handler = handler
    },
    ...options
  })

  return {
    vm,
    unmount () {
      vm.$destroy()
      document.body.removeChild(el)
    }
  }
}

function assertNormalize (template, expected) {
  const [, name] = template.match(/v-(\w+)/)

  test.cb(template, t => {
    mount({
      template: `<div ${template}></div>`,
      directives: {
        [name]: {
          bind (el, binding) {
            t.deepEqual(
              normalize(binding, OPTIONS[name]),
              expected
            )
            t.end()
          }
        }
      }
    })
  })
}

assertNormalize('v-drag:foo="{ axis: \'x\' }"', {
  type: 'translate',
  targets: ['foo'],
  axis: 'x'
})

assertNormalize('v-drag:foo,bar.x',
  {
    type: 'translate',
    targets: ['foo', 'bar'],
    axis: 'x'
  }
)

assertNormalize('v-drag:foo.rotate.y="{ axis: \'x\' }"',
  {
    type: 'rotate',
    targets: ['foo'],
    axis: 'x'
  }
)

assertNormalize('v-drag:foo.translate="{ type: \'rotate\' }"',
  {
    type: 'rotate',
    targets: ['foo']
  }
)

assertNormalize('v-drag="handler"',
  {
    type: 'translate',
    targets: [],
    drag: handler
  }
)

assertNormalize('v-drag',
  {
    type: 'translate',
    targets: []
  }
)

assertNormalize('v-outside:foo="handler"', {
  targets: ['foo'],
  trigger: 'click',
  delay: 0,
  excludeSelf: false,
  handler
})

assertNormalize('v-outside:foo.hover.150="handler"',
  {
    targets: ['foo'],
    trigger: 'hover',
    delay: 150,
    excludeSelf: false,
    handler
  }
)

assertNormalize('v-outside:foo,bar="{ handler, trigger: \'mousedown\', excludeSelf: true }"',
  {
    targets: ['foo', 'bar'],
    trigger: 'mousedown',
    delay: 0,
    excludeSelf: true,
    handler
  }
)

assertNormalize('v-outside:foo.hover.excludeSelf.150="{ delay: 200, trigger: \'mousedown\', handler }"',
  {
    targets: ['foo'],
    trigger: 'mousedown',
    delay: 200,
    excludeSelf: true,
    handler
  }
)

assertNormalize('v-shortkey="[\'ctrl\', \'alt\', \'o\']"',
  {
    keys: ['ctrl', 'alt', 'o'],
    once: false,
    focus: false,
    push: false,
    avoid: false
  }
)

assertNormalize('v-shortkey.once="[\'ctrl\', \'alt\', \'o\']"',
  {
    keys: ['ctrl', 'alt', 'o'],
    once: true,
    focus: false,
    push: false,
    avoid: false
  }
)

assertNormalize('v-shortkey="{ up: [\'arrowup\'], down: [\'arrowdown\'] }"',
  {
    up: ['arrowup'],
    down: ['arrowdown'],
    once: false,
    focus: false,
    push: false,
    avoid: false
  }
)

assertNormalize('v-shortkey.focus="[\'alt\', \'i\']"',
  {
    keys: ['alt', 'i'],
    once: false,
    focus: true,
    push: false,
    avoid: false
  }
)

assertNormalize('v-shortkey.avoid',
  {
    once: false,
    focus: false,
    push: false,
    avoid: true
  }
)
