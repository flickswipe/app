import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { blockRelationship } from "../block-relationship";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";

describe("block relationship", () => {
  describe("invalid conditions", () => {
    describe("ids are the same", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await blockRelationship(USER_A.id, USER_A.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("relationship exists", () => {
      beforeEach(async () => {
        await Relationship.build({
          relationshipType: RelationshipType.Active,
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();
      });

      describe("has active opposite relationship", () => {
        beforeEach(async () => {
          await Relationship.build({
            relationshipType: RelationshipType.Active,
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          }).save();
        });

        it("should update a->b relationship", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been updated
          expect(
            await Relationship.findOne({
              sourceUser: USER_A.id,
              targetUser: USER_B.id,
            })
          ).toEqual(
            expect.objectContaining({
              relationshipType: RelationshipType.Blocked,
            })
          );
        });

        it("should delete opposite active relationship", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been deleted
          expect(
            await Relationship.findOne({
              sourceUser: USER_B.id,
              targetUser: USER_A.id,
            })
          ).toBeNull();
        });

        it("should publish event", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been published
          expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
      });

      describe("has blocked opposite relationship", () => {
        beforeEach(async () => {
          await Relationship.build({
            relationshipType: RelationshipType.Blocked,
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          }).save();
        });

        it("should update a->b relationship", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been updated
          expect(
            await Relationship.findOne({
              sourceUser: USER_A.id,
              targetUser: USER_B.id,
            })
          ).toEqual(
            expect.objectContaining({
              relationshipType: RelationshipType.Blocked,
            })
          );
        });

        it("should not delete opposite blocked relationship", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has not been deleted
          expect(
            await Relationship.findOne({
              sourceUser: USER_B.id,
              targetUser: USER_A.id,
            })
          ).toEqual(
            expect.objectContaining({
              relationshipType: RelationshipType.Blocked,
            })
          );
        });

        it("should publish event", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been published
          expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
      });

      describe("incomplete a->b request exists", () => {
        beforeEach(async () => {
          await RelationshipRequest.build({
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          }).save();
        });

        it("should delete request", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been deleted
          expect(
            await RelationshipRequest.findOne({
              sourceUser: USER_A.id,
              targetUser: USER_B.id,
            })
          ).toBeNull();
        });

        it("should publish event", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been published
          expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
      });

      describe("incomplete b->a request exists", () => {
        beforeEach(async () => {
          await RelationshipRequest.build({
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          }).save();
        });

        it("should delete request", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been deleted
          expect(
            await RelationshipRequest.findOne({
              sourceUser: USER_B.id,
              targetUser: USER_A.id,
            })
          ).toBeNull();
        });

        it("should publish event", async () => {
          await blockRelationship(USER_A.id, USER_B.id);

          // has been published
          expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
      });
    });

    describe("no relationship exists", () => {
      it("should create relationship", async () => {
        await blockRelationship(USER_A.id, USER_B.id);

        // has been created
        expect(
          await Relationship.findOne({
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          })
        ).toEqual(
          expect.objectContaining({
            relationshipType: RelationshipType.Blocked,
          })
        );

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(1);
      });

      it("should publish event", async () => {
        await blockRelationship(USER_A.id, USER_B.id);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
