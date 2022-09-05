import { useEffect, useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import Image, { ImageLoaderProps } from "next/image";
import { useMachine } from "@xstate/react";
import type { Photo } from "pexels";

import { scrollMachine } from "../machines/infiniteScroll.machine";
import { useOnScreen } from "../hooks/useOnScreen";
import { GithubLink } from "../components/GithubLink";

type ImageShape = "landscape" | "portrait" | "square";
type TItem = {
  id: number;
  url: string;
  shape: ImageShape;
};

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

type ForEachProps<T> = {
  items: Array<T>;
  children: (item: T) => React.ReactNode;
};

function ForEach<T>({ items, children }: ForEachProps<T>) {
  if (items.length === 0) return null;

  return <>{items.map((item) => children(item))}</>;
}

function Item<T extends TItem>({ url, shape }: T) {
  const aspectRatio = {
    landscape: "aspect-video",
    portrait: "aspect-[9/16]",
    square: "aspect-square",
  };
  const span = {
    landscape: "col-span-2 row-span-1",
    portrait: "col-span-1 row-span-2",
    square: "col-span-1 row-span-1",
  };
  return (
    <div
      className={`group relative ${aspectRatio[shape]} ${span[shape]} h-full w-full overflow-hidden rounded-md ring-1 ring-neutral-800 hover:cursor-pointer`}
    >
      <Image
        src={url}
        loader={Item.loader}
        className="h-full w-full scale-105 bg-neutral-800 object-cover duration-1000 group-hover:scale-100 "
        layout="fill"
      />
    </div>
  );
}

Item.loader = ({ src }: ImageLoaderProps) => {
  return src;
  // return `${src}?auto=compress&cs=tinysrgb&h=${width}&w=${width}&q=${
  //   quality || 100
  // }`;
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

  const getMore = () => {
    send({ type: "FETCH_MORE", data: { amount: 4 } });
    setPage(page + 1);
  };

  const { items: itemsToShow } = state.context;

  const onScreenRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useOnScreen(onScreenRef);

  useEffect(() => {
    if (isIntersecting) {
      getMore();
    }
  }, [isIntersecting]);

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
      <div className="grid grid-flow-row-dense grid-cols-2 gap-4 overflow-scroll md:grid-cols-3 lg:grid-cols-4 ">
        <ForEach items={itemsToShow}>
          {(item) => <Item key={item.id} {...item} />}
        </ForEach>
      </div>
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
