import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { unblockRelationship } from "../unblock-relationship";

describe("unblock relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("ids are the same", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await unblockRelationship(A, A);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("user is not blocked", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await unblockRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("user is blocked", () => {
    beforeEach(async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: A,
        targetUser: B,
      }).save();
    });
    it("should delete relationship", async () => {
      await unblockRelationship(A, B);

      expect(
        await Relationship.findOne({
          relationshipType: RelationshipType.Blocked,
          sourceUser: A,
          targetUser: B,
        })
      ).toBeNull();
    });
    it("should ignore opposite blocked relationship", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: B,
        targetUser: A,
      }).save();

      await unblockRelationship(A, B);

      expect(
        await Relationship.findOne({
          relationshipType: RelationshipType.Blocked,
          sourceUser: B,
          targetUser: A,
        })
      ).not.toBeNull();
    });
    it("should publish event", async () => {
      await unblockRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
