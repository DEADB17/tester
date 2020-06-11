/**
 * @arg {Tester.Kids} items
 * @return {Tester.RunningTests}
 */
export function collect(...items: any): any;
/**
 * @arg {Tester.Done} done
 * @arg {Tester.Update} update
 * @arg {Tester.RunningTests} tests
 */
export function run(done: any, update: any, tests: any): void;
/**
 * @arg {Tester.Msg} message
 */
export function terminal({ test, count, total, passed, failed }: any): void;
export function test(info: string, val?: any | any): any;
export namespace test {
  export function skip(info: string, val: any): any;
  export function only(info: string, val: any): any;
}
export function suite(...kids: any): any;
export namespace suite {
  export function only(...kids: any): any;
  export function skip(...kids: any): any;
}
