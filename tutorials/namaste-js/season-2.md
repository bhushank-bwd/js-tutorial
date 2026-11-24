# Namaste JavaScript — Season 2

## Episode 1: Callback Hell

Source: [Namaste JavaScript Season 2, Ep. 1](https://www.youtube.com/watch?v=yEKtJGha3yM)

JavaScript is still synchronous and single-threaded. It has one call stack and does one thing at a time. The engine runs the code it is given and does not wait. Time, tide, and JavaScript wait for none.

```js
console.log("Namaste");
console.log("JavaScript");
console.log("Season 2");
// Namaste
// JavaScript
// Season 2
```

## The good part

A **callback** is how JavaScript does work later. Wrap the delayed line in a function and hand that function to `setTimeout`. `setTimeout` is then responsible for calling it after 5000 ms.

```js
console.log("Namaste");
setTimeout(function () {
  console.log("JavaScript");
}, 5000);
console.log("Season 2");
// Namaste
// Season 2
// JavaScript   — about 5 seconds later
```

Asynchronous programming in JavaScript exists because callbacks exist. You pass a piece of code that some other function will run at a later time.

The same pattern chains dependent asynchronous steps. An e-commerce cart cannot proceed to payment until an order exists. `createOrder` receives the cart and a callback, creates the order, and only then calls that callback.

```js
const cart = ["shoes", "pants", "kurta"];

api.createOrder(cart, function () {
  api.proceedToPayment();
});
```

## Callback hell

Each next step depends on the one before it: payment, then the order summary, then the wallet. Each step is another callback passed into the previous API.

```js
api.createOrder(cart, function () {
  api.proceedToPayment(function () {
    api.showOrderSummary(function () {
      api.updateWallet();
    });
  });
});
```

That nesting is **callback hell**, also called the **pyramid of doom**. One callback sits inside another, with more APIs and conditions stuffed between them. The code grows sideways instead of downward. It is hard to read and hard to change, and it shows up in real production code.

## Inversion of control

The more serious problem is **inversion of control**. You lose control of your own code when you pass a callback.

```js
api.createOrder(cart, function () {
  api.proceedToPayment();
});
```

`proceedToPayment` is an important part of the program. Handing it to `createOrder` means trusting that API to call it. `createOrder` may belong to another service, or another developer. You no longer decide when your function runs.

Two failures follow from that trust:

- The callback is **never called**. Payment never happens.
- The callback is **called twice**. The customer is charged twice.

You gave another function the responsibility for your code, and you cannot see what it does with that responsibility. Promises, in the next episode, are the way to take that control back.

## Recap

- Callbacks are how synchronous JavaScript schedules work for later. `setTimeout` and a chain of dependent APIs both use them.
- **Callback hell** is nested callbacks. The program grows horizontally and becomes difficult to maintain. The shape is the pyramid of doom.
- **Inversion of control** means the function you passed your callback to now decides whether that callback runs, and how many times.
- Those two problems are the reason the next episode is promises.

---

## Episode 2: Promises

Source: [Namaste JavaScript Season 2, Ep. 2](https://www.youtube.com/watch?v=ap-6PPAuK1Y)

> A promise is a placeholder for a value that is not ready yet. It is a container for a future value, and an object representing the eventual completion or failure of an asynchronous operation.

`createOrder` and `proceedToPayment` are asynchronous, and payment needs the order id. Calling them one after another does not wait:

```js
const cart = ["shoes", "pants", "kurta"];

const orderId = createOrder(cart);
proceedToPayment(orderId);
```

The callback version waits, and it hands your function to `createOrder`. That is the inversion of control from Episode 1.

```js
createOrder(cart, function (orderId) {
  proceedToPayment(orderId);
});
```

## Attach, do not pass

`createOrder` returns a promise immediately. JavaScript does not wait for the order. The promise starts empty. When the order id is ready, that value is filled in.

```js
const promise = createOrder(cart);

promise.then(function (orderId) {
  proceedToPayment(orderId);
});
```

`.then` **attaches** the function to the promise. It does not give the function to `createOrder`. The promise calls the attached function when the data is there, and it calls it **once**. A callback you passed in might never run, or might run twice. A function attached with `.then` does not.

## What a promise looks like

`fetch` returns a promise. The next line runs while the request is still in flight.

```js
const URL = "https://api.github.com/users/akshaymarch7";
const user = fetch(URL);

console.log(user); // Promise { <pending> }

user.then(function (data) {
  console.log(data);
});
```

| Field | At the start | After the request finishes |
| ----- | ------------ | -------------------------- |
| `promiseState` | `pending` | `fulfilled` or `rejected` |
| `promiseResult` | `undefined` | the value, or the error |

A pending promise becomes one of two settled states, and then it stays there. The result is immutable. You do not write into the promise. You read it with `.then`.

| State | Meaning |
| ----- | ------- |
| `pending` | The operation is still running. |
| `fulfilled` | It finished with a value. |
| `rejected` | It failed with a reason. |

Chrome can show the same logged promise as pending, then as fulfilled when you expand it. The log is a live object. The line `console.log(user)` ran while the promise was still pending.

## Promise chaining

The pyramid of callbacks grows sideways. Each `.then` returns a promise, so the next step is attached underneath instead of inside.

```js
createOrder(cart, function (orderId) {
  proceedToPayment(orderId, function (paymentInfo) {
    showOrderSummary(paymentInfo, function (balance) {
      updateWallet(balance);
    });
  });
});
```

```js
createOrder(cart)
  .then(function (orderId) {
    return proceedToPayment(orderId);
  })
  .then(function (paymentInfo) {
    return showOrderSummary(paymentInfo);
  })
  .then(function (balance) {
    return updateWallet(balance);
  });
```

The value or promise **returned** from one `.then` is what the next `.then` receives. Forgetting the `return` breaks the chain: the next step gets `undefined` and does not wait for the previous promise.

## Recap

- A promise is a placeholder for the future result of an asynchronous operation. It is returned immediately, in the `pending` state.
- `.then` attaches your function. The promise calls it once, when the result is ready. That returns the control that a passed callback gave away.
- States are `pending`, `fulfilled`, and `rejected`. A settled promise does not change, and you do not mutate it.
- Returning each promise from `.then` chains the steps and replaces callback hell.

---

## Episode 3: Creating a Promise, Chaining, and Error Handling

Source: [Namaste JavaScript Season 2, Ep. 3](https://www.youtube.com/watch?v=U74BJcr8NeQ)

Episode 2 consumed a promise. This episode writes the function that produces one.

The **producer** uses the `Promise` constructor. JavaScript calls the executor immediately and passes `resolve` and `reject`. Call `resolve` with the success value. Call `reject` with an error. Then return the promise so the caller can attach `.then`.

```js
const cart = ["shoes", "pants", "kurta"];

function validateCart(cart) {
  return cart.length > 0;
}

function createOrder(cart) {
  return new Promise(function (resolve, reject) {
    if (!validateCart(cart)) {
      reject(new Error("Cart is not valid"));
      return;
    }
    const orderId = "12345";
    resolve(orderId);
  });
}
```

The **consumer** attaches the next step. `createOrder` returns the promise at once. If the work inside is still running, `console.log(promise)` prints `Promise { <pending> }`. `.then` runs when `resolve` is called.

```js
const promise = createOrder(cart);

promise.then(function (orderId) {
  proceedToPayment(orderId);
});
```

## `.catch`

`reject` skips `.then` and goes to `.catch`.

```js
createOrder(cart)
  .then(function (orderId) {
    proceedToPayment(orderId);
  })
  .catch(function (err) {
    console.log(err.message);
  });
```

An empty cart rejects with `"Cart is not valid"`. `.then` does not run.

## Chaining

Whatever a `.then` returns becomes the input of the next `.then`. Return a plain value, or return another promise and the chain waits for it.

```js
function proceedToPayment(orderId) {
  return new Promise(function (resolve) {
    resolve("Payment Successful");
  });
}

createOrder(cart)
  .then(function (orderId) {
    console.log(orderId);
    return orderId;
  })
  .then(function (orderId) {
    return proceedToPayment(orderId);
  })
  .then(function (paymentInfo) {
    console.log(paymentInfo);
  })
  .catch(function (err) {
    console.log(err.message);
  });
```

A rejection anywhere above that `.catch` jumps to it. The `.then` handlers after the failure do not run.

Forgetting `return` is the usual bug. The next `.then` then receives `undefined` and does not wait.

```js
createOrder(cart)
  .then(function (orderId) {
    proceedToPayment(orderId); // not returned
  })
  .then(function (paymentInfo) {
    console.log(paymentInfo); // undefined
  });
```

## Where `.catch` sits

A `.catch` handles failures in the steps above it.

At the end, one `.catch` covers the whole chain. Payment never starts if `createOrder` rejects.

In the middle, that `.catch` handles only what is above it. The chain continues with whatever the `.catch` returns, so later steps still run.

```js
createOrder(cart)
  .then(function (orderId) {
    return orderId;
  })
  .catch(function (err) {
    console.log(err.message);
  })
  .then(function () {
    console.log("This still runs");
  });
```

## Recap

- `new Promise` gives you `resolve` and `reject`. Return that promise. The caller attaches `.then` and `.catch`.
- `resolve(value)` fulfills. `reject(error)` rejects. `.catch` receives the rejection, and later `.then` handlers in that chain are skipped.
- Return a value or a promise from each `.then`. The next step receives it. No `return` means the next step gets `undefined`.
- A `.catch` covers the steps above it. Put it at the end to stop the chain, or in the middle to recover and continue.

---

## Episode 4: `async` / `await`

Source: [Namaste JavaScript Season 2, Ep. 4](https://www.youtube.com/watch?v=6nv3qy3oNkc)

`async` / `await` is another way to use promises. It is syntactic sugar. Underneath, it is still a promise.

## `async`

An `async` function always returns a promise. A plain return value is wrapped in a fulfilled promise. A returned promise is passed through as it is.

```js
async function getData() {
  return "Namaste JavaScript";
}

const dataPromise = getData();
console.log(dataPromise); // Promise { <fulfilled>: "Namaste JavaScript" }
dataPromise.then((res) => console.log(res)); // Namaste JavaScript
```

## `await`

`await` sits in front of a promise and can be used only inside an `async` function. It unwraps the fulfilled value. Outside an `async` function it is a syntax error.

```js
const p = new Promise((resolve) => {
  setTimeout(() => resolve("Promise resolved value!!"), 3000);
});

function getData() {
  p.then((res) => console.log(res));
  console.log("Hello There!");
}
getData();
// Hello There!
// Promise resolved value!!     — about 3 seconds later
```

```js
async function handlePromise() {
  const val = await p;
  console.log("Hello There!");
  console.log(val);
}
handlePromise();
// about 3 seconds later:
// Hello There!
// Promise resolved value!!
```

With `.then`, the line after the call runs immediately. With `await`, the lines after it in that function run only once the promise is fulfilled. The function looks synchronous.

## The engine is not waiting

Time, tide, and JavaScript still wait for none. `await` does not freeze the call stack. If it did, the page would lock.

When execution reaches `await`:

1. The rest of the `async` function is suspended.
2. Its execution context leaves the call stack.
3. Other code keeps running.
4. When the promise settles, the function is resumed from the next line, through the microtask queue.

```js
console.log("Before");

async function example() {
  console.log("Inside, before await");
  await Promise.resolve();
  console.log("Inside, after await");
}
example();
console.log("After");
// Before
// Inside, before await
// After
// Inside, after await
```

`"After"` prints before the line under `await`. The stack was free the whole time.

## Two awaits

A promise starts when it is created, not when it is awaited. Both timers below start together, before `handlePromise` reaches either `await`.

```js
const p1 = new Promise((resolve) => {
  setTimeout(() => resolve("p1"), 10000);
});
const p2 = new Promise((resolve) => {
  setTimeout(() => resolve("p2"), 5000);
});

async function handlePromise() {
  console.log("Hi");
  const val = await p1;
  console.log(val);
  const val2 = await p2;
  console.log(val2);
}
handlePromise();
```

`"Hi"` prints now. Ten seconds later both values print, `p1` then `p2`, with no extra five-second wait. `p2` finished at five seconds and was already fulfilled when the function reached it.

Await `p2` first and the prints split: `p2` at about five seconds, then `p1` at about ten.

To make the second timer start only after the first promise finishes, create that promise after the first `await`:

```js
function createP1() {
  return new Promise((resolve) => setTimeout(() => resolve("p1"), 10000));
}
function createP2() {
  return new Promise((resolve) => setTimeout(() => resolve("p2"), 5000));
}

async function handlePromise() {
  console.log(await createP1());
  console.log(await createP2());
}
```

That is about fifteen seconds. `createP2()` is not called until `createP1()` has fulfilled.

## `fetch`

`fetch` returns a promise of a response. `response.json()` returns another promise, of the parsed body. `await` each one.

```js
async function handlePromise() {
  const data = await fetch("https://api.github.com/users/akshaymarch7");
  const res = await data.json();
  console.log(res);
}
handlePromise();
```

## Errors

`.catch` becomes `try` / `catch`. A rejected promise throws at the `await`, and control goes to `catch`.

```js
async function handlePromise() {
  try {
    const data = await fetch("https://api.github.com/users/akshaymarch7");
    const res = await data.json();
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}
handlePromise();
```

The function itself still returns a promise, so the caller can attach `.catch` instead:

```js
handlePromise().catch((err) => console.log(err));
```

## Recap

- An `async` function always returns a promise. A normal return value is wrapped. A returned promise is used as it is.
- `await` unwraps a promise and continues that function only after it settles. It is valid only inside an `async` function.
- The call stack is not blocked. The function is suspended, and it resumes later from the microtask queue.
- A promise starts when it is created. Awaiting one that is already fulfilled continues immediately. Create the next promise after the `await` when the steps must be sequential.
- Handle failure with `try` / `catch`, or with `.catch` on the promise the `async` function returns. The two styles are the same promises, written so the steps read from top to bottom.

---

## Episode 5: Promise APIs

Source: [Namaste JavaScript Season 2, Ep. 5](https://www.youtube.com/watch?v=DlTVt1rZjIo)

Four static methods run several promises together. They are how you make parallel API calls instead of awaiting one, then the next.

Use the same three promises for every case. `p1` settles in 3 seconds, `p2` in 1 second, `p3` in 2 seconds. The result array keeps that input order. It is not the order they finished.

```js
const p1 = new Promise((resolve) => setTimeout(() => resolve("P1 Success"), 3000));
const p2 = new Promise((resolve) => setTimeout(() => resolve("P2 Success"), 1000));
const p3 = new Promise((resolve) => setTimeout(() => resolve("P3 Success"), 2000));
```

A promise is **settled** when it has a result. Settled splits in two:

| Word | Meaning |
| ---- | ------- |
| fulfilled, resolved | success, and it has a value |
| rejected | failure, and it has a reason |

## `Promise.all`

Waits until every promise fulfills. The result is one array, after the slowest one (3 seconds): `["P1 Success", "P2 Success", "P3 Success"]`.

It **fails fast**. If `p2` rejects at 1 second, `Promise.all` rejects then, with `p2`'s error. It does not wait for `p1` and `p3`. Those two keep running. Their results are discarded.

```js
Promise.all([p1, p2, p3])
  .then((results) => console.log(results))
  .catch((err) => console.error(err));
```

## `Promise.allSettled`

Waits for every promise to settle, success or failure. The returned promise fulfills either way. After 3 seconds the result is one object per input:

```js
[
  { status: "fulfilled", value: "P1 Success" },
  { status: "fulfilled", value: "P2 Success" },
  { status: "rejected", reason: "P3 Fail" },
]
```

This is the safe one when you need every outcome. `Promise.all` fails fast. `Promise.allSettled` collects.

## `Promise.race`

The first promise to settle wins, whether it fulfills or rejects. The others are ignored.

- `p2` fulfills at 1 second, and `p3` would reject at 2 seconds: the race fulfills with `"P2 Success"`.
- `p3` rejects at 2 seconds and the others are slower: the race rejects with `"P3 Fail"`.

## `Promise.any`

The first promise to **fulfill** wins. Rejections are skipped.

`p3` rejects at 2 seconds and `p1` fulfills at 3 seconds, so the result is `"P1 Success"`. A later success is used if every earlier promise rejected.

If all of them reject, the result is an `AggregateError`: `All promises were rejected`. The individual reasons are on `err.errors`.

```js
Promise.any([p1, p2, p3])
  .then((result) => console.log(result))
  .catch((err) => {
    console.error(err);
    console.error(err.errors);
  });
```

| API | Succeeds when | Fails when | Result |
| --- | ------------- | ---------- | ------ |
| `Promise.all` | every input fulfills | the first rejection | an array of values, in input order |
| `Promise.allSettled` | always, after every input has settled | it does not fail because an input rejected | an array of `{ status, value }` or `{ status, reason }` |
| `Promise.race` | the first settled promise fulfilled | the first settled promise rejected | that one value, or that one error |
| `Promise.any` | the first fulfillment | every input rejected | that one value, or an `AggregateError` |

`Promise.resolve(value)` and `Promise.reject(error)` are the other two static methods. They make an already settled promise. They do not combine a list.

## Recap

- `Promise.all` is the parallel call. One rejection fails the whole thing immediately.
- `Promise.allSettled` waits for all of them and reports each status.
- `Promise.race` takes the first result, success or failure.
- `Promise.any` takes the first success. If there is none, the error is an `AggregateError` and `err.errors` lists the reasons.

---

## JavaScript before React

Source: [playlist index 7](https://www.youtube.com/watch?v=--VcGI9iPvw)

HTML and CSS are the page. JavaScript is the part that has to be in place before React. These are the topics, in the order from the video. Most of them are already in the Season 1 and Season 2 notes.

| Topic | What to be able to write |
| ----- | ------------------------ |
| Variables | `let`, `const`, and `var`, including how they are hoisted |
| Functions | Arrow functions and higher-order functions. Functions are the heart of JavaScript and of React |
| Arrays and objects | Object destructuring, array destructuring, rest, and spread |
| Conditions | `if` / `else`, the ternary `? :`, `&&`, `\|\|`, and optional chaining `?.` |
| Array methods | `map`, `filter`, `reduce`, and `sort`. `map` should be fluent |
| Events and timers | Click, mouse, and key listeners. Bubbling and capturing. `setTimeout` and `setInterval` |
| Async | Callbacks, callback hell, promises, the promise APIs, and `fetch` |
| `async` / `await` | The usual way modern React code waits for a promise |
| `try` / `catch` | Error handling around an API call or an `async` function |

---

## Episode 6: The `this` Keyword

Source: [Namaste JavaScript Season 2, Ep. 6](https://www.youtube.com/watch?v=9T4z98JcHR0)

> `this` is decided by **how the function is called**, not by where it is written.

### Global space

At the top level, `this` is the global object. In a browser that object is `window`. In Node.js it is `global`. The name changes with the runtime. The role does not.

```js
console.log(this); // window, in a browser
```

### A normal function

Inside a function, `this` is `undefined` in strict mode. In non-strict mode it becomes the global object. That replacement is **this substitution**: when `this` would be `null` or `undefined`, non-strict mode puts the global object there instead. Strict mode leaves it `undefined`.

```js
"use strict";
function x() {
  console.log(this);
}
x(); // undefined
window.x(); // window — the call has an object in front of it
```

The same function gets a different `this` from a different call.

### A method

A function stored on an object is a method. Called as `obj.x()`, `this` is that object.

```js
const obj = {
  a: 10,
  x: function () {
    console.log(this);
    console.log(this.a);
  },
};
obj.x(); // the object, then 10
```

Pull the function off the object and the object is no longer the call:

```js
const fn = obj.x;
fn(); // this is not obj
```

### `call`, `apply`, and `bind`

These three set `this` so a method can be reused on another object.

```js
const student = {
  name: "Alok",
  printName: function () {
    console.log(this.name);
  },
};
const student2 = { name: "Kajal" };

student.printName(); // Alok
student.printName.call(student2); // Kajal
```

| Method | What it does |
| ------ | ------------ |
| `call` | Calls the function now. Arguments are listed one by one. `fn.call(obj, a, b)` |
| `apply` | Calls the function now. Arguments are one array. `fn.apply(obj, [a, b])` |
| `bind` | Does not call it. Returns a new function whose `this` is fixed. `const bound = fn.bind(obj)` |

### An arrow function

An arrow function has no `this` of its own. It uses the `this` of the function it is written inside.

```js
const obj = {
  a: 10,
  x: () => {
    console.log(this); // window — the arrow is written in global code
  },
};
obj.x();

const obj2 = {
  a: 10,
  x: function () {
    const y = () => {
      console.log(this); // obj2 — y is written inside x, and x was called as obj2.x()
    };
    y();
  },
};
obj2.x();
```

### A DOM handler

In an element’s own handler, `this` is that element.

```html
<button onclick="alert(this)">Click Me</button>
<!-- [object HTMLButtonElement] -->
```

## Recap

- Global `this` is the global object: `window` in a browser, `global` in Node.js.
- In a normal function, `this` is `undefined` in strict mode. Non-strict mode substitutes the global object.
- `obj.method()` sets `this` to `obj`. Taking the function off the object loses that `this`.
- `call` and `apply` set `this` and run the function. `bind` sets `this` and returns a function.
- An arrow function keeps the `this` of the place it is written. A DOM handler’s `this` is the element.
