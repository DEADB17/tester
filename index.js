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
  { name: "", flag: "", sync: null },
  { name: "", flag: "", async: null },
];

export const skip = {};
export const only = {};

function group(skip, name, kids) {
  return {};
}

function test(skip, name, fn) {
  return {};
}

function call(skip, name, fn) {
  return {};
}

////////////////////////////////////////////////////////////////////////////////

const ok = ["ok"];

export function run(tests) {
  const success = [];
  const failure = [];
  const pending = [];
  const result = { success, failure, pending };

  if (!Array.isArray(tests) || tests.length < 1) return result;

  const stack = [...tests];
  const waiting = [];
  const done = (status, item, id, begin) => {
    if (id) waiting[id] = null;
    (status === ok ? success : failure).push({
      item,
      status,
      begin,
      end: Date.now(),
    });
  };

  while (stack.length) {
    const item = stack.pop();
    if ("kids" in item) {
      if (item.kids.length) stack.push(...item.kids);
      else pending.push(item);
    } else if ("sync" in item) {
      if (typeof item.sync === "function") {
        if ("then" in item.sync) {
          waiting.push(item);
          const begin = Date.now();
          const id = waiting.length - 1;
          item.sync
            .then(() => done(ok, item, id, begin))
            .catch((error) => done(error, item, id, begin));
        } else {
          const begin = Date.now();
          try {
            item.sync();
            done(ok, item, null, begin);
          } catch (error) {
            done(error, item, null, begin);
          }
        }
      } else pending.push(item);
    } else if ("async" in item) {
      if (typeof item.async === "function") {
        waiting.push(item);
        const id = waiting.length - 1;
        const callback = (error) => done(error || ok, item, id, begin);
        item.async(callback);
      } else pending.push(item);
    } else pending.push(item);
  }
  return result;
}
