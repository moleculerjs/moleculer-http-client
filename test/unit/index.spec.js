"use strict";

const { ServiceBroker } = require("moleculer");
const MoleculerGOT = require("../../src");
const fs = require("fs");
const fsPromise = require("fs").promises;

const HTTPMockServer = require("../utils/http-server-mock/http-server");

describe("Test MoleculerGOT base service", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const service = broker.createService(MoleculerGOT);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("service should be created", () => {
    expect(service).toBeDefined();
    expect(service.name).toBe("got");
  });

  it("settings field should be an Object", () => {
    expect(service.settings.got).toBeInstanceOf(Object);
    expect(service.settings.got.includeMethods).toEqual(null);
    expect(service.settings.got.defaultOptions).toBeInstanceOf(Object);
  });

  it("should have a Got client", () => {
    expect(service._client).toBeDefined();
  });

  it("should NOT have any methods (default config)", () => {
    expect(service._get).toBeUndefined();
    expect(service._post).toBeUndefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeUndefined();
  });
});

describe("Test mixin Moleculer Got", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  beforeEach(() => broker.start());
  afterEach(() => broker.stop());

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
    expect(service._get).toBeUndefined();
    expect(service._post).toBeUndefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeUndefined();
  });

  it("should only include GET & POST methods", () => {
    const service = broker.createService({
      name: "gotMixed",
      mixins: [MoleculerGOT],

      settings: {
        got: { includeMethods: ["get", "post"] }
      }
    });

    expect(service).toBeDefined();

    expect(service._get).toBeDefined();
    expect(service._post).toBeDefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeUndefined();
  });

  it("should only include ALL methods", () => {
    const service = broker.createService({
      name: "gotMixed",
      mixins: [MoleculerGOT],

      settings: {
        got: { includeMethods: ["get", "post", "put", "delete"] }
      }
    });

    expect(service).toBeDefined();

    expect(service._get).toBeDefined();
    expect(service._post).toBeDefined();
    expect(service._put).toBeDefined();
    expect(service._delete).toBeDefined();
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
    },

    actions: {
      async get(ctx) {
        try {
          return this._get(ctx.params.url, { json: true });
        } catch (error) {
          throw error;
        }
      },

      async put(ctx) {
        try {
          return this._put(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      },

      async delete(ctx) {
        try {
          return this._delete(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      },

      getStream(ctx) {
        const streamRequest = this._get(ctx.params.url, { stream: true });
        return streamRequest;
      },

      postStream(ctx) {
        try {
          return this._post(ctx.meta.url, { stream: true }, ctx.params);
        } catch (error) {
          throw error;
        }
      }
    }
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should GET JSON object", async () => {
    expect.assertions(1);

    let res = await broker.call("got.get", {
      url: "http://localhost:4000/json"
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
        url: "http://localhost:4000/statusCode/404"
      });
    } catch (error) {
      expect(error.statusCode).toEqual(404);
    }
  });

  it("should GET as stream a Readme file", async done => {
    let res = await broker.call("got.getStream", {
      url: "http://localhost:4000/stream",
      stream: true
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

    let res = await broker.call("got.postStream", stream, {
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
  const broker = new ServiceBroker({
    logger: false
  });

  beforeEach(() => broker.start());
  afterEach(() => broker.stop());

  let service = broker.createService({
    name: "gotMixed",
    mixins: [MoleculerGOT],

    settings: {
      got: {
        includeMethods: ["get"],
        logger: jest.fn(),
        logIncomingResponse: jest.fn(),
        logOutgoingRequest: jest.fn()
      }
    }
  });

  it("should include log related data", async () => {
    expect(service).toBeDefined();
    const { defaultOptions } = service.settings.got;

    expect(defaultOptions.logger).toBeDefined();
    expect(defaultOptions.logIncomingResponse).toBeDefined();
    expect(defaultOptions.logOutgoingRequest).toBeDefined();
  });
});
