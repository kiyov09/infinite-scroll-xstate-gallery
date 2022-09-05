import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import { useMachine } from "@xstate/react";
import type { Photo } from "pexels";

import { scrollMachine } from "../machines/infiniteScroll.machine";
import { useOnScreen } from "../hooks/useOnScreen";
import { GithubLink } from "../components/GithubLink";

import type { ImageShape, TItem } from "../components/images/Item";
import { Grid } from "../components/images/Grid";

// get random between 3 possible sizes
const getRandomShape = (): ImageShape => {
  const shapes = ["landscape", "square", "portrait"];
  return shapes[Math.floor(Math.random() * shapes.length)] as ImageShape;
};

const getShape = (width: number, height: number) => {
  const ratio = width / height;
  if (ratio > 1) return "landscape";
  if (ratio < 1) return "portrait";
  return "square";
};

const transformItem = (item: Photo): TItem => {
  // const shape = getShape(item.width, item.height);
  const shape = getRandomShape();
  const toGetUrl = shape == "square" ? "medium" : shape;
  return {
    url: item.src[toGetUrl],
    shape,
    id: item.id,
  };
};

type HomeProps = {
  items: TItem[];
};

const Home: NextPage<HomeProps> = ({ items }) => {
  const [page, setPage] = useState(4);

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
    send({ type: "FETCH_MORE", data: { amount: 4 } });
    setPage((page) => page + 1);
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
        className="col-span-full h-20 w-full opacity-0"
      ></div>
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
