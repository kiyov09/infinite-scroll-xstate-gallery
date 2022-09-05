import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import { useMachine } from "@xstate/react";

import { scrollMachine } from "../machines/infiniteScroll.machine";
import { useOnScreen } from "../hooks/useOnScreen";
import { GithubLink } from "../components/GithubLink";
import { transformItem } from "../lib/utils";

import type { TItem } from "../components/images/Item";
import { Grid } from "../components/images/Grid";
import { Spinner } from "../components/Spinner";

type HomeProps = {
  items: TItem[];
};

const Home: NextPage<HomeProps> = ({ items }) => {
  const [page, setPage] = useState(4);
  const [loading, setLoading] = useState(false);

  const machine = useMemo(() => scrollMachine(items), [items]);
  const [state, send] = useMachine(machine, {
    services: {
      fetchMore: async (_ctx) => {
        const res = await fetch(`/api/images?page=${page}&per_page=8`);
        const items = await res.json();

        return {
          items: items.photos.map(transformItem),
          // isThereMore: ctx.items.length < 32,
          isThereMore: true,
        };
      },
    },
  });
  const { items: itemsToShow } = state.context;

  const getMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      send({ type: "FETCH_MORE", data: { amount: 8 } });
      setPage((page) => page + 2);
    }, 500);
  }, [send]);

  const onScreenRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(onScreenRef, "0px");

  useEffect(() => {
    if (isIntersecting) {
      getMore();
    }
  }, [isIntersecting, getMore]);

  return (
    <div className="container mx-auto h-screen max-h-[-webkit-fill-available] space-y-12 bg-neutral-900 py-8 px-4 text-neutral-300">
      <GithubLink repoUrl="https://github.com/kiyov09/infinite-scroll-xstate-gallery" />
      <div className="space-y-4 p-4 tracking-wide">
        <h1 className="text-center text-3xl font-semibold md:text-5xl">
          XState Infinite Scroll Gallery
        </h1>
        <p className="text-center font-light">
          A demo site showing a photos gallery that have an infinite scroll
          feature prowered by a XState machine
        </p>
      </div>
      <Grid items={itemsToShow} />
      {/* To trigger the getMore using the useOnScreen hook */}
      <div
        ref={onScreenRef}
        className="relative bottom-8 flex h-24 w-full items-center justify-center opacity-100"
      >
        {loading && <Spinner />}
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const apiUrl = process.env.API;
  const res = await fetch(`${apiUrl}/api/images`);
  const items = await res.json();

  return {
    props: {
      items: items.photos.map(transformItem),
    },
  };
}

export default Home;
