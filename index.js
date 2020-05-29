const exit =
  (process && typeof process.exit === "function" && process.exit) ||
  ((code) => code);

class Suite {
  static status = 0;
  static exit() {
    exit(Suite.status);
  }

  constructor(name) {
    this.name = name;
    this.pack = [];
    this.singles = [];
    this.pending = [];
    this.skipped = [];
  }

  test(name, fn) {
    if (fn == null) this.pending.push(name);
    else this.pack.push({ name, fn });
    return this;
  }

  only(name, fn) {
    this.singles.push({ name, fn });
    return this;
  }

  skip(name, _fn) {
    this.skipped.push(name);
    return this;
  }

  run() {
    let errors = 0;
    const tests = this.singles.length ? this.singles : this.pack;
    console.info("#", this.name);
    for (const test of tests) {
      try {
        test.fn();
        console.log("   ok:", test.name);
      } catch (e) {
        console.error("error:", test.name, "\n", e);
        errors++;
        Suite.status = 1;
      }
    }
    console.info(errors, "errors in", tests.length, "tests");
    if (this.skipped.length) console.info(this.skipped.length, "skipped");
    if (this.pending.length) console.info(this.pending.length, "pending");
    return errors === 0;
  }
}

////////////////////////////////////////////////////////////////////////////////

const tests = [
  { name: "", flag: "", kids: [] },
  { name: "", flag: "", fn: null },
  { name: "", flag: "", cb: null },
];

export const skip = {};
export const only = {};

function group(skip, name, kids) {
  return {};
}

function test(skip, name, fn) {
  return {};
}

function call(skip, name, cb) {
  return {};
}

////////////////////////////////////////////////////////////////////////////////

function isObject(item) {
  return typeof item === "object" && item != null;
}

export const pending = ["pending"];
export const start = ["start"];
export const ok = ["ok"];

export function run(callback, tests) {
  if (!Array.isArray(tests) || tests.length < 1) return callback();

  const parents = [];

  const upd = (status, item) => {
    callback({ item, parents, status, time: Date.now() });
    // FIXME(db17): Never gets called
    if (item === parents[parents.length - 1]) parents.pop();
  };

  const stack = [...tests];

  while (stack.length) {
    const item = stack.pop();
    if (!isObject(item)) upd(pending, item);
    else if ("kids" in item) {
      parents.push(item);
      if (item.kids.length) stack.push(...item.kids);
      else upd(pending, item);
    } else if ("fn" in item) {
      if (typeof item.fn === "function") {
        try {
          const res = item.fn();
          if (isObject(res) && "then" in res) {
            upd(start, item);
            res.then(() => upd(ok, item)).catch((error) => upd(error, item));
          } else upd(ok, item);
        } catch (error) {
          upd(error, item);
        }
      } else upd(pending, item);
    } else if ("cb" in item) {
      if (typeof item.cb === "function") {
        upd(start, item);
        const done = (error) => upd(error || ok, item);
        item.cb(done);
      } else upd(pending, item);
    } else upd(pending, item);
  }
  return callback();
}
