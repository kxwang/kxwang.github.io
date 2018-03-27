
# Directives

1. `{{}}`: One way binding between JS value and plain text or HTML. JS change affects text or HTML.
>```html
><!-- Render as plain text -->
><span>{{ message }}</span>
>
><!-- No future update after initialzation -->
><span v-once>{{ message }}</span>
>
><!-- Can use JavaScript expression. Good for simple computation -->
><span v-once>{{ message.split('').reverse().join('') }}</span>
>
><!-- Render as raw html. No data binding. This cannot do composition - use components instead. Only use this for trusted content. -->
><span v-html="raw-html-message"></span>
>```

2. `v-model`: Two way binding. HTML change will also change JS.
>```html
><input v-model="message">
>```

3. `v-bind`: Bind the value of a variable to HTML attribute or text
>```html
><!-- For text attributes. *title* is an *Argument* of this directive -->
><span v-bind:title="message">A test message</span>
>
><!-- For boolean attributes. Use JavaScript "==" false -->
><button v-bind:disabled="isButtonDisabled">Button</button>
>
><!-- Shorthand -->
><span :title="message">A test message</span>
>```

4. `v-if`: Decide if an element should be in the DOM or not.
>```html
><span v-if="shown">Now you see me</span>
>```

5. `v-for`: Bind an array to a collection of HTML elements
>```html
>  <ol>
>    <li v-for="todo in todos">
>      {{ todo.text }}
>    </li>
>  </ol>
>```

6. `v-on`: Attach event handler. You don't need to touch DOM directly. Just update JavaScript and Vue takes care of updating the DOM.
>```html
> <div id="app-5">
>   <p>{{ message }}</p>
>   <button v-on:click="reverseMessage">Reverse Message</button>
> </div>
>
><!-- *prevent* is a *Modifier* of this directive. Will call event.preventDefault() -->
><form v-on:submit.prevent="onSubmit"> ... </form>
>
><!-- Shorthand-->
><a @click="doSomething"> ... </a>
>```

> ```javascript
> var app5 = new Vue({  // A Vue application
>  el: '#app-5',        // The element to bind the application
>  data: {
>    message: 'Hello Vue.js!'       // variables
>  },
>  methods: {
>    reverseMessage: function () {  // functions
>      this.message = this.message.split('').reverse().join('')
>    }
>  }
>})
>```


# Component
Custom tags in Vue. Break an application into a tree of components Must register with Vue first.

```html
<ol>
  <!-- Create an instance of the todo-item component -->
  <todo-item></todo-item>
</ol>
```

```javascript
// Register/Define a new component called todo-item
Vue.component('todo-item', {
    // Define a property
    props: ['todo'],
    // Render the property in HTML
    template: '<li>{{ todo.text }}</li>'
})
```

# Vue Instance

## Initialization
Root application and compoents are all Vue instances. They can be configured by options during construction. The properties of the `data` option will become the instance's reactive variables: when they change, the view will re-render.

Properties added after construction will **not** be reactive. Add all properties you may need at the construction time.

```javascript
var vm = new Vue({
  el: '#vm-id',     // needs the #
  data: {
      a: 1,         // vm.a
      b: 'test',    // vm.b
  }
})
```
## Helpers

Helper functions and properties starts with $.
```javascript
vm.$data === vm.data
vm.$el === document.getElementById('vm-id')
vm.$watch('a', function (newValue, oldValue) {
  // This callback will be called when `vm.a` changes
})
```
## Lifecycle
Diagram at the bottom.
1. `created`: when the instance is ready. Properties can be accessed.
2. `mounted`: template compiled and added to DOM
3. `updated`: the view is re-rendered after data updated.
4. `destroyed`: all watchers, child components, event listeners removed.

## Template
Templates are compiled into V-DOM render functions. Vue used the reactive system to do minimal DOM updates when data changes.
You can write redner functions directly if so preferred.

## Computed Properties
HTML depends on computed properties, that depend on original properties. Difference between a computed property and a function: a function is always invoked while a comoputed property is **cached** and only invoked when the original property changes.
```html
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: "{{ reversedMessage }}"</p>
</div>
```

```javascript
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // a computed getter
    reversedMessage: function () {
      // `this` points to the vm instance
      return this.message.split('').reverse().join('')
    }
  }
})
```
Also support Getter and Setter. 

## Watchers
Allow async functions to be called without stalling UI. Can also limit how often the watcher is called, set a intermediary result, or update the result gradually.
```html
<div id="watch-example">
    <input v-model="question">
</div>
```

```javascript
var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
    question: '',
    answer: ''
  },
  watch: {
    // whenever question changes, this function will run
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      // Make Ajax calls to get answer
    }
  },
})
```

## HTML Classes and Styles
`v-bind:class`, `v-bind:style` allows object or array to be used instead of string.

## Conditional
Single element
```html
<h1 v-if="result === 1">Yes</h1>
<h1 v-else-if="result === 2">Maybe</h1>
<h1 v-else>No</h1>
```
Multiple elements
```html
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

![alt text](https://vuejs.org/images/lifecycle.png "Lifecycle diagram")