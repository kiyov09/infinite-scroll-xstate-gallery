import type { NextApiRequest, NextApiResponse } from "next";
import type { ErrorResponse, Photo, PhotosWithTotalResults } from "pexels";

import pexelClient from "../../lib/pexels";

type Data = {
  photos?: Photo[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const photos = await pexelClient.photos.curated({
    per_page: Number(req.query.per_page) || 12,
    page: Number(req.query.page) || 1,
  });

  const { error } = photos as ErrorResponse;

  if (error) {
    res.status(500).json({ error });
    return;
  }

  res.status(200).json({ photos: (photos as PhotosWithTotalResults).photos });
}
