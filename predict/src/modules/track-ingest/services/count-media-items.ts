import { MediaItem } from '../models/media-item';

export async function countMediaItems(): Promise<number | null> {
  return await MediaItem.countDocuments();
}
