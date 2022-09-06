import { useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";

import { useOnScreen } from "../hooks/useOnScreen";
import { GithubLink } from "../components/GithubLink";
import { transformItem } from "../lib/utils";

import type { TItem } from "../components/images/Item";
import { Grid } from "../components/images/Grid";
import { Spinner } from "../components/Spinner";
import { ArrowOnSquare } from "../components/ArrowOnSquare";
import { useInfiniteScrollMachine } from "../hooks/useInfiniteScrollMachine";

type HomeProps = {
  items: TItem[];
};

const Home: NextPage<HomeProps> = ({ items }) => {
  const [page, setPage] = useState(items ? 2 : 1);

  const fetchMore = async () => {
    const res = await fetch(`/api/images?page=${page}&per_page=8`);
    const items = await res.json();

    setPage((page) => page + 1);

    return {
      items: items.photos.map(transformItem),
      isThereMore: true,
    };
  };

  const {
    items: itemsToShow,
    fetching,
    fetchMoreData,
  } = useInfiniteScrollMachine(fetchMore, items);

  const onScreenRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(onScreenRef, "0px");

  useEffect(() => {
    if (isIntersecting) {
      fetchMoreData();
    }
  }, [isIntersecting, fetchMoreData]);

  return (
    <div className="container mx-auto flex h-screen max-h-[-webkit-fill-available] flex-col space-y-8 bg-neutral-900 py-8 px-4 text-neutral-300">
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
      <div className="flex-1 overflow-scroll rounded-md">
        <Grid items={itemsToShow} />
        {/* To trigger the getMore using the useOnScreen hook */}
        <div
          ref={onScreenRef}
          className="relative bottom-0 flex h-24 w-full items-center justify-center opacity-100"
        >
          {fetching && <Spinner />}
        </div>
      </div>
      <p className="text-center text-sm">
        Images by{" "}
        <a
          href="https://pexels.com"
          className="cursor-pointer text-sky-400 underline underline-offset-2"
        >
          Pexels
          <ArrowOnSquare className={`ml-0.5 mb-0.5 inline-block h-3 w-3`} />
        </a>
      </p>
    </div>
  );
};

export async function getServerSideProps() {
  const apiUrl = process.env.API;
  const res = await fetch(`${apiUrl}/api/images?page=1&per_page=8`);
  const items = await res.json();

  return {
    props: {
      items: items.photos.map(transformItem),
    },
  };
}

export default Home;
