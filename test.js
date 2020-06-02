import { test, suite, run } from "./terminal.js";
import { strict as assert } from "assert";

run(
  suite.only(
    test("00 Sync test passes", () => assert.ok(1)),

    test("01 callback test passes", (done) => {
      done();
    }),

    test("02 promise test passes", async () => {
      await Promise.resolve(assert.ok(1));
    }),

    test("03 sync test fails", () => assert.ok(0)),

    test("04a callback test fails", (done) => {
      assert.ok(0);
      done();
    }),

    test("04b callback test fails", (done) => {
      done("Error");
    }),

    test("04c callback test fails", (done) => {
      done(Error());
    }),

    test("05 promise test fails", async () => {
      await Promise.resolve(assert.ok(0));
    }),

    test("06 pending tests don't run"),

    test.skip("07 skipped tests don't run", () => assert.ok(1)),

    suite(
      suite.only(
        test("In suite.only(1) sync test passes", () => assert.ok(1))
      ),
      suite(test("Suite ignored")),
      suite.only(
        test("In suite.only(2) sync test passes", () => assert.ok(1))
      ),
      suite.skip(test("Suite skipped"))
    ),

    suite.skip()
  ),

  suite(test("10 Skipped because the suite doesn't run", () => assert.ok(1))),
).then(exitCode => {
  assert.equal(exitCode, 1);
  process.exit(0);
});
