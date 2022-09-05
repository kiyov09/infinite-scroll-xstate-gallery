import Image, { ImageLoaderProps } from "next/image";

export type ImageShape = "landscape" | "portrait" | "square";
export type TItem = {
  id: number;
  url: string;
  shape: ImageShape;
};

export function Item<T extends TItem>({ url, shape }: T) {
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
        alt="image"
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
