/*
import { collect, test } from "./index.js";
import { strict as assert } from "assert";

{
  const exp = { tests: [], skipped: [], pending: [] };
  assert.deepEqual(cfy(), exp);
  assert.deepEqual(cfy(null), exp);
  assert.deepEqual(cfy(123), exp);
  assert.deepEqual(cfy("hello"), exp);
  assert.deepEqual(cfy([]), exp);
  assert.deepEqual(cfy({}), exp);
}

{
  const exp = { tests: [], skipped: [], pending: [{ info: "x" }] };
  assert.deepEqual(cfy({ info: "x" }), exp);
}
*/

/*
const suite = test,
  describe = test,
  it = test;

const fn = () => {};
const promise = async () => {};
const cb = (_done) => {};

const actual = suite("Root", [
  describe("sync and promise", [it("syncs", fn), test("promise", promise)]),
  describe("callback and pending", [it("calls back", cb), it("is pending")]),
  describe("has skip and only", [
    it.skip("skips", fn),
    it.only("is only", fn),
    it("is regular", fn),
  ]),
  describe.skip("skip group", [
    it.skip("skips", fn),
    it.only("is only", fn),
    it("is regular", fn),
  ]),
  describe.only("only group", [
    it.skip("skips", fn),
    it.only("is only", fn),
    it("is regular", fn),
  ]),
]);

console.log(actual);
console.log(collect(actual));
*/

const tree = [
  { info: "2", kids: [{ info: "21" }, { info: "22" }] },
  { info: "3" },
  {
    info: "1",
    kids: [
      { info: "11", kids: [{ info: "111" }, { info: "112" }] },
      { info: "12", kids: [{ info: "121" }, { info: "122" }] },
    ],
  },
];
const items = [];
const stack = [];
for (const item of tree) {
  stack.push(item);
  item.folk = null;
}
while (stack.length) {
  const item = stack.pop();
  items.push(item);
  item.id = items.length - 1;
  if ("kids" in item) {
    if (item.kids.length) {
      for (const kid of item.kids) {
        stack.push(kid);
        kid.folk = item;
      }
    }
  }
}

for (let item of items) {
  const path = [item.info];
  while (item.folk != null) {
    item = item.folk;
    path.push(item.info);
  }
  console.log(path.join(" > "));
}
