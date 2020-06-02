// /////////////////////////////////////////////////////////////////////////////
// Constructors
// /////////////////////////////////////////////////////////////////////////////

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} [fn]
 * @arg {Tester.Flags} flag
 * @return {Tester.PreTest}
 */
function createTest(info, fn, flag) {
  if (typeof fn === "function") {
    if (fn.length < 1)
      return { info, kind: "sync", flag, fn: /** @type {Tester.FnVal} */ (fn) };
    else return { info, kind: "callback", flag, fn };
  } else {
    return { info, kind: "pending", flag: "rest" };
  }
}

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} [val]
 */
export const test = (info, val) => createTest(info, val, "rest");

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} val
 */
test.skip = (info, val) => createTest(info, val, "skip");

/**
 * @arg {string} info
 * @arg {Tester.FnVal | Tester.CbVal} val
 */
test.only = (info, val) => createTest(info, val, "only");

/**
 * @arg {Tester.Flags} flag
 * @arg {Tester.Kids} kids
 * @return {Tester.Suite}
 */
function createSuite(flag, kids) {
  return { kind: "suite", flag, kids };
}

/**
 * @arg {Tester.Kids} kids
 * @return {Tester.Suite}
 */
export const suite = (...kids) => createSuite("rest", kids);

/**
 * @arg {Tester.Kids} kids
 * @return {Tester.Suite}
 */
suite.only = (...kids) => createSuite("only", kids);

/**
 * @arg {Tester.Kids} kids
 * @return {Tester.Suite}
 */
suite.skip = (...kids) => createSuite("skip", kids);

// /////////////////////////////////////////////////////////////////////////////
// Collector
// /////////////////////////////////////////////////////////////////////////////

/** @arg {Tester.Kid} item */
function flat(item) {
  if (item.kind === "suite") return filter(item.kids);
  if (item.kind === "sync" || item.kind === "callback") return [item];
  else return [];
}

/**
 * @arg {Tester.Kids} items
 * @return {Tester.Kids}
 */
function filter(items) {
  const rest = [],
    only = [];
  for (const item of items) {
    if (item.flag === "only") only.push(...flat(item));
    else if (item.flag === "rest") rest.push(...flat(item));
  }
  return only.length ? only : rest;
}

/**
 * @arg {Tester.Kids} items
 * @return {Tester.RunningTests}
 */
export function collect(...items) {
  return /** @type {Tester.RunningTests} */ (filter(items));
}

// /////////////////////////////////////////////////////////////////////////////
// Runner
// /////////////////////////////////////////////////////////////////////////////

/**
 * @arg {number} id
 * @arg {Tester.Status} status
 * @arg {Tester.RunnableTest} test
 * @return {Tester.PostTest}
 */
const post = (id, status, test) => ({ ...test, id, status, time: new Date() });

/**
 * @arg {Tester.Done} done
 * @arg {Tester.Update} update
 * @arg {Tester.RunningTests} tests
 */
export function run(done, update, tests) {
  let total = tests.length,
    count = 0,
    passed = 0,
    failed = 0;

  /** @arg {Tester.PostTest} test */
  const send = (test) => {
    const isPass = test.status === "passed";
    const isError = test.status instanceof Error;
    if (isPass || isError) ++count;
    if (isError) ++failed;
    else if (isPass) ++passed;
    update({ test, tests, count, total, passed, failed });
    if ((isPass || isError) && count === total) done(0 < failed ? 1 : 0);
  };

  for (const [id, test] of tests.entries()) {
    if (test.kind === "sync") {
      send(post(id, "started", test));
      try {
        const res = test.fn();
        if (res instanceof Promise) {
          test.kind = "promise";
          res
            .then(() => send(post(id, "passed", test)))
            .catch((/** @type {Error} */ error) => send(post(id, error, test)));
        } else {
          send(post(id, "passed", test));
        }
      } catch (error) {
        send(post(id, error, test));
      }
    } else if (test.kind === "callback") {
      send(post(id, "started", test));
      /** @arg {Error | void} error */
      const done = (error) => {
        if (error && !(error instanceof Error)) error = new Error(error);
        send(post(id, error || "passed", test));
      };
      test.fn(done);
    }
  }
}

// /////////////////////////////////////////////////////////////////////////////
// Reporters
// /////////////////////////////////////////////////////////////////////////////

/**
 * @arg {Tester.Msg} message
 */
export function terminal({ test, count, total, passed, failed }) {
  const { status, info } = test;
  const step = `(${count}/${total})`;
  if (status === "passed") {
    console.info("\x1b[32m" + status + "\x1b[0m", info, step);
  } else if (status instanceof Error) {
    console.log("\x1b[31m" + "failed" + "\x1b[0m", info, step);
    console.error(status);
  }
  if (count === total && (status === "passed" || status instanceof Error)) {
    console.log("Passed", passed, "Failed", failed);
  }
}
