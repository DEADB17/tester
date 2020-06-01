declare namespace Tester {
  type FnKind = "sync" | "promise";
  type CbKind = "callback";
  type TestKinds = FnKind | CbKind;

  type Flags = "rest" | "only" | "skip";

  interface BaseTest {
    info: string;
    kind: string;
    flag: Flags;
  }

  interface PendingTest extends BaseTest {
    kind: "pending";
  }

  type FnVal = () => void | Promise<void>;

  interface FnTest extends BaseTest {
    kind: FnKind;
    fn: FnVal;
  }

  type CbVal = (done: (error: Error | void) => void) => void;

  interface CbTest extends BaseTest {
    kind: CbKind;
    fn: CbVal;
  }

  type RunnableTest = FnTest | CbTest;
  type PreTest = RunnableTest | PendingTest;

  type Status = "started" | "passed" | Error;

  type PostTest = RunnableTest & {
    id: number;
    status: Status;
    time: Date;
  };

  interface Collection {
    skip: Array<RunnableTest>;
    only: Array<RunnableTest>;
    rest: Array<RunnableTest>;
    run: Array<RunnableTest>;
    pending: Array<PreTest>;
  }

  type Msg = {
    test: PostTest;
    collection: Collection;
    count: number;
  };

  type Send = (message: Msg) => void;
}
