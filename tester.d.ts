declare namespace Tester {
  type FnKind = "sync" | "promise";
  type CbKind = "callback";
  type TestKinds = "undefined" | FnKind | CbKind;

  type RunFlags = "none" | "only" | "skip";
  type TestFlags = RunFlags | "pending";

  type AnyTest = {
    info: string;
    kind: TestKinds;
    flag: TestFlags;
    fn?: Fn | Cb;
  };

  type Fn = () => void | Promise<void>;

  type FnTest = AnyTest & {
    kind: FnKind;
    flag: RunFlags;
    fn: Fn;
  };

  type Cb = (done: (error: Error | void) => void) => void;

  type CbTest = AnyTest & {
    kind: CbKind;
    flag: RunFlags;
    fn: Cb;
  };

  type Test = FnTest | CbTest;

  type Status = Error | "started" | "passed";

  type AnyOut = Test & {
    id: number;
    status: Status;
    time: Date;
  };

  type FnOut = AnyOut & FnTest;

  type CbOut = AnyOut & CbTest;

  type MsgOut = {
    id: number;
    info: string;
    kind: "message";
    status: "begin" | "end";
    flag: "none";
    body: any;
    time: Date;
  };

  type Out = FnOut | CbOut | MsgOut;

  type Send = (test: Out) => void;
}
