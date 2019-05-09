# Vue Directive Normalizer

A tool helps you normalizing directive arguments, modifiers and value.

## Get started

### Installation

```sh
$ npm i -D vue-directive-normalizer
```

### Usage

```js
import { normalize } from 'vue-directive-normalizer'

const DRAG_SCHEMA = {
  arg: 'targets[]',
  modifiers: {
    type: ['translate', 'rotate'],
    axis: [null, 'y', 'x']
  },
  value: 'drag'
})

Vue.directive('drag', {
  bind (el, binding) {
    const options = normalize(binding, DRAG_SCHEMA)

    // ...other logic...
  }
})

```

## Motivation

Directives in Vue.js have the form of `v-directive:arg.modifierA.modifierB="value"`.

For directive authors, in directive hooks Vue gives us a `binding` object which contains (mainly) the following properties:

* `value: *`
* `arg: string`
* `modifiers: Object<string, boolean>`

...along with a bunch of others.

Let's assume we are implementing a `v-drag` directive which support the following options:

* `type: 'translate' | 'rotate' | 'scale'` - The effect of the drag behavior.
* `targets: string[]` - The `ref` of elements that move along with current “handle” element.
* `axis: null | 'x' | 'y'` - Wether restrict the moving direction within x/y axis.
* `drag: function` - The callback when the element is being dragged.
* `dragstart: function` - The callback when the element starts being dragged.
* `dragend: function` - The callback when the element stops being dragged.

To leverage the simplicity and consistency of directive syntax, a possible pattern of designing directive API could be as follows.

### Option bag

To be most verbose and thorough, we accept an “option bag” for the `value` part:

```html
<div v-drag="{
  type: 'translate',
  targets: 'dialog',
  axis: 'x',
  drag: handleDrag,
  dragstart: handleDragStart
}"></div>
```

### Using `modifiers`

For boolean and enum options, we can leverage `modifiers` for simpler usage:

```html
<div v-drag.x="{
  targets: 'dialog',
  drag: handleDrag,
  dragstart: handleDragStart
}"></div>
```

For a normalizer to recognize `modifiers` properly, we may need some schema definition like:

```js
{
  modifiers: {
    // list all possible values for string enums
    type: ['translate', 'rotate', 'scale'],
    // we can use the first item as the default value,
    // use `null` to indicate the option isn't required
    axis: [null, 'x', 'y']
  }
}
```

Using this schema, we can extract our modifiers into the normalized option bag:

```js
{
  type: 'translate', // default value
  axis: 'x'
}
```

### Using `arg`

We can move sting values into `arg`, lets say we use arg to pass `targets`:

```html
<div v-drag:dialog.x="{
  drag: handleDrag,
  dragstart: handleDragStart
}"></div>
```

As the option name suggests, we may pass multiple refs into `targets`. We can use a micro-syntax here that different refs are separated with `,`:

```html
<div v-drag:dialog,tooltip.x="{
  drag: handleDrag,
  dragstart: handleDragStart
}"></div>
```

For a normalizer to recognize `arg` properly, we may need some schema definition like:

```js
{
  // just use the key name that maps the option to the arg
  arg: 'targets'
}
```

For multiple values, we can use a micro-syntax as follows and the arg will automatically splitted into a string array:

```js
{
  arg: 'targets[]'
}
```

So that `v-drag:dialog,tooltip` will produce:

```js
{
  targets: ['dialog', 'tooltip']
}
```

### Simplifying value

In some cases, we may want a “main” option that act like a major callback function or something instructs how the directive work in general. Let's say in our `v-drag` directive, it might be the `drag` callback.

So we can make the `value` implicitly stands for `drag` if `value` isn't a plain object and we are not passing in any other options apart from those can be expressed in `modifiers` and `arg`.

eg. When we don't want to pass in the `dragstart` callback, we can just use `handleDrag` as `value`:

```html
<div v-drag:dialog,tooltip.x="handleDrag"></div>
```

In order to map `value` to `drag`, we need to add this to our schema:

```js
{
  value: 'drag'
}
```

And we'll get:

```js
{
  drag: handleDrag,
  targets: ['dialog', 'tooltip'],
  type: 'translate',
  axis: 'x'
}
```

If we let the directive do all the work and don't want to provide a callback at all, we can use:

```html
<div v-drag:dialog,tooltip.x></div>
```

Which produces:

```js
{
  targets: ['dialog', 'tooltip'],
  type: 'translate',
  axis: 'x'
}
```

## License

MIT
