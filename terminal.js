import { collect, run, terminal } from "./tester.js";

/**
 * @arg {Tester.Kids} tests
 */
function runInTerm(...tests) {
  run(process.exit, terminal, collect(...tests));
}

export { test, suite } from "./tester.js";
export { runInTerm as run };
