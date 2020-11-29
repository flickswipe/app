import { BadRequestError } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { cancelRelationship } from "../cancel-relationship";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";

describe("cancel relationship", () => {
  describe("invalid conditions", () => {
    describe("ids are the same", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await cancelRelationship(USER_A.id, USER_A.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });

    describe("no relationship request exists", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await cancelRelationship(USER_A.id, USER_B.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("relationship request exists", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();
      });

      it("should update relationship request", async () => {
        await cancelRelationship(USER_A.id, USER_B.id);

        // has been updated
        expect(
          await RelationshipRequest.findOne({
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          })
        ).toEqual(
          expect.objectContaining({
            complete: true,
          })
        );
      });

      it("shouldn't create any relationship docs", async () => {
        await cancelRelationship(USER_A.id, USER_B.id);

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(0);
      });

      it("should publish event", async () => {
        await cancelRelationship(USER_A.id, USER_B.id);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
