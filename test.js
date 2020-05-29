import { run } from "./index.js";
import { strict as assert } from "assert";

{
  const expected = {
    failure: [],
    pending: [],
    success: [],
  };
  assert.deepEqual(run(), expected);
  assert.deepEqual(run(null), expected);
  assert.deepEqual(run(123), expected);
  assert.deepEqual(run("hello"), expected);
  assert.deepEqual(run({}), expected);
  assert.deepEqual(run([]), expected);
}
