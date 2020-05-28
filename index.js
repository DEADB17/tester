const exit =
  (process && typeof process.exit === "function" && process.exit) ||
  ((code) => code);

export class Suite {
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
