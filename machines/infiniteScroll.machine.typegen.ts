// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.infiniteScroll.fetching:invocation[0]": {
      type: "done.invoke.infiniteScroll.fetching:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchMore: "done.invoke.infiniteScroll.fetching:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {};
  eventsCausingServices: {
    fetchMore: "FETCH_MORE" | "xstate.init";
  };
  eventsCausingGuards: {
    hasMore: "done.invoke.infiniteScroll.fetching:invocation[0]";
  };
  eventsCausingDelays: {};
  matchesStates: "fetching" | "idle" | "noMoreItems";
  tags: never;
}
