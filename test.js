import { run, pending, start, ok } from "./index.js";
import { strict as assert } from "assert";

{
  const callback = () => {};
  assert.deepEqual(run(callback), undefined);
  assert.deepEqual(run(callback, null), undefined);
  assert.deepEqual(run(callback, 123), undefined);
  assert.deepEqual(run(callback, "hello"), undefined);
  assert.deepEqual(run(callback, {}), undefined);
  assert.deepEqual(run(callback, []), undefined);
}

{
  const fn = () => assert.ok(true);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    assert.equal(ob.status, ok);
    assert.ok(ob.time <= Date.now());
  };
  run(callback, [{ fn }]);
}

{
  const fn = () => assert.ok(false);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    assert.ok(ob.status instanceof Error);
    assert.ok(ob.time <= Date.now());
  };
  run(callback, [{ fn }]);
}

{
  const fn = () => new Promise((res, rej) => res);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    if (ob.status === start) assert.ok(true);
    else if (ob.status === ok) assert.ok(true);
    else assert.ok(false);
  };
  run(callback, [{ fn }]);
}

{
  const fn = () => new Promise((res, rej) => rej);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    if (ob.status === start) assert.ok(true);
    else if (ob.status instanceof Error) assert.ok(true);
    else assert.ok(false);
  };
  run(callback, [{ fn }]);
}

{
  const fn = async () => await assert.ok(true);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    if (ob.status === start) assert.ok(true);
    else if (ob.status === ok) assert.ok(true);
    else assert.ok(false);
  };
  run(callback, [{ fn }]);
}

{
  const cb = (done) => done(null, assert.ok(true));
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { cb });
    if (ob.status === start) assert.ok(true);
    else if (ob.status === ok) assert.ok(true);
    else assert.ok(false);
  };
  run(callback, [{ cb }]);
}

{
  const cb = (done) => done(new Error());
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { cb });
    if (ob.status === start) assert.ok(true);
    else if (ob.status instanceof Error) assert.ok(true);
    else assert.ok(false);
  };
  run(callback, [{ cb }]);
}

{
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { kids: [] });
    assert.equal(ob.status, pending);
  };
  run(callback, [{ kids: [] }]);
}

{
  const fn = () => assert.ok(true);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.item, { fn });
    assert.equal(ob.status, ok);
  };
  run(callback, [{ kids: [{ kids: [{ fn }] }] }]);
}

{
  const fn = () => assert.ok(true);
  let count = 0;
  const callback = (ob) => {
    if (ob == null) {
      assert.equal(count, 8);
      return;
    }
    ++count;
    assert.deepEqual(ob.item, { fn });
    assert.equal(ob.status, ok);
  };
  const tests = [
    { kids: [{ kids: [{ fn }, { fn }] }, { kids: [{ fn }, { fn }] }] },
    { kids: [{ kids: [{ fn }, { fn }] }, { kids: [{ fn }, { fn }] }] },
  ];
  run(callback, tests);
}

{
  const callback = (ob) => {
    if (ob == null) return;
    assert.equal(ob.item, 1);
    assert.equal(ob.status, pending);
  };
  run(callback, [1]);
}

////////////////////////////////////////////////////////////////////////////////
// Parents

{
  const fn = () => assert.ok(true);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.parents, []);
  };
  run(callback, [{ fn }]);
}

{
  const fn = () => assert.ok(true);
  const callback = (ob) => {
    if (ob == null) return;
    assert.deepEqual(ob.parents, [
      { kids: [{ kids: [{ fn }] }] },
      { kids: [{ fn }] },
    ]);
  };
  run(callback, [{ kids: [{ kids: [{ fn }] }] }]);
}
