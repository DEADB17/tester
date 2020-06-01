import { run, test, terminal } from "./index.js";
import { strict as assert } from "assert";

run(
  (code) => console.log("Exit", code),
  terminal,

  test("00 Sync pass", () => assert.ok(1)),

  test("01 callback pass", (done) => {
    assert.ok(1);
    setTimeout(done, 500);
  }),

  test("pending"),

  test("02 promise pass", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }),

  test("03 sync fail", () => assert.ok(0)),

  test.skip("04 skip", () => assert.ok(1))
);

run(
  (code) => console.log("Exit", code),
  terminal,

  test.skip("10 Sync skip", () => assert.ok(1)),

  test("11 Sync pass", () => assert.ok(1)),

  test.skip("12 Sync skip", () => assert.ok(1)),

  test("13 Sync pass", () => assert.ok(1))
);
