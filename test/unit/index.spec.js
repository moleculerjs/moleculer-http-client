"use strict";

const { ServiceBroker } = require("moleculer");
const MoleculerGOT = require("../../src");
const fs = require("fs");
const fsPromise = require("fs").promises;

describe("Test MoleculerGOT base service", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const service = broker.createService(MoleculerGOT);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("service should be created", () => {
    expect(service).toBeDefined();
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

describe("Test MoleculerGOT as a Mixin", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const service = broker.createService({
    name: "got",

    mixins: [MoleculerGOT],

    settings: {
      got: {
        includeMethods: ["get", "post"]
      }
    }
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should only include GET & POST method", () => {
    expect(service).toBeDefined();

    expect(service._get).toBeDefined();
    expect(service._post).toBeDefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeUndefined();
  });
});

describe("Test HTTP methods", () => {
  const broker = new ServiceBroker({
    // logger: false
  });

  const service = broker.createService({
    name: "got",

    mixins: [MoleculerGOT],

    settings: {
      got: {
        includeMethods: ["get", "post"]
      }
    },

    actions: {
      async get(ctx) {
        try {
          return this._get(ctx.params.url, { json: true });
        } catch (error) {
          throw error;
        }
      },

      getStream(ctx) {
        const streamRequest = this._get(ctx.params.url, { stream: true });
        return streamRequest;
      }
    }
  });

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should GET JSON object", async () => {
    let res = await broker.call("got.get", {
      url: "http://httpbin.org/json"
    });

    let expected = {
      slideshow: {
        author: "Yours Truly",
        date: "date of publication",
        slides: [
          {
            title: "Wake up to WonderWidgets!",
            type: "all"
          },
          {
            items: [
              "Why <em>WonderWidgets</em> are great",
              "Who <em>buys</em> WonderWidgets"
            ],
            title: "Overview",
            type: "all"
          }
        ],
        title: "Sample Slide Show"
      }
    };

    expect(res.body).toEqual(expected);
  });

  it("should GET 404 ERROR", async () => {
    try {
      let res = await broker.call("got.get", {
        url: "http://httpbin.org/status/404"
      });
    } catch (error) {
      expect(error.message).toEqual("Response code 404 (NOT FOUND)");
    }
  });

  it("should GET as stream an HTML page", async () => {
    let res = await broker.call("got.getStream", {
      url: "http://httpbin.org/html",
      stream: true
    });

    const destination = "./test/utils/stream-data/destination.html";
    res.pipe(fs.createWriteStream(destination, { encoding: "utf8" }));

    res.on("end", async () => {
      const source = "./test/utils/stream-data/source.html";
      let expected = await fsPromise.readFile(source, { encoding: "utf8" });

      let actual = await fsPromise.readFile(destination, { encoding: "utf8" });
      await fsPromise.unlink(destination);

      expect(actual).toEqual(expected);
    });
  });
});
