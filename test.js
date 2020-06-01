import { run, test } from "./index.js";
import { strict as assert } from "assert";

run(
  /** @arg {Tester.Msg} m */
  ({ test, collection, count }) => {
    const { status, info } = test;
    const total = collection.run.length;
    const step = `(${count}/${total})`;
    if (status === "passed") {
      console.info("\x1b[32m", status, "\x1b[0m", step, info);
    } else if (status instanceof Error) {
      console.log("\x1b[31m", " error ", step, info, "\x1b[0m");
      console.error(status);
    }
  },

  test("0 Sync pass", () => {
    assert.ok(1);
  }),

  test("1 callback pass", (done) => {
    assert.ok(1);
    setTimeout(done, 500);
  }),

  test("pending"),

  test("2 promise pass", async () => {
    await new Promise(function (resolve) {
      setTimeout(resolve, 500);
    });
  }),

  test("3 sync fail", () => {
    assert.ok(0);
  }),

  test.skip("4 skip", () => {
    assert.ok(1);
  })
);
