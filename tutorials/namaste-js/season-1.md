# Namaste JavaScript — Season 1

## Episode 1: How JavaScript Works

> Everything in JavaScript happens inside an **execution context**.

An execution context is a big box, or container, in which the whole JavaScript program is executed. JavaScript is not possible without it.

## Two components

```
┌─────────────────────────────────────┐
│         Execution Context           │
│                                     │
│  1. Memory Component                │
│     (Variable Environment)          │
│     variables & functions           │
│     stored as key–value pairs       │
│                                     │
│  2. Code Component                  │
│     (Thread of Execution)           │
│     code runs one line at a time    │
└─────────────────────────────────────┘
```

### 1. Memory component — Variable Environment

The place where all variables and functions are stored as key–value pairs.

| Key        | Value    |
| ---------- | -------- |
| `a`        | `10`     |
| `square`   | function |

This component is also called the **variable environment**: the environment in which variables and functions live as key–value pairs.

### 2. Code component — Thread of Execution

The place where code is executed, one line at a time.

This component is also called the **thread of execution**: a single thread that runs the whole program line by line.

## JavaScript is synchronous and single-threaded

> JavaScript is a **synchronous single-threaded** language.

| Term               | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| Single-threaded    | JavaScript can execute only **one command at a time**.                 |
| Synchronous        | Commands run in a **specific order**. The next line starts only after the current line has finished. |

So the engine never jumps ahead. Line 2 waits until line 1 is done, line 3 waits until line 2 is done, and so on.

## What about AJAX?

AJAX is often described as asynchronous (`A` stands for Asynchronous). That looks like it contradicts “JavaScript is synchronous.” It does not change the rule above: JavaScript itself still runs one command at a time, in order, inside an execution context. How asynchronous work (AJAX, timers, and the rest) fits around that is covered in later episodes.

## Recap

- The whole program runs inside an **execution context**.
- **Memory component** (variable environment): variables and functions stored as key–value pairs.
- **Code component** (thread of execution): code runs one line at a time.
- JavaScript is **synchronous** and **single-threaded**: one command at a time, in a specific order.

---

## Episode 2: How JavaScript Code is Executed

> When you run a JavaScript program, an **execution context is created**.

The first one is the **global execution context**. It is still the same box from Episode 1: a memory component and a code component. It is built in two phases.

| Phase | Name | What happens |
| ----- | ---- | ------------ |
| 1 | Memory creation phase (creation phase) | JavaScript skims the program and allocates memory to every variable and function. |
| 2 | Code execution phase | JavaScript runs the program again, line by line, and does the actual work. |

### Sample program

```js
var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n);
var square4 = square(4);
```

`n` is `2`. `square` returns the square of the number passed in. `square2` and `square4` invoke that function.

## Phase 1 — Memory creation (global)

JavaScript walks the program and reserves memory before any line runs.

| Key | What is stored |
| --- | -------------- |
| `n` | `undefined` |
| `square` | the whole function code |
| `square2` | `undefined` |
| `square4` | `undefined` |

- A variable gets a special placeholder, **`undefined`**. It is not the real value yet.
- A function is different: the entire function body is stored in its memory space.
- `undefined` is a placeholder keyword. A later episode covers it on its own.

## Phase 2 — Code execution (global)

JavaScript walks the same program again and executes it.

1. **Line 1** — `var n = 2`. `undefined` in `n` is replaced with `2`.
2. **Lines 2–5** — the function declaration. Nothing left to execute; the code was already stored in phase 1. Control moves on.
3. **Line 6** — `var square2 = square(n)`. This is a **function invocation**: a function name followed by `()`.
4. **Line 7** — `var square4 = square(4)`. Another invocation. Same cycle, different argument.

## A function is a mini-program

Functions are the heart of JavaScript, and they behave differently here than in many other languages. A function is a mini-program. **Every time a function is invoked, a brand-new execution context is created**, with its own memory component and code component, and the same two phases.

The whole file runs inside the global execution context. Invoking `square` creates a separate execution context inside that work. While `square(n)` runs, only the body of `square` matters.

### `square(n)` — memory creation

Memory is allocated to everything inside the function, including parameters.

| Key | Phase 1 value |
| --- | ------------- |
| `num` | `undefined` |
| `ans` | `undefined` |

There is no nested function, so nothing else is stored.

### `square(n)` — code execution

| Piece | Role |
| ----- | ---- |
| `num` | **parameter** — the name in the function definition |
| `n` | **argument** — the value passed in at the call. Here `n` is `2` |

1. The argument `2` replaces `undefined` in `num`.
2. Line 3 runs `num * num`. `2 * 2` is `4`, so `ans` becomes `4`.
3. Line 4 hits `return ans`.

**`return` means the function is done.** It sends control back to the line that invoked the function, and it sends the value with it.

`return` looks up `ans` in this function’s **local memory** (`4`) and gives that value back to line 6. `undefined` in `square2` is replaced with `4`.

As soon as the function returns, **that execution context is deleted**. It does not stay around after the return.

### `square(4)` — same cycle

Line 7 invokes `square` again, this time with the argument `4` written directly. A new execution context is created.

| Step | Memory |
| ---- | ------ |
| Phase 1 | `num: undefined`, `ans: undefined` |
| Argument assigned | `num: 4` |
| `num * num` | `ans: 16` |
| `return ans` | control goes back to line 7; `square4` becomes `16` |

That execution context is then deleted.

Nothing is left to run. JavaScript is done, so the **global execution context is deleted** too.

```
After the program finishes

n        → 2
square   → function code
square2  → 4
square4  → 16

then the global execution context is removed
```

## Call stack

Creating and deleting execution contexts — including a function invoked inside another function, nested as deep as the program goes — is a lot to track. JavaScript manages it with a **call stack**.

The call stack maintains the **order of execution of execution contexts**.

- It is a stack.
- The bottom is always the **global execution context (GEC)**. Running any program pushes the GEC onto the stack.
- Whenever a new execution context is created, it is **pushed**.
- Whenever an execution context is deleted (the function returns), it is **popped**, and control returns to wherever it left off.

Walk-through for this program:

```
1. Program starts
   | GEC |

2. square(n) is invoked (line 6)
   | E1  |   ← execution context for this call
   | GEC |

3. square returns 4; E1 is popped
   | GEC |   ← control is back at line 6

4. square(4) is invoked (line 7)
   | E2  |
   | GEC |

5. square returns 16; E2 is popped
   | GEC |   ← control is back at line 7

6. Program finishes; GEC is popped
   (empty)
```

The call stack exists only to manage these execution contexts: push on creation, pop on deletion. When the program is finished, the stack is empty.

### Other names for the call stack

Same thing, different names you will see elsewhere:

1. Call stack
2. Execution context stack
3. Program stack
4. Control stack
5. Runtime stack
6. Machine stack

## Recap

- Running a program creates the **global execution context** (memory + code).
- **Phase 1, memory creation:** variables get `undefined`; a function stores its whole code.
- **Phase 2, code execution:** the program runs line by line. `n` becomes `2`. A function declaration has nothing left to run.
- **Invoking a function** (`square(n)`, `square(4)`) creates a new execution context and runs the same two phases for `num` and `ans`.
- `num` is the parameter; `n` or `4` is the argument.
- **`return`** sends the value back to the caller (`square2` is `4`, `square4` is `16`) and **deletes** that function’s execution context.
- When the program ends, the global execution context is deleted.
- The **call stack** pushes each execution context as it is created and pops it when it is deleted. The global execution context sits at the bottom until the program is done.

---

## Episode 3: Hoisting

> Hoisting is the phenomenon by which you can access variables and functions even before they are initialized, without an error.

It is not “JavaScript moves the declarations to the top of the file.” The real reason is phase 1 of the execution context: memory is allocated before any line runs.

### The expected program

```js
var x = 7;

function getName() {
  console.log("Namaste JavaScript");
}

getName();
console.log(x);
```

`getName` prints `Namaste JavaScript`. `console.log(x)` prints `7`.

### Access before initialization

Move the call and the log above the declarations:

```js
getName();
console.log(x);

var x = 7;

function getName() {
  console.log("Namaste JavaScript");
}
```

In most languages this is an error: the names are used before they exist. JavaScript prints:

```
Namaste JavaScript
undefined
```

- `getName()` runs. The function was already available.
- `console.log(x)` prints `undefined`, not `7`. The assignment has not run yet.

Logging the function (not calling it) prints the function itself, even when that log sits above the declaration:

```js
console.log(getName);

function getName() {
  console.log("Namaste JavaScript");
}
// ƒ getName() { console.log("Namaste JavaScript"); }
```

`x` before its assignment is `undefined`. `getName` before its declaration is the function.

## Why: memory is allocated before the first line runs

Before line 1 executes, phase 1 has already walked the program. A debugger stopped on the first line shows this in the global scope:

| Name | Already in memory |
| ---- | ----------------- |
| `x` | `undefined` |
| `getName` | the whole function |

That is why the lines at the top work:

1. `getName()` finds the function copy and prints `Namaste JavaScript`.
2. `console.log(x)` reads the placeholder and prints `undefined`.
3. `console.log(getName)` prints the function that was stored in phase 1.

Phase 2 then continues and assigns `7` to `x`. Anything that reads `x` after that line sees `7`.

## `undefined` vs not defined

They are not the same.

Remove `var x = 7` completely and still log `x`:

```js
getName();
console.log(x);

function getName() {
  console.log("Namaste JavaScript");
}
```

```
ReferenceError: x is not defined
```

| | `undefined` | not defined |
| --- | --- | --- |
| Memory | `x` was reserved in phase 1 and holds the placeholder `undefined` | `x` was never reserved. It does not exist in memory |
| When | `var x` is in the program, but the assignment has not run | There is no `var x` (or other declaration) anywhere |
| Result | `console.log(x)` prints `undefined` | `console.log(x)` throws `ReferenceError: x is not defined` |

`not defined` means the program never initialized that name, and the code tried to read it anyway.

## Arrow functions and function expressions are not hoisted as functions

Only a function **declaration** stores the whole function in phase 1.

An arrow function is stored like a variable. So is a function expression.

```js
getName();
console.log(getName);

var x = 7;

var getName = () => {
  console.log("Namaste JavaScript");
};
```

```js
var getName2 = function () {
  console.log("Namaste JavaScript");
};
```

Phase 1 memory:

| How it is written | Stored in phase 1 |
| ----------------- | ----------------- |
| `function getName() { ... }` | the whole function |
| `var getName = () => { ... }` | `undefined` |
| `var getName = function () { ... }` | `undefined` |
| `var x = 7` | `undefined` |

Calling the arrow function before the assignment throws `getName is not a function`, because the value in memory is still `undefined`. The function is attached only in phase 2, on the line `var getName = ...`.

## Call stack, in the debugger

The call stack from Episode 2 is visible while the program is paused.

1. A debugger on the first line shows one entry: **anonymous**. That is the global execution context, sitting at the bottom of the call stack. Control is still in the global code.
2. Step into `getName()`. A new execution context is pushed. The stack is `getName` on top of `anonymous`, and control is inside the function.
3. When the function finishes, that execution context is popped. Control returns to `anonymous`, on the next line of the global code.
4. When the program finishes, the call stack is empty. The global execution context is gone too.

```
paused on the first line
| anonymous |          ← global execution context

inside getName
| getName   |
| anonymous |

after getName returns
| anonymous |

program finished
(empty)
```

## Recap

- **Hoisting** means variables and functions can be accessed before their lines run, because phase 1 already allocated memory.
- Do not explain it as “the code is moved to the top.” Explain the **memory creation phase**.
- `var` is hoisted as `undefined`. A function declaration is hoisted as the function itself.
- An arrow function and a function expression are hoisted as variables: `undefined` until the assignment runs. Calling them early throws “is not a function.”
- **`undefined`**: the name is in memory, holding the placeholder. **not defined**: the name was never allocated, so reading it throws `ReferenceError`.
- The debugger’s call stack shows **anonymous** (global) at the bottom, the function pushed on call, and that frame popped when the function returns. The stack is empty when the program ends.

---

## Episode 4: Functions and the Variable Environment

The same variable name can exist in the global code and inside several functions. Each execution context keeps its own copy. They do not overwrite each other.

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

`a` and `b` can be called before their lines in the file because of hoisting. The output is:

```
10
100
1
```

`a` prints its own `x`. `b` prints its own `x`. The last log prints the global `x`, which is still `1`.

## Global execution context

Running the program creates the global execution context and pushes it onto the call stack. Phase 1 allocates memory before any line runs.

| Name | Phase 1 |
| ---- | ------- |
| `x` | `undefined` |
| `a` | the whole function |
| `b` | the whole function |

```
| GEC |
```

Phase 2 starts at line 1. `var x = 1` replaces `undefined` with `1`. Control moves to line 2, the call to `a`.

## `a()` — its own execution context

Invoking `a` creates an execution context limited to that function. It is a separate environment, not a copy of the global `x`. It has memory and code, and it goes through the same two phases. It is pushed onto the call stack. Control leaves the global code at line 2 and enters `a`.

Phase 1 inside `a`: there are no parameters and no nested functions, only `var x`.

| Name | Local memory of `a` |
| ---- | ------------------- |
| `x` | `undefined` |

Phase 2:

1. `var x = 10` replaces that local `undefined` with `10`.
2. `console.log(x)` searches the **local memory** of this execution context, finds `10`, and prints it.

The function is finished. Its execution context is deleted, and `a` is popped off the call stack. Control returns to the global execution context at line 2, then moves to line 3.

```
inside a()              after a() returns
| a   |                 | GEC |
| GEC |
```

The global `x` is still `1`. Nothing in `a` touched it.

## `b()` — another separate `x`

`b()` creates a brand-new execution context and pushes it. Phase 1 stores `x: undefined` in `b`’s local memory. Phase 2 sets that `x` to `100`. `console.log(x)` looks only in `b`’s local memory and prints `100`.

Then `b`’s execution context is deleted and popped. Control returns to the global code at line 3 and moves to line 4.

## Back in the global code

Line 4 is `console.log(x)` in the global execution context. JavaScript looks in **that** local memory, which is the global variable environment. `x` there is `1`, so the console prints `1`.

Nothing remains to run. The global execution context is deleted and popped. The call stack is empty.

```
1. program starts          | GEC |

2. a() is running          | a   |
                           | GEC |     console: 10

3. a() has returned        | GEC |

4. b() is running          | b   |
                           | GEC |     console: 10, 100

5. b() has returned        | GEC |     console: 10, 100, 1

6. program finished        (empty)
```

## What the debugger shows

Pause on line 1, before it runs:

- Call stack: the global execution context (anonymous).
- Scope: `a` and `b` are the functions, `x` is `undefined`.

Step over line 1: global `x` becomes `1`.

Step into `a`:

- Call stack: `a` on top of the global execution context.
- `a` has its own local scope. At the first line of `a`, local `x` is `undefined`. The scope panel also shows `this`; that is a later episode.
- After `var x = 10`, local `x` is `10`.
- The `console.log` prints `10`. `a` is then popped, and control is back on the global code.

Step into `b`:

- Call stack: `b` on top of the global execution context.
- Local `x` starts as `undefined`, then becomes `100`.
- The log prints `100`. `b` is popped.

The last global `console.log` prints `1`. The call stack is empty.

## Recap

- Every execution context has its own **variable environment**. A function’s memory is local to that call.
- `var x` in the global code, in `a`, and in `b` are three different variables. Setting one does not change the others.
- `console.log(x)` reads `x` from the execution context that is running: `10` inside `a`, `100` inside `b`, `1` in the global code.
- Each call is pushed when the function starts and popped when it returns. The global context stays at the bottom until the program ends, then the stack is empty.
- This separation is the base for scope and closures, covered in later episodes. The next episode is the shortest JavaScript program.

---

## Episode 5: Shortest JS Program, `window`, and `this`

Source: [Namaste JavaScript Ep. 5](https://www.youtube.com/watch?v=QCRpVw2KXf8) · [transcript](https://www.youtube-transcript.io/videos?id=QCRpVw2KXf8)

> The shortest JavaScript program is an **empty file**.

There is no line to run, and the engine still sets up the program. Before any of your code executes it creates:

1. The **global execution context** (memory + code), same as every other program.
2. A **global object**.
3. A **`this`** binding at the global level.

## `window`

In a browser, that global object is **`window`**. Type `window` in the console and the object is already there, even when the file is empty.

`window` is a large object the browser’s JavaScript engine creates. It holds many functions and values you did not write: `alert`, `setTimeout`, `console`, and the rest. They live in the global space, so any part of the program can use them. `console.log(...)` works without a prefix because `console` is `window.console`.

`console.log(window)` and `console.log(this)` at the top level both print this same object.

## `this` at the global level

At the global level, `this` points at the global object.

```js
console.log(this === window); // true
```

`this` inside a function is a different rule. That is a later episode.

## Not only the browser

JavaScript does not run only in the browser. Chrome, Firefox, and Safari each create the global object and name it `window`. Node.js creates a global object too, and names it `global`. Some other environments use another name.

Wherever the program runs, a global object is created along with the global execution context. In the browser, `this` at global level is `window`.

## Global `var` and functions are attached to `window`

Anything **not inside a function** is in the global space. A `var` or a function declaration written there is attached to the global object.

```js
var a = 10;

function b() {
  var x = 10;
}

console.log(a);        // 10
console.log(this.a);   // 10
console.log(window.a); // 10

console.log(window.b); // the function b
console.log(window.x); // undefined — x is inside b, not global
```

| Where it is written | On `window`? |
| ------------------- | ------------ |
| `var a = 10` at the top level | yes — `window.a` is `10` |
| `function b() {}` at the top level | yes — `window.b` is the function |
| `var x = 10` inside a function | no — it stays in that function’s local memory |

A function declared inside another function is not global, so it is not put on `window`. The next episode goes deeper on `undefined` versus not defined.

## Recap

- An empty file is a valid program. The engine still creates the global execution context, the global object, and global `this`.
- In the browser the global object is **`window`**. It already contains `console`, `alert`, `setTimeout`, and many other functions.
- At global level, **`this === window`**.
- Node.js and other runtimes also create a global object. The name changes (`global` in Node). The object is always there.
- A `var` or a function declaration that is not inside a function is attached to `window`. The same name written inside a function is not.

---

## Episode 6: `undefined` vs not defined

Source: [Namaste JavaScript Ep. 6](https://www.youtube.com/watch?v=B7iF6G3EyIk)

> `undefined` is a value JavaScript puts in memory. **not defined** means the name was never given memory.

`undefined` is a special keyword. Most other languages do not have this placeholder. It comes from phase 1: before any line runs, a declared variable already has a slot, and that slot holds `undefined`.

```js
console.log(a);
var a = 7;
```

Pause on a debugger before `var a = 7` runs. Memory for `a` is already reserved, and `console.log(a)` prints `undefined`. After the line runs, `a` is `7`.

A name that was never declared has no slot. Reading it throws.

```js
console.log(x);
// ReferenceError: x is not defined
```

| | `undefined` | not defined |
| --- | --- | --- |
| Memory | Reserved in phase 1 | Never reserved |
| When | `var a` is in the program, and no value has been assigned yet | There is no declaration of that name |
| Result | The read prints `undefined` | `ReferenceError: x is not defined` |

They are not the same, and `undefined` is not “empty.” The placeholder occupies its own memory until a real value replaces it.

Declare without assigning, and the placeholder stays for the whole program:

```js
var a;
console.log(a);            // undefined
console.log(a === undefined); // true

a = 10;
console.log(a === undefined); // false
```

Use `===` to ask whether the placeholder is still there.

## JavaScript is loosely typed

JavaScript does not attach a variable to one datatype. The same `var` can hold a number, then a string, then a boolean. The engine also coerces types when an operation needs it (a string used where a number is expected, and the other way around).

```js
var a;
console.log(a); // undefined
a = 10;
a = "Namaste JavaScript";
a = true;
```

“Loosely typed,” also called **weakly typed**, means that flexibility. It does not mean the language is weak. C and C++ bind a variable to a type at declaration. JavaScript does not.

## Do not assign `undefined` yourself

`undefined` is the engine’s placeholder for “no value has been assigned yet.” Writing `a = undefined` is legal and confusing: the name now looks uninitialized when your code put that value there on purpose. Leave `undefined` to the memory-creation phase.

## Recap

- Phase 1 stores **`undefined`** in every `var` until phase 2 assigns a value. The placeholder takes memory. It is not an empty slot.
- A declared variable with no assignment stays `undefined`. Check it with `a === undefined`.
- A name that was never declared is **not defined**. Reading it throws `ReferenceError`.
- JavaScript is **loosely typed** (weakly typed): one variable can hold different types over time.
- Do not assign `undefined` by hand. The next episode is the scope chain.

---

## Episode 7: Scope Chain, Scope, and Lexical Environment

Source: [Namaste JavaScript Ep. 7](https://www.youtube.com/watch?v=uH-tVP8MUs8)

> **Scope** is where a variable or function can be accessed. In JavaScript, scope follows the **lexical environment**.

**Lexical** means hierarchy: where the code physically sits in the source. A function nested inside another function is lexically inside that outer function. The place it is *called* does not decide this. The place it is *written* does.

## Four programs

### A function can read a global variable

```js
function a() {
  console.log(b);
}
var b = 10;
a(); // 10
```

`b` is not in `a`. The log still prints `10`, not `undefined`. `a` reaches the global `b`.

### A nested function can read it too

```js
function a() {
  c();
  function c() {
    console.log(b);
  }
}
var b = 10;
a(); // 10
```

`c` is written inside `a`, and `a` is written in the global code. `c` still finds the global `b`.

### The nearest `b` wins

```js
function a() {
  c();
  function c() {
    var b = 100;
    console.log(b);
  }
}
var b = 10;
a(); // 100
```

`c` has its own `b`. The search stops there. The global `b` stays `10` and is not used.

### The outer code cannot read an inner variable

```js
function a() {
  var b = 10;
  c();
  function c() {
    console.log(b);
  }
}
a();
console.log(b); // ReferenceError: b is not defined
```

`c` prints `10`, because `b` lives in `a` and `c` is written inside `a`. The global `console.log(b)` throws. `b` was never allocated in the global memory.

An inner function can read names from the functions it is physically nested inside, however deep. An outer execution context cannot read a name that exists only inside an inner one.

## Lexical environment

Whenever an execution context is created, a **lexical environment** is created with it.

> Lexical environment = local memory + a reference to the parent’s lexical environment.

| Execution context | Local memory | Parent reference |
| ----------------- | ------------ | ---------------- |
| Global | `a` → function | `null`. The global code has no parent. |
| `a` | `b` → `10`, `c` → function | the global lexical environment |
| `c` | nothing in the case where `b` lives in `a` | the lexical environment of `a` |

`c` is lexically inside `a`. `a` is lexically inside the global code. That nesting in the source is what the parent pointers follow.

```
c  →  a  →  global  →  null
```

## Scope chain

Looking up a name walks that chain. This walk is the **scope chain**.

Take `console.log(b)` inside `c`, with `var b = 10` inside `a`:

1. Look in `c`’s local memory. `b` is not there.
2. Follow the parent pointer to `a`. `b` is `10`. Stop and use it.
3. If `a` had no `b`, continue to the global lexical environment.
4. If the global memory has no `b`, the next parent is `null`. The search stops and JavaScript throws `ReferenceError: b is not defined`.

The local name always wins. In the program where `c` has `var b = 100`, step 1 finds `100` and never continues to the global `b`.

In the debugger’s Scope panel this chain is visible while paused inside `c`: the local scope, then the parent scope (`a`), then Global. The call stack at that moment is `c` on top of `a` on top of the global execution context. The scope chain is the parent pointers. The call stack is only the order of the running calls.

## Recap

- **Scope** is where a name can be accessed. It is decided by where the function is written.
- A **lexical environment** is the local memory of an execution context plus a reference to its parent’s lexical environment. The global parent is `null`.
- The **scope chain** is the search: local memory, then parent, then that parent, until the name is found or the chain ends at `null`.
- A nested function can read outer variables. The outer code cannot read variables that exist only inside the function.
- A local variable with the same name hides the outer one.

---

## Episode 8: `let`, `const`, and the Temporal Dead Zone

Source: [Namaste JavaScript Ep. 8](https://www.youtube.com/watch?v=BNC6slYCj50)

> `let` and `const` are hoisted. They are not initialized, and they are not on `window`.

```js
console.log(a); // ReferenceError: Cannot access 'a' before initialization
console.log(b); // undefined
let a = 10;
var b = 15;
console.log(a); // 10
console.log(window.a); // undefined — let is not a property of window
console.log(window.b); // 15
```

Phase 1 still allocates both names. They land in different places:

| Declaration | Where phase 1 puts it | Value before the line runs | On `window`? |
| ----------- | --------------------- | -------------------------- | ------------ |
| `var b` | Global object | `undefined`, and you may read it | yes |
| `let a` / `const a` | A separate lexical environment. The debugger labels the top-level one **Script** | uninitialized. Reading it throws | no |

So `let` is hoisted. The difference from `var` is that the binding stays uninitialized until execution reaches its line.

## Temporal dead zone

The **temporal dead zone (TDZ)** is the time from the start of the scope, when the `let` or `const` was hoisted, until the line that initializes it.

```js
// TDZ for a starts here
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 10;     // TDZ ends. a is 10
```

`temporal` means it depends on time — the order of execution — not only on where the text sits. Once `let a = 10` has run, later lines can read `a`. A `let a` with no assignment becomes `undefined` at that line, which is after the TDZ:

```js
let a;
console.log(a); // undefined
a = 10;
```

`const` has a TDZ too. It also must be initialized on the declaration line.

## `let` is stricter than `var`. `const` is stricter than `let`

```js
let a;
a = 10; // fine. declaration and assignment can be separate lines

const b = 100;
b = 1000; // TypeError: Assignment to constant variable

const c; // SyntaxError: Missing initializer in const declaration
```

You cannot declare the same `let` or `const` twice in one scope, and you cannot mix it with `var` of the same name. The engine rejects the program before any line runs:

```js
let a = 10;
let a = 100; // SyntaxError: Identifier 'a' has already been declared

let b = 10;
var b = 100; // SyntaxError: Identifier 'b' has already been declared
```

## Three errors

| Error | Example | What it means |
| ----- | ------- | ------------- |
| `ReferenceError: x is not defined` | read a name that was never declared | no binding exists |
| `ReferenceError: Cannot access 'a' before initialization` | read a `let` or `const` inside its TDZ | the binding exists and is still uninitialized |
| `SyntaxError: Identifier 'a' has already been declared` | `let` / `const` redeclared, or mixed with `var`, in the same scope | the program is rejected. Nothing runs |
| `SyntaxError: Missing initializer in const declaration` | `const c` with no value | `const` must be initialized where it is declared |
| `TypeError: Assignment to constant variable` | `b = 1000` after `const b = 100` | the binding exists and refuses a new value |

A syntax error stops the file before execution. A reference error or type error is thrown when that line runs.

## How to use them

Prefer `const`. Use `let` when the binding must be reassigned. Avoid `var`. Declare and initialize a `let` or `const` before any line that reads it, so the temporal dead zone shrinks to nothing. In an interview, `let` and `const` **are** hoisted. They stay uninitialized until their line, which is why access before that line throws.

## Recap

- `let` and `const` are hoisted into a separate environment (Script at the top level). They are not properties of `window`.
- Until the declaration line runs they are in the **temporal dead zone**. Reading them throws `Cannot access 'a' before initialization`. `var` is readable as `undefined` instead.
- `let` may be declared and assigned on different lines. `const` must be initialized immediately and cannot be reassigned.
- Redeclaring `let` or `const` is a **SyntaxError**. Reassigning `const` is a **TypeError**.
- Prefer `const`, then `let`. The next episode is block scope.

---

## Episode 9: Block Scope and Shadowing

Source: [Namaste JavaScript Ep. 9](https://www.youtube.com/watch?v=lW_erSjyMeM)

> A **block**, also called a compound statement, is a group of statements inside `{ }`.

`if`, `for`, `while`, and a function body are blocks. A bare block is legal too.

```js
{
  var a = 10;
  let b = 20;
  const c = 30;
}
console.log(a); // 10
console.log(b); // ReferenceError: b is not defined
console.log(c); // ReferenceError: c is not defined
```

`let` and `const` are **block scoped**. The block gets its own memory, which the debugger calls **Block**, and those names live there. When the block ends, that memory is gone.

`var` is not block scoped. It is function scoped, or global when it is outside a function. `var a` inside the block is stored in the enclosing global (or function) memory, so it is still there after the braces.

| Inside a block | Stored in | Visible after the block? |
| -------------- | --------- | ------------------------ |
| `var a` | the enclosing function, or Global | yes |
| `let b` | the Block memory | no |
| `const c` | the Block memory | no |

## Shadowing

**Shadowing** is an inner binding with the same name as an outer one. Inside the inner scope, the inner name is the one you see.

`var` does not make a new binding for a block. Both `var a` declarations are the same global (or function) variable, so the inner assignment changes the outer value:

```js
var a = 100;
{
  var a = 10;
  console.log(a); // 10
}
console.log(a); // 10 — the outer 100 was replaced
```

`let` and `const` do make a new binding in the Block memory. The outer binding is untouched:

```js
let b = 100;
{
  let b = 20;
  const c = 30;
  console.log(b); // 20
}
console.log(b); // 100
```

The same split happens in a function, including an arrow function. The scope rules do not change.

```js
const c = 100;
function x() {
  const c = 10;
  console.log(c); // 10
}
x();
console.log(c); // 100
```

## Illegal shadowing

A `var` inside a block is hoisted to the function or global scope around that block. If that scope already has a `let` or `const` of the same name, the `var` would collide with it. The program is rejected:

```js
let a = 20;
{
  var a = 20; // SyntaxError: Identifier 'a' has already been declared
}
```

Shadowing a `let` with another `let`, or a `var` with a `let`, is legal. They occupy different memories.

Putting the `var` inside a function is also legal. The `var` is scoped to that function, so it does not collide with the outer `let`:

```js
let a = 20;
function x() {
  var a = 20; // legal. this a belongs to x
}
```

| Outer | Inner, in a block | Result |
| ----- | ----------------- | ------ |
| `var` | `var` | legal. It is the same binding, so the outer value changes |
| `var` | `let` or `const` | legal. The block has its own binding |
| `let` or `const` | `let` or `const` | legal. The block has its own binding |
| `let` or `const` | `var` | **SyntaxError**. The `var` escapes the block into the outer scope |

## Recap

- A **block** is `{ }`. It groups statements and, for `let` and `const`, creates a scope.
- `let` and `const` live in the block’s memory and disappear when the block ends. `var` leaks to the enclosing function or the global scope.
- **Shadowing** means an inner name hides an outer one. A block `let` or `const` is a separate binding. A block `var` is the outer `var`.
- Shadowing a `let` or `const` with `var` in a nested block is a **SyntaxError**. The same `var` inside a function is fine, because `var` stops at the function.

---

## Episode 10: Closures

Source: [Namaste JavaScript Ep. 10](https://www.youtube.com/watch?v=qikxEIxsXco)

> A **closure** is a function bundled with its lexical environment.

The function keeps a reference to the scope where it was written. It can read those outer variables even after the outer function has returned and its execution context is gone.

```js
function x() {
  var a = 7;
  function y() {
    console.log(a);
  }
  return y;
}
var z = x();
console.log(z); // the function y
z(); // 7
```

`x()` creates `a` and `y`, then returns `y`. Returning `y` returns the closure: the function plus the lexical environment of `x`, where `a` is `7`. `z` holds that closure. Calling `z()` later still prints `7`, because `y` did not copy the number. It kept a reference to `a`.

The closure is formed when `y` is created, not only when it is returned. Calling `y()` inside `x()` is already a closure. The return just lets you use it after `x` has finished.

A function closes over every environment it is nested inside, not only the nearest one:

```js
function z() {
  var b = 900;
  function x() {
    var a = 7;
    function y() {
      console.log(a, b);
    }
    y();
  }
  x();
}
z(); // 7 900
```

`y` finds `a` in `x` and `b` in `z`. In the debugger, paused inside `y`, those outer bindings show up as a **Closure** scope.

## Recap

- A closure is the function together with the lexical environment where it was written.
- Returning the inner function returns that bundle. The outer variables stay reachable after the outer call has ended.
- The closure remembers the variable, the reference, not a snapshot of the value.
- It reaches every parent on the scope chain. The next episode is the `setTimeout` interview question that depends on this.

---

## Episode 11: `setTimeout` and Closures

Source: [Namaste JavaScript Ep. 11](https://www.youtube.com/watch?v=eBTBG4nda2A)

JavaScript does not wait. `setTimeout` stores the callback with a timer and the program continues. The callback runs later, and it is a closure over the variables it uses.

```js
function x() {
  var i = 1;
  setTimeout(function () {
    console.log(i);
  }, 3000);
  console.log("Namaste JavaScript");
}
x();
```

```
Namaste JavaScript
1          // about 3 seconds later
```

The string prints immediately. The callback still prints `1`, because it closed over `i`.

## Print 1, then 2, then 3, then 4, then 5

The interview asks for `1` after 1 second, `2` after 2 seconds, up to `5`. This looks right and is not:

```js
function x() {
  for (var i = 1; i <= 5; i++) {
    setTimeout(function () {
      console.log(i);
    }, i * 1000);
  }
  console.log("Namaste JavaScript");
}
x();
```

```
Namaste JavaScript
6
6
6
6
6
```

`var i` is one binding for the whole function. Each callback closes over that same `i`, not over the value `i` had when `setTimeout` was called. The loop finishes first, so `i` is `6`, and every callback reads `6`. The delays still differ (`1s`, `2s`, …). Only the value is shared.

`let` fixes it. `let` in a `for` header creates a new binding for each iteration, and each callback closes over its own `i`:

```js
for (let i = 1; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// 1, then 2, then 3, then 4, then 5
```

The same fix with `var` is a new function per iteration. The parameter is a fresh binding, and the callback closes over that:

```js
for (var i = 1; i <= 5; i++) {
  function close(i) {
    setTimeout(function () {
      console.log(i);
    }, i * 1000);
  }
  close(i);
}
```

## Recap

- `setTimeout` does not pause the program. The callback runs later and closes over the variables it uses.
- A closure holds the **reference**. Five callbacks and one `var i` all see the final `6`.
- `let` in the loop gives each callback its own `i`. A function parameter does the same thing with `var`.

---

## Episode 12: Closure Interview Questions

Source: [Namaste JavaScript Ep. 12](https://www.youtube.com/watch?v=t1nFAMws5FI)

### What is a closure?

A function together with a reference to its outer lexical environment. `inner` closes over `outer`, so `outer()()` prints `10` after `outer` has returned.

```js
function outer() {
  var a = 10;
  function inner() {
    console.log(a);
  }
  return inner;
}
outer()(); // 10
```

### Does the order of the lines matter?

No. The closure is the lexical environment, and `a` is in that environment even when the assignment is written below `inner`.

```js
function outer() {
  function inner() {
    console.log(a);
  }
  var a = 10;
  return inner;
}
outer()(); // 10
```

### Does `let` instead of `var` change it?

No. `inner` still closes over `a` and prints `10`.

### Can the inner function see the outer parameters?

Yes. A parameter lives in the function’s local memory, so it is part of the closure.

```js
function outer(str) {
  let a = 10;
  function inner() {
    console.log(a, str);
  }
  return inner;
}
outer("Hello There")(); // 10 "Hello There"
```

### Does it close over scopes further out?

Yes. The scope chain is the whole parent chain, so `inner` can read `outer` and `outest`.

```js
function outest() {
  var c = 20;
  function outer(str) {
    let a = 10;
    function inner() {
      console.log(a, c, str);
    }
    return inner;
  }
  return outer;
}
outest()("Hello There")(); // 10 20 "Hello There"
```

### What if a global `a` has the same name?

The nearest binding wins. `inner` finds `a` in `outer` and never reaches the global `100`. Remove `let a = 10` and the same call prints the global `100`. If no `a` exists anywhere, it throws `ReferenceError`.

```js
let a = 100;
outest()("Hello There")(); // still 10 20 "Hello There"
```

### Where are closures used?

- Data hiding and encapsulation
- The module pattern
- Currying
- Memoization
- `setTimeout` callbacks

### Data hiding

A `count` in the open can be changed by anyone. Put it inside a function and it is no longer reachable from outside. Each call to `counter()` creates a new closure, so `counter1` and `counter2` do not share a count.

```js
function counter() {
  var count = 0;
  return function increment() {
    count++;
    console.log(count);
  };
}
var counter1 = counter();
counter1(); // 1
counter1(); // 2
var counter2 = counter();
counter2(); // 1
```

A constructor exposes several functions over the same hidden `count`:

```js
function Counter() {
  var count = 0;
  this.incrementCounter = function () {
    count++;
    console.log(count);
  };
  this.decrementCounter = function () {
    count--;
    console.log(count);
  };
}
var counter1 = new Counter();
counter1.incrementCounter(); // 1
counter1.incrementCounter(); // 2
counter1.decrementCounter(); // 1
```

`count` is not a property of the object. Only the methods close over it.

### What is the cost?

A closed-over variable stays in memory as long as something can still call the closure. The garbage collector frees memory that nothing references, but it cannot free `x` while `y` might still read it. Many such closures keep more memory than the program looks like it needs. The collector is selective: a variable in that environment that the closure never reads can still be freed.

```js
function a() {
  var x = 0;
  return function b() {
    console.log(x);
  };
}
var y = a();
y(); // 0 — x is still alive because y closes over it
```

## Recap

- A closure is the function plus its outer lexical environment. Line order, `var` versus `let`, parameters, and grandparents on the scope chain do not remove it.
- Lookup still follows the scope chain. A nearer `a` hides a global `a`.
- Closures hide data. Each call gets its own private variables, and a constructor can expose several methods over one hidden binding.
- Those variables stay allocated while the closure is reachable. That is the memory cost.

---

## Episode 13: First-Class Functions and Anonymous Functions

Source: [Namaste JavaScript Ep. 13](https://www.youtube.com/watch?v=SHINoHxvTso)

Functions are the heart of JavaScript. The names below are the usual interview labels for ways of writing and using them.

### Function statement and function expression

A **function statement** declares a named function:

```js
function a() {
  console.log("a called");
}
a();
```

A **function expression** uses a function as a value and assigns it:

```js
var b = function () {
  console.log("b called");
};
b();
```

A function statement is also called a **function declaration**. Same thing.

The difference is hoisting, from the memory-creation phase.

```js
a(); // "a called"
b(); // TypeError: b is not a function

function a() {
  console.log("a called");
}
var b = function () {
  console.log("b called");
};
```

`a` is stored as the whole function before any line runs, so the early call works. `b` is stored like any other `var`: `undefined` until the assignment line. Calling `undefined` throws.

### Anonymous function

An **anonymous function** has no name. It cannot stand alone as a statement. The specification requires a function statement to have a name:

```js
function () {
  console.log("nope");
}
// SyntaxError: Function statements require a function name
```

Anonymous functions are used where a function is a value: assigned to a variable, passed as an argument, or returned.

### Named function expression

The expression can still have a name. That name is not created in the outer scope.

```js
var b = function xyz() {
  console.log("b called");
};
b(); // "b called"
xyz(); // ReferenceError: xyz is not defined
```

`xyz` exists only inside the function, so the function can call `xyz` to call itself. Outside, only `b` is visible.

### Parameters and arguments

| Word | What it is |
| ---- | ---------- |
| Parameter | The name in the function definition. A label. |
| Argument | The value passed at the call. |

```js
var b = function (param1, param2) {
  console.log(param1, param2);
};
b("Namaste", "JavaScript");
```

### First-class functions

The ability to use functions as values is called **first-class functions**. Functions are **first-class citizens**. You can assign them, pass them into another function, and return them.

```js
var b = function (param1) {
  console.log(param1);
};
b(function () {});

function xyz() {}
b(xyz);

var c = function () {
  return function () {};
};
console.log(c()); // the returned function
```

An arrow function, `() => {}`, is another way to write a function used as a value. Its other rules come in a later episode.

## Recap

- A **function statement** (declaration) is hoisted as the function. A **function expression** is hoisted as `undefined` until the assignment.
- An anonymous function has no name and is a syntax error as a statement. It is used as a value.
- In a named function expression, the inner name is visible only inside the function.
- Parameters are the names. Arguments are the values passed in.
- **First-class functions** means functions can be assigned, passed, and returned.

---

## Episode 14: Callback Functions and Event Listeners

Source: [Namaste JavaScript Ep. 14](https://www.youtube.com/watch?v=btj35dh3_U8)

> A **callback** is a function you pass into another function so that other function can call it later.

Because functions are first-class, `x` can receive `y` and decide when to call it. That is the door from synchronous JavaScript into asynchronous work such as timers and clicks.

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

```
x
y
timer
```

`x` and `y` run on the call stack immediately. The stack is then empty. About five seconds later the `setTimeout` callback appears on the stack and prints `timer`. All three still run on the one call stack. JavaScript did not grow a second thread.

## Do not block the main thread

The call stack is the main thread. If `x` takes 30 seconds, nothing else runs until it returns: no timer callback, no click. That is **blocking the main thread**.

Work that takes time should be handed off, the way `setTimeout` hands the callback to the timer and lets the stack continue. The next episode is how that handoff works.

## Event listeners

`addEventListener` takes an event name and a callback. The callback runs later, when the event happens, and then it is pushed onto the call stack.

```html
<button id="clickMe">Click Me!</button>
```

```js
document.getElementById("clickMe").addEventListener("click", function xyz() {
  console.log("Button clicked");
});
```

A click counter in the global scope works, and anyone can change `count`:

```js
let count = 0;
document.getElementById("clickMe").addEventListener("click", function xyz() {
  console.log("Button clicked", ++count);
});
```

Hide `count` in a closure. The listener closes over it, and outside code cannot reach it:

```js
function attachEventListener() {
  let count = 0;
  document.getElementById("clickMe").addEventListener("click", function xyz() {
    console.log("Button clicked", ++count);
  });
}
attachEventListener();
```

## Remove the listener

The listener stays registered after `attachEventListener` returns, because a click may still come. The closure keeps `count` alive the whole time. Many click, scroll, and hover listeners hold memory that way and can make a page slow.

When the listener is no longer needed, remove it so the closure can be garbage-collected:

```js
function xyz() {
  console.log("Button clicked");
}
var button = document.getElementById("clickMe");
button.addEventListener("click", xyz);
button.removeEventListener("click", xyz);
```

`removeEventListener` needs the same function reference that was added. An anonymous function written twice is two different functions, so the removal does not match.

## Recap

- A callback is a function passed into another function, to be called later. Timers and event listeners are callbacks.
- JavaScript stays single-threaded. The callback still runs on the one call stack, just later.
- A long synchronous function blocks the main thread. Nothing else runs until it returns.
- An event listener’s callback can close over private data such as `count`.
- Remove listeners that are finished. Otherwise the closure, and its variables, stay in memory.

---

## Episode 15: The Event Loop

Source: [Namaste JavaScript Ep. 15](https://www.youtube.com/watch?v=8zKuNo4ay8E)

JavaScript itself is still synchronous and single-threaded. It has one call stack, and that stack does not wait. The browser (or Node.js) is what makes asynchronous work possible.

The **JavaScript runtime** around the engine has:

- the call stack
- **Web APIs**
- a **callback queue** (also called the task queue)
- a **microtask queue**
- the **event loop**

`setTimeout`, the DOM (`document`), `fetch`, `localStorage`, `console`, and `location` are not part of the JavaScript language. They are Web APIs the environment gives you. They hang off `window`, which is why `setTimeout(...)` and `window.setTimeout(...)` are the same call.

## A timer

```js
console.log("Start");
setTimeout(function cb() {
  console.log("Callback");
}, 5000);
console.log("End");
```

```
Start
End
Callback
```

1. The global execution context runs. `"Start"` prints. `console.log` is a Web API call.
2. `setTimeout` registers `cb` with the timer Web API and starts 5000 ms. JavaScript does not wait. `"End"` prints, and the global execution context leaves the stack.
3. When the timer expires, `cb` cannot jump onto the stack. It is placed on the **callback queue**.
4. The **event loop** looks at the stack and the queue. When the stack is empty and the queue has a callback, the loop pushes that callback onto the stack. Then it runs.

The event loop’s job is that check: empty stack, something in a queue, move one callback over.

## A click

```js
console.log("Start");
document.getElementById("btn").addEventListener("click", function cb() {
  console.log("Callback");
});
console.log("End");
```

`"Start"` and `"End"` print, and the global execution context is gone. The listener stays in the Web API environment until you remove it or close the page. Each click puts one `cb` on the callback queue. Six fast clicks mean six callbacks, run one by one whenever the stack is free.

## Microtask queue

Promise callbacks do not use the callback queue. They use the **microtask queue**, and that queue is emptied before the callback queue is touched.

```js
console.log("Start");
setTimeout(function cbT() {
  console.log("CB Timeout");
}, 5000);
fetch("https://api.netflix.com").then(function cbF() {
  console.log("CB Netflix");
});
console.log("End");
```

`setTimeout` registers `cbT` with the timer. `fetch` registers the request, and its `.then` callback is a microtask. After `"Start"` and `"End"`, the stack is empty. If the response is already back, `cbF` runs before `cbT`, even when the timer has also expired.

| Queue | What goes there | Priority |
| ----- | --------------- | -------- |
| Microtask queue | Promise callbacks, `MutationObserver` | First. Drained completely. |
| Callback queue (task queue) | `setTimeout`, `setInterval`, DOM events | After the microtask queue is empty. |

If microtasks keep adding more microtasks, a callback sitting in the callback queue never runs. That is **starvation**.

`map`, `filter`, and `reduce` callbacks are ordinary synchronous calls. They are not registered with a Web API and they do not enter either queue.

## Recap

- The call stack runs JavaScript and does not wait. Timers, DOM, `fetch`, and `console` are Web APIs.
- A finished timer or a click puts its callback on the callback queue. The event loop moves it to the stack only when the stack is empty.
- Promise callbacks go to the microtask queue and run before task callbacks. A queue that never empties starves the other queue.
- An event listener stays registered until it is removed.

---

## Episode 16: The JS Engine and V8

Source: [Namaste JavaScript Ep. 16](https://www.youtube.com/watch?v=2WJL19wDH68)

JavaScript runs in a watch, a browser, or Node.js because each of those has a **JavaScript runtime environment**: an engine, APIs to the outside world, the event loop, and the queues from Episode 15. The engine is the heart of that container. It is not a machine. It is a program, usually written in C++, that takes JavaScript and produces machine code.

**ECMAScript** is the language standard those engines implement. Engines differ:

| Engine | Where it runs |
| ------ | ------------- |
| SpiderMonkey | Firefox. The first JavaScript engine, written by the language’s creator. |
| V8 | Chrome, modern Edge, and Node.js |
| JavaScriptCore | Safari |
| Chakra | old Internet Explorer and the old Edge |

## Three steps

```
source code → Parsing → Compilation → Execution
```

**Parsing.** The code is split into tokens (`let`, `a`, `=`, `7`). A syntax parser turns the tokens into an **abstract syntax tree** (AST), a tree of the program’s structure. [astexplorer.net](https://astexplorer.net) shows that tree.

**Compilation.** JavaScript is not only interpreted. Modern engines use **just-in-time (JIT) compilation**: an interpreter and a compiler work together while the program runs. The interpreter turns the AST into bytecode and starts execution quickly. The compiler watches hot code and replaces it with optimized machine code. Older engines only interpreted. Today JavaScript is a JIT-compiled language.

**Execution.** Two structures do the work:

- the **memory heap**, where objects are allocated
- the **call stack**, the same stack from the earlier episodes

A **garbage collector** frees memory that nothing can reach. The common algorithm is **mark and sweep**: mark every object reachable from the roots (the stack and globals), then sweep away what was not marked.

## V8

Google’s V8 names the three pieces:

| Piece | Role |
| ----- | ---- |
| Ignition | the interpreter |
| TurboFan | the optimizing compiler |
| Orinoco | the garbage collector |

Ignition produces bytecode and runs it. Code that runs often is handed to TurboFan, which compiles a faster version. If an assumption that optimization relied on becomes false, V8 throws that optimized code away and goes back to Ignition. That is deoptimization.

## Recap

- A runtime is the engine plus Web APIs, the event loop, and the queues. The engine turns JavaScript into machine code.
- Parsing builds an AST. JIT compilation interprets first and optimizes hot code. Execution uses a heap and a call stack.
- Garbage collection marks what is still reachable and sweeps the rest.
- In V8 those jobs belong to Ignition, TurboFan, and Orinoco.

---

## Episode 17: Trust Issues with `setTimeout`

Source: [Namaste JavaScript Ep. 17](https://www.youtube.com/watch?v=nqsPmuicJJc)

> `setTimeout(fn, 5000)` means **at least** 5 seconds, not exactly 5 seconds.

```js
console.log("Start");
setTimeout(function cb() {
  console.log("Callback");
}, 5000);
console.log("End");
// then a million lines that take about 10 seconds
```

`"Start"` prints. The timer Web API stores `cb` and starts 5 seconds. `"End"` prints, and the million lines keep the global execution context on the stack. The timer expires during that work, so `cb` moves to the callback queue and waits. The event loop will not move it until the stack is empty. If that takes 10 seconds, `cb` runs at 10 seconds. The delay was only a minimum.

The first rule stays: do not block the main thread. There is one call stack. A long synchronous stretch delays every timer and every click.

## `setTimeout(fn, 0)`

```js
console.log("Start");
setTimeout(function cb() {
  console.log("Callback");
}, 0);
console.log("End");
```

```
Start
End
Callback
```

A delay of `0` does not mean “run now.” `cb` is still registered, still queued, and still waits for an empty stack. `"End"` is already on the stack, so it finishes first. `0` is a way to defer a less urgent callback until the current synchronous work is done.

## Recap

- The delay is a minimum. A busy call stack holds the callback in the queue past that time.
- Do not block the main thread. One long function delays every callback.
- `setTimeout(fn, 0)` still prints after the lines that follow it. The callback must go through the queue.

---

## Episode 18: Higher-Order Functions

Source: [Namaste JavaScript Ep. 18](https://www.youtube.com/watch?v=HkWxvB1RJq0)

> A **higher-order function** takes one or more functions as arguments, or returns a function.

The function you pass in is the callback. This is possible because functions are first-class values. Functional programming here means writing the logic as a function and handing that function to another function, instead of copying the loop.

```js
function x() {
  console.log("Hi");
}
function y(x) {
  x();
}
y(x); // Hi
```

`y` is the higher-order function. `x` is the callback.

## One loop, many operations

An array of radii needs area, then circumference. A separate loop for each calculation repeats the same walk over the array and breaks DRY (don’t repeat yourself).

```js
const radius = [1, 2, 3, 4];

const area = function (r) {
  return Math.PI * r * r;
};
const circumference = function (r) {
  return 2 * Math.PI * r;
};

const calculate = function (radius, operation) {
  const output = [];
  for (let i = 0; i < radius.length; i++) {
    output.push(operation(radius[i]));
  }
  return output;
};

console.log(calculate(radius, area));
console.log(calculate(radius, circumference));
```

`calculate` is the higher-order function. `area` and `circumference` are the logic, passed in as values. `calculate` is also a small version of `Array.prototype.map`.

```js
Array.prototype.calculate = function (operation) {
  const output = [];
  for (let i = 0; i < this.length; i++) {
    output.push(operation(this[i]));
  }
  return output;
};
console.log(radius.calculate(area));
```

`map`, `filter`, and `reduce` are the higher-order functions used this way in real code. The next episode is those three.

## Recap

- A higher-order function takes a function or returns one. The function it receives is a callback.
- Pass the operation in. Keep one loop. That is the functional-programming move in this episode, and it is what `map` does.

---

## Episode 19: `map`, `filter`, and `reduce`

Source: [Namaste JavaScript Ep. 19](https://www.youtube.com/watch?v=zdp0zrpKzIE)

All three are higher-order functions on arrays. None of them change the original array. Each returns something new.

```js
const arr = [5, 1, 3, 2, 6];
```

### `map` transforms every element

The result has the same length. The callback says what each element becomes.

```js
const double = (x) => x * 2;
arr.map(double); // [10, 2, 6, 4, 12]
arr.map((x) => x * 3); // [15, 3, 9, 6, 18]
arr.map((x) => x.toString(2)); // ["101", "1", "11", "10", "110"]
```

### `filter` keeps some elements

The callback returns true or false. Only the true elements go into the new array.

```js
arr.filter((x) => x % 2); // [5, 1, 3] — odds, because 1 is truthy
arr.filter((x) => x > 4); // [5, 6]
```

### `reduce` folds the array into one value

The callback receives an accumulator and the current element. The second argument to `reduce` is the accumulator’s starting value. For a sum, that start is `0`, the same role as `sum = 0` in a loop.

```js
const sum = arr.reduce(function (acc, current) {
  acc = acc + current;
  return acc;
}, 0);
// 17
```

Max works the same way. Name the accumulator `max` if that reads more clearly. It is still the value carried from one element to the next.

```js
const max = arr.reduce((max, current) => {
  if (current > max) max = current;
  return max;
}, 0);
// 6
```

The single value does not have to be a number. Age counts come back as one object:

```js
const users = [
  { firstName: "akshay", lastName: "saini", age: 26 },
  { firstName: "donald", lastName: "trump", age: 75 },
  { firstName: "elon", lastName: "musk", age: 50 },
  { firstName: "deepika", lastName: "padukone", age: 26 },
];

users.map((user) => user.firstName + " " + user.lastName);
// ["akshay saini", "donald trump", "elon musk", "deepika padukone"]

users.reduce((acc, curr) => {
  if (acc[curr.age]) acc[curr.age]++;
  else acc[curr.age] = 1;
  return acc;
}, {});
// { 26: 2, 75: 1, 50: 1 }
```

### Chaining

`filter` and `map` return arrays, so the next method can take that array. First names of people younger than 30:

```js
users.filter((user) => user.age < 30).map((user) => user.firstName);
// ["akshay", "deepika"]
```

`reduce` can do both steps, because it can build any one result, including an array:

```js
users.reduce((acc, curr) => {
  if (curr.age < 30) acc.push(curr.firstName);
  return acc;
}, []);
// ["akshay", "deepika"]
```

| Method | Result |
| ------ | ------ |
| `map` | a new array, one transformed element per input |
| `filter` | a new array of the elements whose callback was truthy |
| `reduce` | one value: a number, an object, an array, or anything else the accumulator builds |

## Recap

- `map` transforms every element. `filter` keeps the ones that pass. `reduce` carries one accumulator across the array.
- The original array stays as it was. Chain `filter` into `map` when you need both. `reduce` can produce that same result alone.
