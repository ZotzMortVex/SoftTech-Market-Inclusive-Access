import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductLscVideoUrl,
  isWelcomeLscVideoUrl,
} from "./lscVideos";

test("welcome videos are recognized even with query strings or different casing", () => {
  assert.equal(isWelcomeLscVideoUrl("/assets/videos/welcome.mp4?version=2"), true);
  assert.equal(isWelcomeLscVideoUrl("/videos/WELCOME.MP4#intro"), true);
  assert.equal(isWelcomeLscVideoUrl("/assets/videos/raton.mp4"), false);
});

test("product video mapping does not use the welcome video", () => {
  assert.equal(getProductLscVideoUrl("CUD015"), "/videos/baliza.mp4");
  assert.notEqual(getProductLscVideoUrl("CUD008"), "/assets/videos/welcome.mp4");
});
