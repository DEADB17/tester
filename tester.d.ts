declare namespace Tester {
  type FnKind = "sync" | "promise";
  type CbKind = "callback";
  type TestKinds = FnKind | CbKind;

  type Flags = "rest" | "only" | "skip";

  type Kid = Suite | PreTest;
  type Kids = Array<Kid>;

  interface Suite {
    kind: "suite";
    flag: Flags;
    kids: Kids;
  }

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
    // pending: Array<PreTest>;
    // skip: Array<RunnableTest>;
    run: Array<RunnableTest>;
  }

  type Msg = {
    test: PostTest;
    collection: Collection;
    count: number;
    total: number;
    passed: number;
    failed: number;
  };

  type Update = (message: Msg) => void;
  type Done = (exitCode: number) => void;
}
