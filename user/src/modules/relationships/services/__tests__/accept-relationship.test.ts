import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { acceptRelationship } from "../accept-relationship";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";

describe("accept relationship", () => {
  describe("invalid conditions", () => {
    describe("ids are the same", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await acceptRelationship(USER_A.id, USER_A.id);
        }).rejects.toThrowError(BadRequestError);

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(0);
      });
    });

    describe("no incomplete relationship request exists", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await acceptRelationship(USER_A.id, USER_B.id);
        }).rejects.toThrowError(BadRequestError);

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(0);
      });
    });

    describe("opposite incomplete relationship request exists", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(0);
      });

      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await acceptRelationship(USER_A.id, USER_B.id);
        }).rejects.toThrowError(BadRequestError);

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(0);
      });
    });
  });

  describe("valid conditions", () => {
    describe("relationship request exists", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_B.id,
          targetUser: USER_A.id,
        }).save();
      });

      it("should create a->b doc", async () => {
        await acceptRelationship(USER_A.id, USER_B.id);

        // has been created
        expect(
          await Relationship.findOne({
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          })
        ).toEqual(
          expect.objectContaining({
            relationshipType: RelationshipType.Active,
          })
        );

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(2);
      });
      it("should create b->a doc", async () => {
        await acceptRelationship(USER_A.id, USER_B.id);

        // has been created
        expect(
          await Relationship.findOne({
            sourceUser: USER_B.id,
            targetUser: USER_A.id,
          })
        ).toEqual(
          expect.objectContaining({
            relationshipType: RelationshipType.Active,
          })
        );

        // no extra inserts
        expect(await Relationship.countDocuments()).toBe(2);
      });

      it("should publish event", async () => {
        await acceptRelationship(USER_A.id, USER_B.id);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
