# Namaste JavaScript — Season 2 Recap

Episodes 1–6. Full notes: `season-2.md`.

## Callbacks, callback hell, inversion of control

Source: [Ep. 1](https://www.youtube.com/watch?v=yEKtJGha3yM)

JavaScript is synchronous and single-threaded. It does not wait. A **callback** is a function you pass so that some other function can run it later. That is how asynchronous code is written.

```js
console.log("Namaste");
setTimeout(function () {
  console.log("JavaScript");
}, 5000);
console.log("Season 2");
// Namaste, Season 2, then JavaScript
```

Dependent steps nest. Create the order, then pay, then show the summary, then update the wallet:

```js
const cart = ["shoes", "pants", "kurta"];

api.createOrder(cart, function () {
  api.proceedToPayment(function () {
    api.showOrderSummary(function () {
      api.updateWallet();
    });
  });
});
```

That nesting is **callback hell** (the pyramid of doom). The code grows sideways and is hard to maintain.

**Inversion of control** is the deeper problem. Passing `proceedToPayment` into `createOrder` gives that API control of your code. It might never call the callback, or it might call it twice. Promises are the next episode’s answer.

## Promises

Source: [Ep. 2](https://www.youtube.com/watch?v=ap-6PPAuK1Y)

A **promise** is a placeholder for a future value: an object for the eventual completion or failure of an asynchronous operation. `createOrder(cart)` returns that object immediately. It starts `pending`, with no result. It later becomes `fulfilled` with the order id, or `rejected` with an error. A settled promise does not change.

`.then` **attaches** your function. The promise calls it once, when the data is ready. You no longer hand the function to `createOrder`.

```js
const user = fetch("https://api.github.com/users/akshaymarch7");
console.log(user); // Promise { <pending> }
user.then(function (data) {
  console.log(data);
});
```

Chaining replaces the pyramid. Return each promise, or the next `.then` does not wait for it.

```js
createOrder(cart)
  .then((orderId) => proceedToPayment(orderId))
  .then((paymentInfo) => showOrderSummary(paymentInfo))
  .then((balance) => updateWallet(balance));
```

## Creating a promise, chaining, and errors

Source: [Ep. 3](https://www.youtube.com/watch?v=U74BJcr8NeQ)

The producer builds the promise. `resolve` fulfills it. `reject` fails it. The consumer attaches `.then` and `.catch`.

```js
function createOrder(cart) {
  return new Promise(function (resolve, reject) {
    if (!cart.length) {
      reject(new Error("Cart is not valid"));
      return;
    }
    resolve("12345");
  });
}

createOrder(cart)
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

Return from each `.then`, or the next step receives `undefined`. A rejection skips later `.then` handlers and lands in the `.catch` above them. A `.catch` in the middle handles those earlier failures, and the chain continues after it.

## `async` / `await`

Source: [Ep. 4](https://www.youtube.com/watch?v=6nv3qy3oNkc)

`async` / `await` is syntactic sugar over promises. An `async` function always returns a promise. A plain return value is wrapped. `await` unwraps a promise and is valid only inside an `async` function.

The lines after `await` in that function run when the promise fulfills. The call stack is not blocked: the function is suspended and resumed later from the microtask queue.

```js
async function handlePromise() {
  const val = await p; // p fulfills after 3 seconds
  console.log("Hello There!");
  console.log(val);
}
```

A promise starts when it is created, not when it is awaited. If both timers are already running, the second `await` does not wait again once that promise has fulfilled. Call the next function after the first `await` when the second step must start later.

`fetch` and `response.json()` are both promises, so each gets an `await`. Failure is a `try` / `catch` around the `await`, or `.catch` on the promise the `async` function returns.

## Promise APIs

Source: [Ep. 5](https://www.youtube.com/watch?v=DlTVt1rZjIo)

Four methods run a list of promises together. **Settled** means it finished: **fulfilled** (a value) or **rejected** (a reason).

With `p1` at 3 seconds, `p2` at 1 second, and `p3` at 2 seconds:

| API | Result |
| --- | ------ |
| `Promise.all` | `["P1 Success", "P2 Success", "P3 Success"]` after 3 seconds. The first rejection fails the whole call immediately. The other promises keep running, and their results are dropped. |
| `Promise.allSettled` | After every one settles, an array of `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. It does not fail because one input rejected. |
| `Promise.race` | The first to settle. That can be a value or an error. |
| `Promise.any` | The first fulfillment. Rejections are skipped. If all reject, the error is an `AggregateError`, and `err.errors` is the list of reasons. |

## JavaScript before React

Source: [playlist index 7](https://www.youtube.com/watch?v=--VcGI9iPvw)

Before React: `let` / `const` / `var`, arrow functions and higher-order functions, destructuring plus rest and spread, `if` / ternary / `&&` / `\|\|` / `?.`, `map` / `filter` / `reduce` / `sort`, events (including bubbling and capturing) plus `setTimeout` and `setInterval`, callbacks and promises through `fetch`, `async` / `await`, and `try` / `catch`.

## `this`

Source: [Ep. 6](https://www.youtube.com/watch?v=9T4z98JcHR0)

`this` depends on **how the function is called**.

| Call | `this` |
| ---- | ------ |
| Top level | the global object (`window` in a browser, `global` in Node) |
| `fn()` | `undefined` in strict mode. Non-strict mode substitutes the global object |
| `window.fn()` or `obj.method()` | that object |
| `fn.call(obj)` / `fn.apply(obj, args)` | `obj`, and the function runs now |
| `fn.bind(obj)` | `obj`, on a new function that has not run yet |
| Arrow function | the `this` of the function it is written inside. It has none of its own |
| DOM handler such as `onclick="alert(this)"` | the element |
