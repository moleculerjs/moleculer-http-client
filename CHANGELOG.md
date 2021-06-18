<a name="0.4.2"></a>
# [0.4.2](https://github.com/moleculerjs/moleculer/compare/v0.4.1...v0.4.2) (2021-06-17)

- Added TypeScript declaration file (`index.d.ts`) to support use of `import` statements instead of `require` in moleculerjs TS projects to resolve the `typescript-eslint/no-var-requires` error that is thrown during the linting.

<a name="0.4.1"></a>
# [0.4.1](https://github.com/moleculerjs/moleculer/compare/v0.4.0...v0.4.1) (2021-03-01)

- Fixed "Converting circular structure to JSON" error. More info [here](https://github.com/moleculerjs/moleculer-http-client/issues/5).

<a name="0.4.0"></a>
# [0.4.0](https://github.com/moleculerjs/moleculer/compare/v0.3.0...v0.4.0) (2020-08-20)

- Got HTTP client was updated to `v11`. Check Got's [release notes](https://github.com/sindresorhus/got/releases/tag/v11.0.0) for more info about the changes in `v11`.

<a name="0.3.0"></a>
# [0.3.0](https://github.com/moleculerjs/moleculer/compare/v0.2.1...v0.3.0) (2020-01-16)

# Breaking changes
- `includeMethods` option have been dropped. Now, by default, all actions are created. If you still want to disable some action you can create a [mixin that will remove unwanted methods](examples/select-http-methods/method-selector.mixin.js) or just set the undesired action to `false` in your service. For example:
```js
// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService],

  settings: {
    // Only GET the body of the response
    httpClient: { responseFormatter: "body" }
  },

  // Disable HTTP GET action
  actions: {
    get: false
  }
});
```

<a name="0.2.0"></a>
# [0.2.0](https://github.com/moleculerjs/moleculer/compare/v0.1.10...v0.2.0) (2020-01-02)

# Breaking changes
- Due to Node.js v8 End-Of-Life we no longer support it

- Got HTTP client was updated to `v10`. Check Got's [release notes](https://github.com/sindresorhus/got/releases/tag/v10.0.0) for more info about the changes in `v10`.

- The overall API is the same. The only change is the `opt` param that is passed along with the `url`.
    
## Some of `opt` Param Changes
> For the complete list of changes check the [Got's docs](https://github.com/sindresorhus/got)
### GET JSON Data
#### Previously
```js
broker.call("http.get", {
  url: "https://httpbin.org/json",
  opt: { json: true }
}
```
#### Now
```js
broker.call("http.get", {
  url: "https://httpbin.org/json",
  opt: { responseType: "json" } // can also be `text` or `buffer`
})
```
### POST JSON Data
#### Previously
```js
broker.call("http.get", {
  url: "https://httpbin.org/json",
  opt: { body: { foo: "bar" }, json: true }
}
```
#### Now
```js
broker.call("http.post", {
  url: "https://httpbin.org/post",
  opt: { json: { foo: "bar" }, responseType: "json" }
})
```

### GET Stream
#### Previously
```js
broker.call("http.get", {
  url: "https://sindresorhus.com/",
  opt: { stream: true }
})
```
### Now
```js
broker.call("http.get", {
  url: "https://sindresorhus.com/",
  opt: { isStream: true }
})
```
