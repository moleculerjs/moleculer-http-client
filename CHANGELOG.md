<a name="0.2.0"></a>
# [0.2.0](https://github.com/moleculerjs/moleculer/compare/v0.1.10...v0.2.0) (2020-xx-xx)

# Breaking changes
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
