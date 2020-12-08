import { Message } from 'node-nats-streaming';

import { BadRequestError } from '@flickswipe/common';

import { natsWrapper } from '../../../../../nats-wrapper';
// sample data
import { USER_A } from '../../../../../test/sample-data/users';
import { User } from '../../../models/user';
import { UserCreatedListener } from '../user-created';

const setup = async () => {
  return {
    listener: new UserCreatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("user created listener", () => {
  describe("doc exists", () => {
    it("should not overwrite doc", async () => {
      const existingDoc = await User.build({
        id: USER_A.id,
      }).save();

      const { listener, msg } = await setup();

      try {
        await listener.onMessage(
          {
            id: USER_A.id,
            email: USER_A.email,
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );
      } catch (err) {
        // ignore thrown error
        // (tested seperately)
      }

      // has not been overwritten
      expect(await User.findById(USER_A.id)).toEqual(
        expect.objectContaining({ updatedAt: existingDoc.updatedAt })
      );

      // no extra records
      expect(await User.countDocuments()).toBe(1);
    });

    it("should throw an error", async () => {
      await User.build({
        id: USER_A.id,
      }).save();

      const { listener, msg } = await setup();

      // throws error
      await expect(() =>
        listener.onMessage(
          {
            id: USER_A.id,
            email: USER_A.email,
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        )
      ).rejects.toThrowError(BadRequestError);
    });

    it("should acknowledge the message", async () => {
      await User.build({
        id: USER_A.id,
      }).save();

      const { listener, msg } = await setup();

      try {
        await listener.onMessage(
          {
            id: USER_A.id,
            email: USER_A.email,
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );
      } catch (err) {
        // ignore
      }

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("create new doc", () => {
    it("should create a new doc", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: USER_A.id,
          email: USER_A.email,
          createdAt: new Date(),
        },
        msg
      );

      // has been created
      expect(await User.findById(USER_A.id)).toEqual(
        expect.objectContaining({ id: USER_A.id })
      );
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: USER_A.id,
          email: USER_A.email,
          createdAt: new Date(),
        },
        msg
      );

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
