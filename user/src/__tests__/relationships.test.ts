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

// sample data
import { USER_A, USER_B } from "../test/sample-data/users";

type relationshipFn = (toUser: string, fromUser: string) => Promise<void>;

describe("relationships", () => {
  describe("flows", () => {
    const actions: { [key: string]: relationshipFn } = {
      accept: acceptRelationship,
      block: blockRelationship,
      cancel: cancelRelationship,
      reject: rejectRelationship,
      request: requestRelationship,
      unblock: unblockRelationship,
    };

    beforeEach(async () => {
      await Promise.all([User.build(USER_A).save(), User.build(USER_B).save()]);
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
        const executeFlow = flow
          .split("→")
          .map((line) => line.trim().split(" "))
          .map(([fromUserKey, action]) => {
            const fromUserId = fromUserKey === "A" ? USER_A.id : USER_B.id;
            const toUserId = fromUserKey === "A" ? USER_B.id : USER_A.id;
            const fn = actions[action];

            return { fn, fromUserId, toUserId };
          })
          .filter(({ fn, fromUserId, toUserId }) => {
            return typeof fn === "function" && fromUserId && toUserId;
          })
          .map(({ fn, fromUserId, toUserId }) => {
            return () => {
              return fn(fromUserId, toUserId);
            };
          })
          .reduce(
            (
              acc: () => Promise<void>,
              curr: () => Promise<void>
            ): (() => Promise<void>) => {
              return () => acc().then(curr);
            }
          );

        try {
          await executeFlow();
        } catch (err) {
          // do nothing
        }

        const { relationshipType: actualTypeA } = (await Relationship.findOne({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        })) || { relationshipType: "none" };

        const { relationshipType: actualTypeB } = (await Relationship.findOne({
          sourceUser: USER_B.id,
          targetUser: USER_A.id,
        })) || { relationshipType: "none" };

        // has expected types
        expect(actualTypeA).toBe(expectedTypeA);
        expect(actualTypeB).toBe(expectedTypeB);
      }
    );
  });
});
