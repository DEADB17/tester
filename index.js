const fnKind = "sync";
const cbKind = "callback";

const restFlag = "rest";
const onlyFlag = "only";
const skipFlag = "skip";

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} [fn]
 * @arg {Tester.Flags} flag
 * @return {Tester.PreTest}
 */
function createTest(info, fn, flag) {
  if (typeof fn === "function") {
    if (fn.length < 1)
      return { info, kind: fnKind, flag, fn: /** @type {Tester.FnVal} */ (fn) };
    else return { info, kind: cbKind, flag, fn };
  } else {
    return { info, kind: "pending", flag: restFlag };
  }
}

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} [val]
 */
export const test = (info, val) => createTest(info, val, restFlag);
/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} val
 */
test.skip = (info, val) => createTest(info, val, skipFlag);
/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} val
 */
test.only = (info, val) => createTest(info, val, onlyFlag);

const started = "started";
const passed = "passed";

/**
 * @arg {number} id
 * @arg {Tester.Status} status
 * @arg {Tester.RunnableTest} test
 * @return {Tester.PostTest}
 */
const post = (id, status, test) => ({ ...test, id, status, time: new Date() });

/**
 * @arg {Tester.Send} send
 * @arg {Array<Tester.PreTest>} tests
 */
export function run(send, ...tests) {
  /** @type {Tester.Collection} */
  const collection = {
    pending: [],
    only: [],
    rest: [],
    skip: [],
    run: [],
  };
  const cn = collection;

  for (const test of tests) {
    if (test.kind === fnKind || test.kind === cbKind) {
      if (test.flag === skipFlag) cn.skip.push(test);
      else if (test.flag === onlyFlag) cn.only.push(test);
      else cn.rest.push(test);
    } else cn.pending.push(test);
  }

  const run = (cn.run = cn.only.length ? cn.only : cn.rest);

  /** @arg {Tester.PostTest} test */
  const upd = (test) => send({ test, collection, count: test.id + 1 });

  for (const [id, test] of run.entries()) {
    if (test.kind === fnKind) {
      upd(post(id, started, test));
      try {
        const res = test.fn();
        if (res instanceof Promise) {
          test.kind = "promise";
          res
            .then(() => upd(post(id, passed, test)))
            .catch((/** @type {Error} */ error) => upd(post(id, error, test)));
        } else {
          upd(post(id, passed, test));
        }
      } catch (error) {
        upd(post(id, error, test));
      }
    } else if (test.kind === cbKind) {
      upd(post(id, started, test));
      /** @arg {Error | void} error */
      const done = (error) => {
        if (error && !(error instanceof Error)) error = new Error(error);
        upd(post(id, error || passed, test));
      };
      test.fn(done);
    }
  }
}

/**
 * @arg {Array<any>} _args
 */
run.skip = (..._args) => {};
