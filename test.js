import { Suite } from "./index.js";
import { strict as assert } from "assert";

new Suite("Ha ha")
  .test("Passing", () => {
    assert.ok(true);
  })
  .test("Pending")
  .test("Not passing", () => {
    assert.ok(false);
  })
  .skip("Skipped", () => {
    assert.ok(false);
  })
  .run();

Suite.exit();
