"use strict";

const { ServiceBroker } = require("moleculer");
const MoleculerGOT = require("../../src");
const fs = require("fs");
const fsPromise = require("fs").promises;
const _ = require("lodash");

const HTTPMockServer = require("../utils/http-server-mock/http-server");

describe("Test MoleculerGOT base service", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  // Pass the cloned object to avoid interfering with other tests
  const service = broker.createService(_.cloneDeep(MoleculerGOT));

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("service should be created", () => {
    expect(service).toBeDefined();
    expect(service.name).toBe("http-client");
  });

  it("settings field should be an Object", () => {
    expect(service.settings.got).toBeInstanceOf(Object);
    expect(service.settings.got.includeMethods).toEqual(null);
    expect(service.settings.got.defaultOptions).toBeInstanceOf(Object);
  });

  it("should have a Got client", () => {
    expect(service._client).toBeDefined();
  });

  it("should NOT have any actions (default config)", () => {
    expect(service.actions.get).toBeUndefined();
    expect(service.actions.post).toBeUndefined();
    expect(service.actions.put).toBeUndefined();
    expect(service.actions.delete).toBeUndefined();
  });

  it("should have the methods (default config)", () => {
    expect(service._get).toBeDefined();
    expect(service._post).toBeDefined();
    expect(service._put).toBeDefined();
    expect(service._delete).toBeDefined();
    expect(service._streamRequest).toBeDefined();
    expect(service._genericRequest).toBeDefined();
    expect(service._httpErrorHandler).toBeDefined();
  });
});

describe("Test mixin Moleculer Got", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  let service = broker.createService({
    name: "gotMixed",
    mixins: [MoleculerGOT],

    settings: {
      got: { logging: false }
    }
  });

  it("should NOT include log related data", async () => {
    expect(service).toBeDefined();
    expect(service.name).toBe("gotMixed");

    const { defaultOptions } = service.settings.got;

    expect(defaultOptions.logger).toBeUndefined();
    expect(defaultOptions.logIncomingResponse).toBeUndefined();
    expect(defaultOptions.logOutgoingRequest).toBeUndefined();
  });

  it("should NOT include any HTTP method", () => {
    expect(service).toBeDefined();
    expect(service.actions.get).toBeUndefined();
    expect(service.actions.post).toBeUndefined();
    expect(service.actions.put).toBeUndefined();
    expect(service.actions.delete).toBeUndefined();
  });

  it("should only include GET & POST actions", () => {
    const service = broker.createService({
      name: "gotMixed",
      mixins: [MoleculerGOT],

      settings: {
        got: { includeMethods: ["get", "post"] }
      }
    });

    expect(service).toBeDefined();

    expect(service.actions.get).toBeDefined();
    expect(service.actions.post).toBeDefined();
    expect(service.actions.put).toBeUndefined();
    expect(service.actions.delete).toBeUndefined();
  });

  it("should only include ALL actions", () => {
    const service = broker.createService({
      name: "gotMixed",
      mixins: [MoleculerGOT],

      settings: {
        got: { includeMethods: ["get", "post", "put", "delete"] }
      }
    });

    expect(service).toBeDefined();

    expect(service.actions.get).toBeDefined();
    expect(service.actions.post).toBeDefined();
    expect(service.actions.put).toBeDefined();
    expect(service.actions.delete).toBeDefined();
  });
});

describe("Test HTTP methods", () => {
  const broker = new ServiceBroker({
    // logger: false
  });

  const HTTPMock = broker.createService(HTTPMockServer);

  const service = broker.createService({
    name: "got",

    mixins: [MoleculerGOT],

    settings: {
      got: { includeMethods: ["get", "post", "put", "delete"] }
    }
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should GET JSON object", async () => {
    expect.assertions(1);

    let res = await broker.call("got.get", {
      url: "http://localhost:4000/json",
      opt: { json: true }
    });

    let expected = { hello: 200 };

    expect(res.body).toEqual(expected);
  });

  it("should PUT JSON object", async () => {
    expect.assertions(2);

    let res = await broker.call("got.put", {
      url: "http://localhost:4000/json",
      opt: { json: true }
    });

    let expected = { updated: "something" };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should DELETE object", async () => {
    expect.assertions(2);

    let res = await broker.call("got.delete", {
      url: "http://localhost:4000/json/123",
      opt: { json: true }
    });

    let expected = { deleted: "something", id: 123 };

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  it("should GET 404 ERROR", async () => {
    expect.assertions(1);

    try {
      await broker.call("got.get", {
        url: "http://localhost:4000/status/404",
        opt: { json: true }
      });
    } catch (error) {
      expect(error.statusCode).toEqual(404);
    }
  });

  it("should GET as stream a Readme file", async done => {
    let res = await broker.call("got.get", {
      url: "http://localhost:4000/stream",
      opt: { stream: true }
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
      let expected = await fsPromise.readFile(expectedPath, {
        encoding: "utf8"
      });

      let actual = await fsPromise.readFile(actualPath, { encoding: "utf8" });
      await fsPromise.unlink(actualPath);

      expect(actual).toEqual(expected);

      // Exit test
      done();
    });
  });

  it("should POST a file as a stream", async () => {
    const streamFile = "./test/utils/stream-data/toStream.md";
    const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

    let res = await broker.call("got.post", stream, {
      meta: {
        url: "http://localhost:4000/stream",
        stream: true
      }
    });

    // Check HTTP headers
    expect(res.statusCode).toBe(200);
    expect(res.statusMessage).toBe("OK");

    // Compare the actual files
    const actualPath = "./test/utils/stream-data/file.md";
    let actual = await fsPromise.readFile(actualPath, { encoding: "utf8" });

    let expected = await fsPromise.readFile(streamFile, {
      encoding: "utf8"
    });

    expect(actual).toEqual(expected);
    await fsPromise.unlink(actualPath);
  });
});

describe("Test Moleculer Got Logging", () => {
  const broker = new ServiceBroker({});

  const HTTPMock = broker.createService(HTTPMockServer);

  let logIncomingResponse = jest.fn();
  let logOutgoingRequest = jest.fn();

  let service = broker.createService({
    name: "gotMixed",
    mixins: [MoleculerGOT],

    settings: {
      got: {
        includeMethods: ["get"],

        logIncomingResponse: logIncomingResponse,
        logOutgoingRequest: logOutgoingRequest
      }
    },

    actions: {
      async get(ctx) {
        try {
          return this._get(ctx.params.url, { json: true });
        } catch (error) {
          throw error;
        }
      }
    }
  });

  beforeEach(() => broker.start());
  afterEach(() => broker.stop());

  it("should include log related data", async () => {
    expect(service).toBeDefined();
    const { defaultOptions } = service.settings.got;

    expect(defaultOptions.logger).toBeDefined();
    expect(defaultOptions.logIncomingResponse).toBeDefined();
    expect(defaultOptions.logOutgoingRequest).toBeDefined();
  });

  it("should use log messages 2 times each", async () => {
    let response = await broker.call("gotMixed.get", {
      url: "http://localhost:4000/status/200"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ statusCodeReceived: 200 });

    const { defaultOptions } = service.settings.got;
    expect(defaultOptions.logOutgoingRequest).toHaveBeenCalledTimes(1);
    expect(defaultOptions.logIncomingResponse).toHaveBeenCalledTimes(1);

    await broker.call("gotMixed.get", {
      url: "http://localhost:4000/status/200"
    });

    expect(defaultOptions.logOutgoingRequest).toHaveBeenCalledTimes(2);
    expect(defaultOptions.logIncomingResponse).toHaveBeenCalledTimes(2);
  });
});
