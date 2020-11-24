import { MediaItem, MediaItemDoc } from "../models/media-item";

export async function queryMediaItems(
  query: Record<string, any>,
  limit: number
): Promise<MediaItemDoc[] | null> {
  return await MediaItem.find(query).sort({ popularity: "desc" }).limit(limit);
}
