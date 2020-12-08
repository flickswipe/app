import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../../../nats-wrapper';
// sample data
import { MEDIA_ITEM_A } from '../../../../../test/sample-data/media-items';
import { MediaItem } from '../../../models/media-item';
import { MediaItemDestroyedListener } from '../media-item-destroyed';

const EVENT_DATA = {
  id: MEDIA_ITEM_A.id,
  updatedAt: new Date(new Date().getTime() + 86600),
};

const setup = async () => {
  return {
    listener: new MediaItemDestroyedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item destroyed listener", () => {
  describe("media item exists", () => {
    beforeEach(async () => {
      await MediaItem.build(MEDIA_ITEM_A).save();
    });

    it("should delete doc", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been deleted
      expect(await MediaItem.findById(MEDIA_ITEM_A.id)).toBeNull();
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
