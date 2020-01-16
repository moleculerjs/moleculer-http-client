"use strict";

const { ServiceBroker } = require("moleculer");
const MoleculerHTTP = require("../../src");
const fs = require("fs");
// Node 8 don't like this
// const fsPromise = require("fs").promises;

const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

const _ = require("lodash");

const HTTPMockServer = require("../utils/http-server-mock/http-server");

describe("Test Moleculer HTTP Client base service", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  // Pass the cloned object to avoid interfering with other tests
  const service = broker.createService(_.cloneDeep(MoleculerHTTP));

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("service should be created", () => {
    expect(service).toBeDefined();
    expect(service.name).toBe("http");
  });

  it("settings field should be an Object", () => {
    expect(service.settings.httpClient).toBeInstanceOf(Object);
    expect(service.settings.httpClient.defaultOptions).toBeInstanceOf(Object);
  });

  it("should have a HTTP client", () => {
    expect(service._client).toBeDefined();
  });

  it("should have all actions defined (default config)", () => {
    expect(service.actions.get).toBeDefined();
    expect(service.actions.post).toBeDefined();
    expect(service.actions.put).toBeDefined();
    expect(service.actions.patch).toBeDefined();
    expect(service.actions.delete).toBeDefined();
  });

  it("should have all methods defined (default config)", () => {
    expect(service._get).toBeDefined();
    expect(service._post).toBeDefined();
    expect(service._put).toBeDefined();
    expect(service._patch).toBeDefined();
    expect(service._delete).toBeDefined();
    expect(service._streamRequest).toBeDefined();
    expect(service._genericRequest).toBeDefined();
    expect(service._httpErrorHandler).toBeDefined();
  });
});

describe("Test mixin Moleculer HTTP", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  let service = broker.createService({
    name: "gotMixed",
    mixins: [MoleculerHTTP],

    settings: {
      httpClient: { logging: false }
    }
  });

  it("should NOT include log related data", async () => {
    expect(service).toBeDefined();
    expect(service.name).toBe("gotMixed");

    const { defaultOptions } = service.settings.httpClient;

    expect(defaultOptions.logger).toBeUndefined();
    expect(defaultOptions.logIncomingResponse).toBeUndefined();
    expect(defaultOptions.logOutgoingRequest).toBeUndefined();
  });
});

describe("Test HTTP methods", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const HTTPMock = broker.createService(HTTPMockServer);

  const service = broker.createService({
    name: "http",

    mixins: [MoleculerHTTP],

    settings: {},

    actions: {
      async fancyRequest(ctx) {
        try {
          // Use raw got client
          return await this._client(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    }
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should GET with raw Got _client", async () => {
    expect.assertions(1);

    let res = await broker.call("http.fancyRequest", {
      url: "http://localhost:4000/json",
      opt: { method: "GET", responseType: "json" }
    });

    let expected = { hello: 200 };

    expect(res.body).toEqual(expected);
  });

  it("should GET JSON object", async () => {
    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    let expected = { hello: 200 };

    expect(res.body).toEqual(expected);
  });

  it("should GET JSON without Options field", async () => {
    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json"
    });

    let expected = { hello: 200 };

    expect(res.body).toEqual(JSON.stringify(expected));
  });

  it("should GET as stream a Readme file", async done => {
    let res = await broker.call("http.get", {
      url: "http://localhost:4000/stream",
      opt: { isStream: true }
    });

    const actualPath = "./test/utils/stream-data/destination.md";
    res.pipe(fs.createWriteStream(actualPath, { encoding: "utf8" }));

    res.on("response", async response => {
      // Check HTTP headers
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-disposition"]).toBe(
        `attachment; filename=$README.md`
      );

      // Compare the actual files
      const expectedPath = "./test/utils/stream-data/expected.md";
      let expected = await readFile(expectedPath, {
        encoding: "utf8"
      });

      let actual = await readFile(actualPath, { encoding: "utf8" });
      await unlink(actualPath);

      expect(actual).toEqual(expected);

      // Exit test
      done();
    });
  });

  it("should POST a JSON object", async () => {
    expect.assertions(2);

    let res = await broker.call("http.post", {
      url: "http://localhost:4000/json",
      opt: {
        json: { data: "POST From unit test" },
        responseType: "json"
      }
    });

    let expected = { id: 123, data: "POST From unit test" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should POST without Options field and no Body", async () => {
    expect.assertions(2);

    let res = await broker.call("http.post", {
      url: "http://localhost:4000/json"
    });

    let expected = { id: 123 };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expected));
  });

  it("should POST a file as a stream", async () => {
    const streamFile = "./test/utils/stream-data/toStream.md";
    const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

    let res = await broker.call("http.post", stream, {
      meta: {
        url: "http://localhost:4000/stream",
        isStream: true
      }
    });

    // Check HTTP headers
    expect(res.statusCode).toBe(200);
    expect(res.statusMessage).toBe("OK");

    // Compare the actual files
    const actualPath = "./test/utils/http-server-mock/POSTfile.md";
    let actual = await readFile(actualPath, { encoding: "utf8" });

    let expected = await readFile(streamFile, {
      encoding: "utf8"
    });

    expect(actual).toEqual(expected);
    await unlink(actualPath);
  });

  it("should PUT JSON object", async () => {
    expect.assertions(2);

    let res = await broker.call("http.put", {
      url: "http://localhost:4000/json",
      opt: {
        json: { data: "PUT From unit test" },
        responseType: "json"
      }
    });

    let expected = { updated: "something" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should PUT without Options field and no Body", async () => {
    expect.assertions(2);

    let res = await broker.call("http.put", {
      url: "http://localhost:4000/json"
    });

    let expected = { updated: "something" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expected));
  });

  it("should PUT a file as a stream", async () => {
    const streamFile = "./test/utils/stream-data/toStream.md";
    const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

    let res = await broker.call("http.put", stream, {
      meta: {
        url: "http://localhost:4000/stream",
        isStream: true
      }
    });

    // Check HTTP headers
    expect(res.statusCode).toBe(200);
    expect(res.statusMessage).toBe("OK");

    // Compare the actual files
    const actualPath = "./test/utils/http-server-mock/PUTfile.md";
    let actual = await readFile(actualPath, { encoding: "utf8" });

    let expected = await readFile(streamFile, {
      encoding: "utf8"
    });

    expect(actual).toEqual(expected);
    await unlink(actualPath);
  });

  it("should PATCH JSON object", async () => {
    expect.assertions(2);

    let res = await broker.call("http.patch", {
      url: "http://localhost:4000/json",
      opt: {
        json: { data: "PATCH From unit test" },
        responseType: "json"
      }
    });

    let expected = { patched: "something" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should PATCH without Options field and no Body", async () => {
    expect.assertions(2);

    let res = await broker.call("http.patch", {
      url: "http://localhost:4000/json"
    });

    let expected = { patched: "something" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expected));
  });

  it("should PATCH a file as a stream", async () => {
    const streamFile = "./test/utils/stream-data/toStream.md";
    const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

    let res = await broker.call("http.patch", stream, {
      meta: {
        url: "http://localhost:4000/stream",
        isStream: true
      }
    });

    // Check HTTP headers
    expect(res.statusCode).toBe(200);
    expect(res.statusMessage).toBe("OK");

    // Compare the actual files
    const actualPath = "./test/utils/http-server-mock/PATCHfile.md";
    let actual = await readFile(actualPath, { encoding: "utf8" });

    let expected = await readFile(streamFile, {
      encoding: "utf8"
    });

    expect(actual).toEqual(expected);
    await unlink(actualPath);
  });

  it("should DELETE object", async () => {
    expect.assertions(2);

    let res = await broker.call("http.delete", {
      url: "http://localhost:4000/json/123",
      opt: { responseType: "json" }
    });

    let expected = { deleted: "something", id: 123 };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should DELETE without Options field", async () => {
    expect.assertions(2);

    let res = await broker.call("http.delete", {
      url: "http://localhost:4000/json/123"
    });

    let expected = { deleted: "something", id: 123 };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(expected));
  });
});

describe("Test Error Handling", () => {
  describe("Method Error Handling", () => {
    describe("Default Error Handling", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP]
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Moleculer ERROR to HTTP GET", async () => {
        expect.assertions(3);

        try {
          await service._get("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("GET");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP POST", async () => {
        expect.assertions(3);

        try {
          await service._post("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("POST");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP PUT", async () => {
        expect.assertions(3);

        try {
          await service._put("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("PUT");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP PATCH", async () => {
        expect.assertions(3);

        try {
          await service._patch("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("PATCH");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP DELETE", async () => {
        expect.assertions(3);

        try {
          await service._delete("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("DELETE");
          expect(error.data.statusCode).toEqual(404);
        }
      });
    });

    describe("Throwing Got's Errors", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP],

        settings: {
          httpClient: {
            errorFormatter: null
          }
        }
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Got's 404 ERROR to HTTP GET", async () => {
        expect.assertions(1);

        try {
          await service._get("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP POST", async () => {
        expect.assertions(1);

        try {
          await service._post("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP PUT", async () => {
        expect.assertions(1);

        try {
          await service._put("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP PATCH", async () => {
        expect.assertions(1);

        try {
          await service._patch("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP DELETE", async () => {
        expect.assertions(1);

        try {
          await service._delete("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });
    });

    describe("Custom Error Handling", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP],

        settings: {
          httpClient: {
            errorFormatter: error => {
              return new Error("Custom Error");
            }
          }
        }
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Custom Error to HTTP GET", async () => {
        expect.assertions(1);

        try {
          await service._get("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP POST", async () => {
        expect.assertions(1);

        try {
          await service._post("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP PUT", async () => {
        expect.assertions(1);

        try {
          await service._put("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP PATCH", async () => {
        expect.assertions(1);

        try {
          await service._patch("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP DELETE", async () => {
        expect.assertions(1);

        try {
          await service._delete("http://localhost:4000/status/404", {
            responseType: "json"
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });
    });
  });

  describe("Action Error Handling", () => {
    describe("Default Error Handling", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP],

        settings: {}
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Moleculer ERROR to HTTP GET", async () => {
        expect.assertions(3);

        try {
          await broker.call("http.get", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("GET");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP POST", async () => {
        expect.assertions(3);

        try {
          await broker.call("http.post", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("POST");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP PUT", async () => {
        expect.assertions(3);

        try {
          await broker.call("http.put", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("PUT");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP PATCH", async () => {
        expect.assertions(3);

        try {
          await broker.call("http.patch", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("PATCH");
          expect(error.data.statusCode).toEqual(404);
        }
      });

      it("should respond with Moleculer ERROR to HTTP DELETE", async () => {
        expect.assertions(3);

        try {
          await broker.call("http.delete", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Moleculer HTTP Client Error.`);
          expect(error.data.method).toEqual("DELETE");
          expect(error.data.statusCode).toEqual(404);
        }
      });
    });

    describe("Throwing Got's Errors", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP],

        settings: {
          httpClient: {
            errorFormatter: null
          }
        }
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Got's 404 ERROR to HTTP GET", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.get", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP POST", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.post", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP PUT", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.put", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP PATCH", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.patch", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });

      it("should respond with Got's 404 ERROR to HTTP DELETE", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.delete", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.response.statusCode).toEqual(404);
        }
      });
    });

    describe("Custom Error Handling", () => {
      const broker = new ServiceBroker({
        logger: false
      });

      const HTTPMock = broker.createService(HTTPMockServer);

      const service = broker.createService({
        name: "http",

        mixins: [MoleculerHTTP],

        settings: {
          httpClient: {
            errorFormatter: error => {
              return new Error("Custom Error");
            }
          }
        }
      });

      beforeAll(() => broker.start());
      afterAll(() => broker.stop());

      it("should respond with Custom Error to HTTP GET", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.get", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP POST", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.post", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP PUT", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.put", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP PATCH", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.patch", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });

      it("should respond with Custom Error to HTTP DELETE", async () => {
        expect.assertions(1);

        try {
          await broker.call("http.delete", {
            url: "http://localhost:4000/status/404",
            opt: { responseType: "json" }
          });
        } catch (error) {
          expect(error.message).toEqual(`Custom Error`);
        }
      });
    });
  });
});

describe("Test Moleculer HTTP Client Logging", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const HTTPMock = broker.createService(HTTPMockServer);

  let logIncomingResponse = jest.fn();
  let logOutgoingRequest = jest.fn();

  let service = broker.createService({
    name: "gotMixed",
    mixins: [MoleculerHTTP],

    settings: {
      httpClient: {
        logIncomingResponse: logIncomingResponse,
        logOutgoingRequest: logOutgoingRequest
      }
    }
  });

  beforeEach(() => broker.start());
  afterEach(() => broker.stop());

  it("should include log related functions", async () => {
    expect(service).toBeDefined();
    const { defaultOptions } = service.settings.httpClient;

    expect(defaultOptions.logger).toBeDefined();
    expect(defaultOptions.logIncomingResponse).toBeDefined();
    expect(defaultOptions.logOutgoingRequest).toBeDefined();
  });

  it("should use log messages 2 times each", async () => {
    let response = await broker.call("gotMixed.get", {
      url: "http://localhost:4000/status/200",
      opt: { responseType: "json" }
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ statusCodeReceived: 200 });

    const { defaultOptions } = service.settings.httpClient;
    expect(defaultOptions.logOutgoingRequest).toHaveBeenCalledTimes(1);
    expect(defaultOptions.logIncomingResponse).toHaveBeenCalledTimes(1);

    await broker.call("gotMixed.get", {
      url: "http://localhost:4000/status/200"
    });

    expect(defaultOptions.logOutgoingRequest).toHaveBeenCalledTimes(2);
    expect(defaultOptions.logIncomingResponse).toHaveBeenCalledTimes(2);
  });
});

describe("Test Response Formatter", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const HTTPMock = broker.createService(HTTPMockServer);

  let serviceSchema = {
    name: "http",
    mixins: [MoleculerHTTP],

    settings: {
      httpClient: {}
    }
  };

  afterEach(async () => {
    let s = broker.getLocalService("http");
    await broker.destroyService(s);
    return broker.stop();
  });

  it("should return JSON body", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = "body";
    broker.createService(schema);
    await broker.start();

    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    let expected = { hello: 200 };

    expect(res).toEqual(expected);
  });

  it("should return String body", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = "body";
    broker.createService(schema);
    await broker.start();

    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json"
    });

    let expected = { hello: 200 };

    expect(res).toEqual(JSON.stringify(expected));
  });

  it("should return Headers", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = "headers";
    broker.createService(schema);
    await broker.start();

    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    let expected = {
      connection: "close",
      "content-length": "13",
      "content-type": "application/json; charset=utf-8"
    };

    // Delete
    delete res.date;
    delete res["x-request-id"];
    expect(res).toEqual(expected);
  });

  it("should return Status Code", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = "status";
    broker.createService(schema);
    await broker.start();

    expect.assertions(1);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    expect(res).toEqual(200);
  });

  it("should return full Got Response Object - null ", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = null;
    broker.createService(schema);
    await broker.start();

    expect.assertions(3);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    expect(res.httpVersionMajor).toEqual(1);
    expect(res.httpVersionMinor).toEqual(1);
    expect(res.httpVersion).toEqual("1.1");
  });

  it("should return full Got Response Object - raw", async () => {
    let schema = _.cloneDeep(serviceSchema);
    schema.settings.httpClient.responseFormatter = "raw";
    broker.createService(schema);
    await broker.start();

    expect.assertions(3);

    let res = await broker.call("http.get", {
      url: "http://localhost:4000/json",
      opt: { responseType: "json" }
    });

    expect(res.httpVersionMajor).toEqual(1);
    expect(res.httpVersionMinor).toEqual(1);
    expect(res.httpVersion).toEqual("1.1");
  });
});

describe("Test Cache", () => {
  describe("Test Moleculer cache", () => {
    const broker = new ServiceBroker({
      logger: false,
      cacher: "Memory"
    });

    const mockFn = jest.fn(ctx => {
      return Promise.resolve({ cache: 200 });
    });

    broker.createService({
      name: "api",

      mixins: [HTTPMockServer],

      actions: {
        // Mock the action
        getCache: mockFn
      }
    });

    broker.createService({
      name: "http",

      mixins: [MoleculerHTTP],

      settings: {},

      actions: {
        get: {
          cache: true
        }
      }
    });

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    it("should use Moleculer's cache", async () => {
      expect.assertions(2);

      let res1 = await broker.call("http.get", {
        url: "http://localhost:4000/cache",
        opt: { responseType: "json" }
      });

      let res2 = await broker.call("http.get", {
        url: "http://localhost:4000/cache",
        opt: { responseType: "json" }
      });

      let expected = { cache: 200 };

      expect(res1.body).toEqual(expected);
      expect(mockFn).toBeCalledTimes(1);
    });
  });

  describe("Test Got's internal cache", () => {
    const broker = new ServiceBroker({
      logger: false
    });

    const mockFn = jest.fn(ctx => {
      ctx.meta.$responseHeaders = {
        "Cache-Control": `public, max-age=120`
      };

      return Promise.resolve({ cache: 200 });
    });

    const mapCache = new Map();

    broker.createService({
      name: "api",

      mixins: [HTTPMockServer],

      actions: { getCache: mockFn }
    });

    broker.createService({
      name: "http",

      mixins: [MoleculerHTTP],

      settings: {
        httpClient: {
          defaultOptions: {
            cache: mapCache
          }
        }
      }
    });

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    it("should use Got's internal cache", async () => {
      expect.assertions(2);

      let res1 = await broker.call("http.get", {
        url: "http://localhost:4000/cache",
        opt: { responseType: "json" }
      });

      let res2 = await broker.call("http.get", {
        url: "http://localhost:4000/cache",
        opt: { responseType: "json" }
      });

      let expected = { cache: 200 };

      expect(res1.body).toEqual(expected);
      expect(mockFn).toBeCalledTimes(1);
    });
  });
});
