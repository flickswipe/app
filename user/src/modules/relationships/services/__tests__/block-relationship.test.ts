import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { blockRelationship } from "../block-relationship";

describe("block relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("ids are the same", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await blockRelationship(A, A);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("relationship already exists", () => {
    beforeEach(async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();
    });
    it("should update existing relationship", async () => {
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

    it("should delete incomplete a->b request", async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();

      await blockRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toBeNull();
    });
    it("should delete incomplete b->a request", async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();

      await blockRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: B,
          targetUser: A,
        })
      ).toBeNull();
    });
    it("should publish event", async () => {
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
