import type { Photo } from "pexels";
import type { ImageShape, TItem } from "../components/images/Item";

// get random between 3 possible sizes
// Probablity:
// 1/10 - portrait
// 2/10 - landscape
// 7/10 - square
const getRandomShape = (): ImageShape => {
  const random = Math.floor(Math.random() * 100);
  if (random < 10) {
    return "portrait";
  } else if (random < 30) {
    return "landscape";
  } else {
    return "square";
  }
};

export const transformItem = (item: Photo): TItem => {
  const shape = getRandomShape();
  const toGetUrl = shape == "square" ? "medium" : shape;
  return {
    url: item.src[toGetUrl],
    shape,
    id: item.id,
  };
};
