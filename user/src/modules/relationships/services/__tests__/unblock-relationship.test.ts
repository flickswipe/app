import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { unblockRelationship } from "../unblock-relationship";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";

describe("unblock relationship", () => {
  describe("invalid conditions", () => {
    describe("ids are the same", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await unblockRelationship(USER_A.id, USER_A.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });

    describe("user is not blocked", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await unblockRelationship(USER_A.id, USER_B.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("user is blocked", () => {
      beforeEach(async () => {
        await Promise.all([
          Relationship.build({
            relationshipType: RelationshipType.Blocked,
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          }).save(),

          Relationship.build({
            relationshipType: RelationshipType.Blocked,
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          }).save(),
        ]);
      });

      it("should delete relationship", async () => {
        await unblockRelationship(USER_A.id, USER_B.id);

        // has been deleted
        expect(
          await Relationship.findOne({
            relationshipType: RelationshipType.Blocked,
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          })
        ).toBeNull();
      });
      it("should not delete opposite blocked relationship", async () => {
        await unblockRelationship(USER_A.id, USER_B.id);

        // has not been deleted
        expect(
          await Relationship.findOne({
            relationshipType: RelationshipType.Blocked,
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          })
        ).not.toBeNull();
      });

      it("should publish event", async () => {
        await unblockRelationship(USER_A.id, USER_B.id);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
