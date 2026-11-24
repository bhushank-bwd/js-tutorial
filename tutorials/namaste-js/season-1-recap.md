# Namaste JavaScript — Season 1 Recap

Episodes 1–19. Full notes: `season-1.md`.

## Execution context

Everything in JavaScript runs inside an **execution context**.

| Component | Also called | Holds |
| --------- | ----------- | ----- |
| Memory | Variable environment | Variables and functions as key–value pairs |
| Code | Thread of execution | The program, one line at a time |

JavaScript is **synchronous** and **single-threaded**: one command at a time, in order. The next line starts only after the current one finishes. AJAX and timers do not change that rule; they are covered later.

## Two phases

Running a program creates the **global execution context (GEC)**.

| Phase | Name | What is stored |
| ----- | ---- | -------------- |
| 1 | Memory creation | `var` → `undefined`. A function declaration → the whole function. |
| 2 | Code execution | Assignments and calls run line by line. `undefined` is replaced by the real value. |

Invoking a function (`name()`) creates a **new execution context** for that call, with the same two phases. A parameter (`num`) is the name in the definition. An argument (`n`, `4`) is the value passed in.

`return` sends the value back to the caller and **deletes** that function’s execution context. When the program ends, the GEC is deleted too.

```js
var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n); // 4
var square4 = square(4); // 16
```

## Call stack

The call stack keeps the order of execution contexts. The GEC sits at the bottom. A call is **pushed**; a return is **popped**. An empty stack means the program is finished.

In the debugger the GEC is labeled **anonymous**.

Also called: execution context stack, program stack, control stack, runtime stack, machine stack.

```
square(n) running          after return          program done
| E1  |                    | GEC |               (empty)
| GEC |
```

## Hoisting

You can use a `var` or a function declaration before its line because phase 1 already allocated memory. It is not “the code is moved to the top.”

| Written as | In memory before the line runs |
| ---------- | ------------------------------ |
| `var x = 7` | `undefined` |
| `function getName() {}` | the function itself |
| `var getName = () => {}` | `undefined` |
| `var getName = function () {}` | `undefined` |

```js
getName();      // "Namaste JavaScript"
console.log(x); // undefined

var x = 7;
function getName() {
  console.log("Namaste JavaScript");
}
```

Calling an arrow function or a function expression before its assignment throws `getName is not a function`.

| | `undefined` | not defined |
| --- | --- | --- |
| Meaning | The name is in memory, still the placeholder | The name was never allocated |
| Result | `console.log(x)` prints `undefined` | `ReferenceError: x is not defined` |

## Each call has its own memory

The same name in two functions is two variables. `console.log(x)` reads `x` from the execution context that is running.

```js
var x = 1;
a();
b();
console.log(x);

function a() {
  var x = 10;
  console.log(x);
}
function b() {
  var x = 100;
  console.log(x);
}
```

Output: `10`, `100`, `1`. Global `x` stays `1`. This separation is the base for scope and closures.

## Shortest program, `window`, and `this`

Source: [Ep. 5](https://www.youtube.com/watch?v=QCRpVw2KXf8)

An **empty file** is still a program. The engine creates the global execution context, a **global object**, and global **`this`**.

| Runtime | Global object |
| ------- | ------------- |
| Browser (Chrome, Firefox, Safari) | `window` |
| Node.js | `global` |

At global level, `this === window`. `console`, `alert`, and `setTimeout` are already on `window`, which is why `console.log` works with no prefix. `this` inside a function is a later episode.

A `var` or a function declaration **not inside a function** is attached to `window`. The same name inside a function is not.

```js
var a = 10;
function b() {
  var x = 10;
}
console.log(window.a); // 10
console.log(this.a);   // 10
console.log(window.x); // undefined
```

## `undefined` vs not defined

Source: [Ep. 6](https://www.youtube.com/watch?v=B7iF6G3EyIk)

`undefined` is the placeholder phase 1 stores in a declared `var`. It takes memory. It is not an empty slot. **not defined** means the name was never declared, so reading it throws `ReferenceError`.

```js
console.log(a); // undefined
var a = 7;
console.log(a); // 7
console.log(x); // ReferenceError: x is not defined
```

`var a` with no assignment stays `undefined`. `a === undefined` is how you check. JavaScript is **loosely typed** (weakly typed): the same variable can later hold a number, a string, or a boolean. Do not assign `undefined` yourself.

## Scope chain and lexical environment

Source: [Ep. 7](https://www.youtube.com/watch?v=uH-tVP8MUs8)

**Scope** is where a name can be accessed. It follows where the function is written, not where it is called.

> Lexical environment = local memory + a reference to the parent’s lexical environment.

The global parent is `null`. The **scope chain** is the lookup: search the local memory, then the parent, then that parent, until the name is found or the chain ends. Ending at `null` throws `ReferenceError`.

```js
function a() {
  var b = 10;
  c();
  function c() {
    console.log(b); // 10 — c is written inside a, so it finds a's b
  }
}
a();
console.log(b); // ReferenceError — b is not in global memory
```

A local `b` inside `c` would win over an outer `b`. An inner function can read outer names. The outer code cannot read names that exist only inside the function.

## `let`, `const`, and the temporal dead zone

Source: [Ep. 8](https://www.youtube.com/watch?v=BNC6slYCj50)

`let` and `const` **are hoisted**, into a separate environment (the debugger calls the top-level one **Script**). They are not on `window`, and they stay uninitialized until their line runs. That gap is the **temporal dead zone**.

```js
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 10;
console.log(b); // undefined
var b = 15;
```

`let` can be assigned later. `const` must be initialized on its line and cannot be reassigned (`TypeError`). Declaring the same `let` or `const` twice is a `SyntaxError`, and nothing runs. Prefer `const`, then `let`.

| Error | Meaning |
| ----- | ------- |
| `ReferenceError: x is not defined` | never declared |
| `ReferenceError: Cannot access 'a' before initialization` | `let` / `const` still in the TDZ |
| `SyntaxError` | bad declaration (`let` redeclared, `const` with no value). The file does not run |
| `TypeError: Assignment to constant variable` | reassigning a `const` |

## Block scope and shadowing

Source: [Ep. 9](https://www.youtube.com/watch?v=lW_erSjyMeM)

A **block** is `{ }`. `let` and `const` live in that block’s memory and are gone when it ends. `var` is not block scoped, so it leaks to the function or the global scope.

**Shadowing** is an inner name hiding an outer one. A block `let` is a new binding, so the outer value stays. A block `var` is the same binding, so it overwrites the outer `var`.

```js
let b = 100;
{
  var a = 10; // same global a
  let b = 20; // different b
}
// a is 10, b is still 100
```

Shadowing a `let` or `const` with `var` inside a block is a `SyntaxError`, because that `var` escapes into the outer scope. The same `var` inside a function is legal.

## Closures

Source: [Ep. 10](https://www.youtube.com/watch?v=qikxEIxsXco)

A **closure** is a function bundled with the lexical environment where it was written. Returning the inner function returns that bundle, so the outer variables stay readable after the outer call is gone. It remembers the variable, not a copy of the value.

```js
function x() {
  var a = 7;
  function y() {
    console.log(a);
  }
  return y;
}
var z = x();
z(); // 7
```

## `setTimeout` and the loop

Source: [Ep. 11](https://www.youtube.com/watch?v=eBTBG4nda2A)

`setTimeout` does not pause the program. The callback runs later and closes over the same `var i`, so the loop below prints `Namaste JavaScript` and then `6` five times.

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
```

`let` gives each iteration its own `i`, so the logs are `1` through `5`. With `var`, wrap the callback in a function and pass `i` as a parameter. That parameter is a fresh binding.

## Closure interview

Source: [Ep. 12](https://www.youtube.com/watch?v=t1nFAMws5FI)

The closure still works if `var` is written below the inner function, if it is `let`, if the value is a parameter, and if the variable is in a grandparent scope. A nearer binding hides a global one.

Uses: data hiding, the module pattern, currying, memoization, and `setTimeout`. A function that returns `increment` keeps `count` private, and a second call to the outer function gets a separate `count`. The cost is memory: closed-over variables stay alive while the closure can still be called.

## First-class functions

Source: [Ep. 13](https://www.youtube.com/watch?v=SHINoHxvTso)

A **function statement** (also called a declaration) is hoisted as the function. A **function expression** is hoisted like a `var`: `undefined` until the assignment, so calling it early throws.

```js
a(); // works
b(); // TypeError: b is not a function
function a() {}
var b = function () {};
```

An anonymous function has no name and is a syntax error as a statement. It is used as a value. In `var b = function xyz() {}`, `b()` works and `xyz()` does not. `xyz` exists only inside the function.

Parameters are the names in the definition. Arguments are the values passed at the call. **First-class functions** means a function can be assigned, passed, and returned.

## Callbacks and event listeners

Source: [Ep. 14](https://www.youtube.com/watch?v=btj35dh3_U8)

A **callback** is a function passed into another function so it can be called later. `setTimeout` and `addEventListener` take callbacks. The program below prints `x`, then `y`, then `timer` after five seconds. JavaScript is still one thread. The timer callback just joins the call stack later.

```js
setTimeout(function () {
  console.log("timer");
}, 5000);
function x(y) {
  console.log("x");
  y();
}
x(function y() {
  console.log("y");
});
```

A long synchronous function blocks the main thread until it returns. Hide a click counter in a closure so outside code cannot change `count`. Remove a listener with the same function reference when it is done, or the closure stays in memory.

## Event loop

Source: [Ep. 15](https://www.youtube.com/watch?v=8zKuNo4ay8E)

JavaScript has one call stack and does not wait. `setTimeout`, the DOM, `fetch`, and `console` are Web APIs, not language features. A finished timer or a click puts its callback on the **callback queue**. The **event loop** moves it onto the stack only when the stack is empty. Promise callbacks go to the **microtask queue** and run first. If microtasks never stop arriving, task callbacks starve.

```js
console.log("Start");
setTimeout(function cb() {
  console.log("Callback");
}, 5000);
console.log("End");
// Start, End, then Callback
```

## The engine and V8

Source: [Ep. 16](https://www.youtube.com/watch?v=2WJL19wDH68)

A runtime is the engine plus the APIs, the event loop, and the queues. The engine parses source into an AST, then runs it with **just-in-time compilation**: an interpreter starts fast, a compiler optimizes hot code. Execution uses a memory heap and the call stack. Garbage collection **marks** reachable objects and **sweeps** the rest. V8’s pieces are Ignition (interpreter), TurboFan (compiler), and Orinoco (garbage collector). SpiderMonkey, V8, JavaScriptCore, and Chakra are different engines of the same language.

## Trust issues with `setTimeout`

Source: [Ep. 17](https://www.youtube.com/watch?v=nqsPmuicJJc)

The delay is a minimum. If the stack stays busy for 10 seconds, a 5-second callback waits those 10 seconds in the queue. Do not block the main thread. `setTimeout(fn, 0)` still runs after the current synchronous code: `Start`, `End`, then `Callback`.

## Higher-order functions

Source: [Ep. 18](https://www.youtube.com/watch?v=HkWxvB1RJq0)

A **higher-order function** takes a function or returns one. The function it receives is the callback. One `calculate(radius, operation)` loop can compute area or circumference by receiving that logic as a value. That is `map`.

## `map`, `filter`, and `reduce`

Source: [Ep. 19](https://www.youtube.com/watch?v=zdp0zrpKzIE)

None of the three change the original array.

| Method | Result |
| ------ | ------ |
| `map` | a new array, one transformed element each |
| `filter` | a new array of the elements whose callback was truthy |
| `reduce` | one value, built in an accumulator |

```js
const arr = [5, 1, 3, 2, 6];
arr.map((x) => x * 2); // [10, 2, 6, 4, 12]
arr.filter((x) => x % 2); // [5, 1, 3]
arr.reduce((acc, current) => acc + current, 0); // 17
```

`filter(...).map(...)` chains because each returns an array. `reduce` can build that same array by itself.
