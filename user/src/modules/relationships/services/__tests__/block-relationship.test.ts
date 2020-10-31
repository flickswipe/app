import { RelationshipType } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { blockRelationship } from "../block-relationship";

describe("block relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("relationship already exists", () => {
    it("should update existing relationship", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();

      await blockRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          relationshipType: RelationshipType.Blocked,
        })
      );
    });
    it("should delete opposite active relationship", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: B,
        targetUser: A,
      }).save();

      await blockRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: B,
          targetUser: A,
        })
      ).toBeNull();
    });

    it("should ignore opposite blocked relationship", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: B,
        targetUser: A,
      }).save();

      await blockRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: B,
          targetUser: A,
        })
      ).toEqual(
        expect.objectContaining({
          relationshipType: RelationshipType.Blocked,
        })
      );
    });
    it("should publish event", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();

      await blockRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("no relationship exists", () => {
    it("create relationship doc", async () => {
      await blockRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          relationshipType: RelationshipType.Blocked,
        })
      );
    });
    it("should publish event", async () => {
      await blockRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
