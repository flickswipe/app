import { Types } from "mongoose";
import { Relationship } from "../modules/relationships/models/relationship";
import {
  blockRelationship,
  acceptRelationship,
  cancelRelationship,
  rejectRelationship,
  requestRelationship,
  unblockRelationship,
} from "../modules/relationships/relationships";
import { User } from "../modules/track-auth/models/user";

type relationshipFn = (toUser: string, fromUser: string) => Promise<void>;

describe("relationships", () => {
  describe("flows", () => {
    const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
    const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

    const actions: { [key: string]: relationshipFn } = {
      accept: acceptRelationship,
      block: blockRelationship,
      cancel: cancelRelationship,
      reject: rejectRelationship,
      request: requestRelationship,
      unblock: unblockRelationship,
    };

    beforeEach(async () => {
      await User.build({
        id: A,
        email: "a@user.com",
      }).save();
      await User.build({
        id: B,
        email: "b@user.com",
      }).save();
    });

    it.each`
      flow                                            | expectedTypeA | expectedTypeB
      ${`A request → B accept`}                       | ${`active`}   | ${`active`}
      ${`A block → A unblock → A request → B accept`} | ${`active`}   | ${`active`}
      ${`B block → B unblock → A request → B accept`} | ${`active`}   | ${`active`}
      ${`A block → B unblock → A request → B accept`} | ${`blocked`}  | ${`none`}
      ${`B block → A unblock → A request → B accept`} | ${`none`}     | ${`blocked`}
      ${`A request → B block → B unblock → B accept`} | ${`none`}     | ${`none`}
      ${`A request → A cancel → B accept`}            | ${`none`}     | ${`none`}
      ${`A request → A block → B accept`}             | ${`blocked`}  | ${`none`}
      ${`A request → B block → B accept`}             | ${`none`}     | ${`blocked`}
      ${`A block → A request → B accept`}             | ${`blocked`}  | ${`none`}
      ${`B block → A request → B accept`}             | ${`none`}     | ${`blocked`}
      ${`A request → B reject`}                       | ${`none`}     | ${`none`}
      ${`A request → B reject`}                       | ${`none`}     | ${`none`}
    `(
      "$flow should result in 'A:$expectedTypeA' and 'B:$expectedTypeB' relationships",
      async ({
        flow,
        expectedTypeA,
        expectedTypeB,
      }: {
        flow: string;
        expectedTypeA: string;
        expectedTypeB: string;
      }) => {
        // execute flow
        const executeFlow = flow
          // parse string
          .split("→")
          .map((line) => line.trim().split(" "))
          .map(([fromUserKey, action]) => {
            const fromUserId = fromUserKey === "A" ? A : B;
            const toUserId = fromUserKey === "A" ? B : A;
            const fn = actions[action];

            return { fn, fromUserId, toUserId };
          })
          .filter(({ fn, fromUserId, toUserId }) => {
            return typeof fn === "function" && fromUserId && toUserId;
          })
          .map(({ fn, fromUserId, toUserId }) => {
            return () => {
              console.log("call", fn, fromUserId, toUserId);
              return fn(fromUserId, toUserId);
            };
          })
          // create promise chain
          .reduce(
            (
              acc: () => Promise<void>,
              curr: () => Promise<void>
            ): (() => Promise<void>) => {
              console.log("chaining", acc, "then", curr);
              return () => acc().then(curr);
            }
          );

        try {
          await executeFlow();
        } catch (err) {
          // do nothing
        }

        // get A relationship
        const { relationshipType: actualTypeA } = (await Relationship.findOne({
          sourceUser: A,
          targetUser: B,
        })) || { relationshipType: "none" };

        const { relationshipType: actualTypeB } = (await Relationship.findOne({
          sourceUser: B,
          targetUser: A,
        })) || { relationshipType: "none" };

        expect(actualTypeA).toBe(expectedTypeA);
        expect(actualTypeB).toBe(expectedTypeB);
      }
    );
  });
});
