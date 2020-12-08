import { Message } from 'node-nats-streaming';

import { Listener, MediaItemDestroyedEvent, Subjects } from '@flickswipe/common';

import { MediaItem } from '../../models/media-item';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemDestroyed` events
 */
export class MediaItemDestroyedListener extends Listener<MediaItemDestroyedEvent> {
  // set listener subject
  subject: Subjects.MediaItemDestroyed = Subjects.MediaItemDestroyed;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemDestroyedEvent["data"],
    msg: Message
  ): Promise<void> {
    await deleteMediaItem(data);
    msg.ack();
  }
}

/**
 * Delete doc from MediaItem collection
 * @param data message data
 */
async function deleteMediaItem(
  data: MediaItemDestroyedEvent["data"]
): Promise<void> {
  const { id } = data;

  // @todo don't overwrite more recent data

  await MediaItem.deleteMany({
    _id: id,
  });
  console.log(`Removed media item ${id}`);
}
