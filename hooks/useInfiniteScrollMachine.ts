import { useMemo, useCallback } from "react";
import { useMachine } from "@xstate/react";
import { scrollMachine } from "../machines/infiniteScroll.machine";

type FetchMoreReturnType<T> = {
  items: T[];
  isThereMore: boolean;
};
type FetchMoreFn<T> = () => Promise<FetchMoreReturnType<T>>;

export function useInfiniteScrollMachine<T>(
  fetchFn: FetchMoreFn<T>,
  items: T[] = []
) {
  const machine = useMemo(() => scrollMachine(items), [items]);
  const [state, send] = useMachine(machine, {
    services: {
      fetchMore: fetchFn,
    },
  });

  const fetchMoreData = useCallback(() => send("FETCH_MORE"), [send]);

  return {
    fetchMoreData,
    items: state.context.items,
    fetching: state.matches("fetching"),
  };
}
