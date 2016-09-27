# Metal Tasks

Tool for easily registering common gulp tasks for Metal components.

## Usage
**gulp-metal** can be used to register gulp tasks for your project through tools,
like [metal-tools-soy](https://www.npmjs.com/package/metal-tools-soy) and others.
Tools are just npm modules that can either be used on their own, or passed to
**gulp-metal**, and thus turned into gulp tasks.

To use **gulp-metal**, simply call its `registerTasks` function on your gulpfile,
passing it the tools that you want, for example:

```js

var metal = require('gulp-metal');
var metalToolsSoy = require('metal-tools-soy');

metal.registerTasks({
	tools: [metalToolsSoy]
});

// You can now type `gulp soy` on your project,
// to run the logic that `metal-tools-soy` provides.
```
