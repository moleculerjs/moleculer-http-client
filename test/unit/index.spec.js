"use strict";

const { ServiceBroker } = require("moleculer");
const MoleculerGOT = require("../../src");

describe("Test MoleculerGOT base", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  const service = broker.createService(MoleculerGOT);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("service should be created", () => {
    expect(service).toBeDefined();
  });

  it("setting field should be an Object", () => {
    expect(service.settings.got).toBeInstanceOf(Object);
    expect(service.settings.got.includeMethods).toEqual(null);
    expect(service.settings.got.includeClient).toEqual(true);
  });

  it("should have a GOT client", () => {
    expect(service.client).toBeDefined();
  });

  it("should NOT have any methods", () => {
    expect(service._get).toBeUndefined();
    expect(service._post).toBeUndefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeUndefined();
  });
});

/*
describe.skip("Test includeMethods", () => {
  const broker = new ServiceBroker({
    logger: false
  });

  MoleculerGOT.settings.got.includeMethods = ["delete"];
  const service = broker.createService(MoleculerGOT);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  it("should only include DELETE method", () => {
    expect(service).toBeDefined();

    expect(service._get).toBeUndefined();
    expect(service._post).toBeUndefined();
    expect(service._put).toBeUndefined();
    expect(service._delete).toBeDefined();
  });
});
*/
