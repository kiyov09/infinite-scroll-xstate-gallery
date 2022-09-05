import { createMachine, assign } from "xstate";

type InfiniteScrollContext<T> = {
  items: T[];
  perReq: number;
  isThereMore: boolean;
};

type InfiniteScrollEvent = {
  type: "FETCH_MORE";
  data: {
    amount: number;
  };
};

type InfiniteScrollState<T> =
  | {
      value: "idle";
      context: InfiniteScrollContext<T>;
    }
  | {
      value: "fetching";
      context: InfiniteScrollContext<T>;
    }
  | {
      value: "noMoreItems";
      context: InfiniteScrollContext<T>;
    };

export const scrollMachine = <T>(items: T[] = [], perReq: number = 1) =>
  createMachine<
    InfiniteScrollContext<T>,
    InfiniteScrollEvent,
    InfiniteScrollState<T>
  >(
    {
      id: "infiniteScroll",
      preserveActionOrder: true,
      predictableActionArguments: true,
      initial: items.length ? "idle" : "fetching",
      context: {
        items,
        perReq,
        isThereMore: true,
      },
      states: {
        fetching: {
          invoke: {
            src: "fetchMore",
            onDone: [
              {
                target: "idle",
                cond: "hasMore",
                actions: [
                  assign({
                    items: (ctx, event) => {
                      if (
                        !event.type.match(/done.invoke.infiniteScroll.fetching/)
                      ) {
                        return ctx.items;
                      }
                      return [...ctx.items, ...event.data.items];
                    },
                    isThereMore: (ctx, event) => {
                      if (
                        !event.type.match(/done.invoke.infiniteScroll.fetching/)
                      ) {
                        return ctx.isThereMore;
                      }
                      return event.data.isThereMore;
                    },
                  }),
                ],
              },
              { target: "noMoreItems" },
            ],
          },
        },
        idle: {
          on: {
            FETCH_MORE: {
              target: "fetching",
              actions: [
                assign({
                  perReq: (ctx, event) => {
                    if (event.type !== "FETCH_MORE") return ctx.perReq;
                    return event.data.amount;
                  },
                }),
              ],
            },
          },
        },
        noMoreItems: {
          type: "final",
        },
      },
    },
    {
      guards: {
        hasMore: (ctx) => ctx.isThereMore,
      },
      services: {
        fetchMore: (_ctx) => Promise.reject("Not implemented"),
      },
    }
  );
