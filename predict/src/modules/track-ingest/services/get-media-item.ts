import { MediaItem, MediaItemDoc } from '../models/media-item';

export async function getMediaItem(id: string): Promise<MediaItemDoc | null> {
  return await MediaItem.findById({
    _id: id,
  }).populate("genres");
}
