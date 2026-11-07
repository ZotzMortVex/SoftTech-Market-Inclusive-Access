import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_PRODUCTS } from "../src/data/mockData";
import { parseProductInput } from "./productValidation";

test("accepts product data and derives stock availability from its quantity", () => {
  const { id: _id, ...input } = INITIAL_PRODUCTS[0];
  const product = parseProductInput({ ...input, inStock: false });

  assert.ok(product);
  assert.equal(product.code, input.code.toUpperCase());
  assert.equal(product.inStock, input.stockCount > 0);
});

test("rejects invalid categories, negative values, and malformed image angles", () => {
  const { id: _id, ...input } = INITIAL_PRODUCTS[0];

  assert.equal(parseProductInput({ ...input, category: "Other" }), null);
  assert.equal(parseProductInput({ ...input, price: -1 }), null);
  assert.equal(parseProductInput({ ...input, code: "ß".repeat(34) }), null);
  assert.equal(parseProductInput({ ...input, images: { primary: "", angles: [{}] } }), null);
});

test("preserves product LSC video paths and defaults legacy data to welcome video", () => {
  const { id: _id, ...input } = INITIAL_PRODUCTS[0];

  assert.equal(
    parseProductInput(input)?.lscVideoUrl,
    "/assets/videos/ultrabook_pro_16.mp4",
  );

  const keyboard = INITIAL_PRODUCTS.find((product) => product.code === "CUD010");
  assert.ok(keyboard);
  const { id: _keyboardId, ...keyboardInput } = keyboard;
  assert.equal(
    parseProductInput(keyboardInput)?.lscVideoUrl,
    "/assets/videos/teclado_mecanico.mp4",
  );

  const beacon = INITIAL_PRODUCTS.find((product) => product.code === "CUD015");
  assert.ok(beacon);
  const { id: _beaconId, ...beaconInput } = beacon;
  assert.equal(
    parseProductInput(beaconInput)?.lscVideoUrl,
    "/videos/baliza.mp4",
  );

  const tablet = INITIAL_PRODUCTS.find((product) => product.code === "CUD012");
  assert.ok(tablet);
  const { id: _tabletId, ...tabletInput } = tablet;
  assert.equal(
    parseProductInput(tabletInput)?.lscVideoUrl,
    "/assets/videos/tablet.mp4",
  );

  const monitor = INITIAL_PRODUCTS.find((product) => product.code === "CUD009");
  assert.ok(monitor);
  const { id: _monitorId, ...monitorInput } = monitor;
  assert.equal(
    parseProductInput(monitorInput)?.lscVideoUrl,
    "/assets/videos/monitor.mp4",
  );

  const hub = INITIAL_PRODUCTS.find((product) => product.code === "CUD013");
  assert.ok(hub);
  const { id: _hubId, ...hubInput } = hub;
  assert.equal(
    parseProductInput(hubInput)?.lscVideoUrl,
    "/assets/videos/hub.mp4",
  );

  const mouse = INITIAL_PRODUCTS.find((product) => product.code === "CUD014");
  assert.ok(mouse);
  const { id: _mouseId, ...mouseInput } = mouse;
  assert.equal(
    parseProductInput(mouseInput)?.lscVideoUrl,
    "/assets/videos/raton.mp4",
  );

  const headphones = INITIAL_PRODUCTS.find(
    (product) => product.code === "CUD011",
  );
  assert.ok(headphones);
  const { id: _headphonesId, ...headphonesInput } = headphones;
  assert.equal(
    parseProductInput(headphonesInput)?.lscVideoUrl,
    "/assets/videos/auriculares.mp4",
  );
  assert.equal(
    parseProductInput({ ...input, lsc_video_url: undefined, lscVideoUrl: undefined })
      ?.lscVideoUrl,
    "/assets/videos/ultrabook_pro_16.mp4",
  );
  assert.equal(
    parseProductInput({
      ...input,
      lscVideoUrl: "/assets/videos/welcome.mp4?version=2",
    })?.lscVideoUrl,
    "/assets/videos/ultrabook_pro_16.mp4",
  );
});

test("rejects unsafe LSC video URLs", () => {
  const { id: _id, ...input } = INITIAL_PRODUCTS[0];

  assert.equal(
    parseProductInput({ ...input, lscVideoUrl: "//example.com/video.mp4" }),
    null,
  );
  assert.equal(
    parseProductInput({ ...input, lscVideoUrl: "javascript:alert(1)" }),
    null,
  );
});
