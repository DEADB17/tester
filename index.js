const fnKind = "sync",
  cbKind = "callback";

const noneFlag = "none",
  onlyFlag = "only",
  skipFlag = "skip";

/**
 * @arg {string} info
 * @arg {Tester.Fn | Tester.Cb} [fn]
 * @arg {Tester.TestFlags} flag
 * @return {Tester.AnyTest}
 */
function createTest(info, fn, flag) {
  if (typeof fn === "function") {
    if (fn.length < 1) return { info, kind: fnKind, flag, fn };
    else return { info, kind: cbKind, flag, fn };
  } else {
    return { info, kind: "undefined", flag: "pending" };
  }
}

/**
 * @arg {string} info
 * @arg {Tester.Fn | Tester.Cb} [val]
 */
export const test = (info, val) => createTest(info, val, noneFlag);
/**
 * @arg {string} info
 * @arg {Tester.Fn | Tester.Cb} val
 */
test.skip = (info, val) => createTest(info, val, skipFlag);
/**
 * @arg {string} info
 * @arg {Tester.Fn | Tester.Cb} val
 */
test.only = (info, val) => createTest(info, val, onlyFlag);

const started = "started";
const passed = "passed";

/**
 * @arg {number} id
 * @arg {Tester.Status} status
 * @arg {Tester.Test} test
 */
const toOut = (id, status, test) =>
  /** @type {Tester.Out } */ ({ ...test, id, status, time: new Date() });

/**
 * @arg {Tester.Send} send
 * @arg {Array<Tester.AnyTest>} tests
 */
export function run(send, ...tests) {
  /** @type {Array<Tester.AnyTest>} */
  const none = [];
  /** @type {Array<Tester.AnyTest>} */
  const only = [];
  /** @type {Array<Tester.AnyTest>} */
  const skip = [];
  /** @type {Array<Tester.AnyTest>} */
  const pending = [];

  for (const test of tests) {
    if (test.flag === noneFlag) none.push(test);
    else if (test.flag === onlyFlag) only.push(test);
    else if (test.flag === skipFlag) skip.push(test);
    else pending.push(test);
  }

  const toRun = /** @type {Array<Tester.Test>} */ (only.length ? only : none);
  let left = toRun.length;

  /** @arg {Tester.Out} out */
  const upd = (out) => {
    if (out.status !== started) --left;
    send(out);
    if (left === 0) {
      /** @type {Tester.MsgOut} */
      const out = {
        id: -1,
        info: "End",
        kind: "message",
        status: "end",
        flag: "none",
        body: [],
        time: new Date(),
      };
      send(out);
    }
  };

  /** @type {Tester.MsgOut} */
  const out = {
    id: -1,
    info: "Begin",
    kind: "message",
    status: "begin",
    flag: "none",
    body: [],
    time: new Date(),
  };
  send(out);

  for (const [id, test] of toRun.entries()) {
    if (test.kind === fnKind) {
      upd(toOut(id, started, test));
      try {
        const res = test.fn();
        if (res instanceof Promise) {
          test.kind = "promise";
          res
            .then(() => upd(toOut(id, passed, test)))
            .catch((/** @type {Error} */ error) => upd(toOut(id, error, test)));
        } else {
          upd(toOut(id, passed, test));
        }
      } catch (error) {
        upd(toOut(id, error, test));
      }
    } else if (test.kind === cbKind) {
      upd(toOut(id, started, test));
      /** @arg {Error | void} error */
      const done = (error) => {
        if (error && !(error instanceof Error)) error = new Error(error);
        upd(toOut(id, error || passed, test));
      };
      test.fn(done);
    }
  }
}

/**
 * @arg {Array<any>} _args
 */
run.skip = (..._args) => {};
