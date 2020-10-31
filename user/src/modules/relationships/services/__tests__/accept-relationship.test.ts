import { BadRequestError, RelationshipType } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { acceptRelationship } from "../accept-relationship";

describe("accept relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("no incomplete relationship request exists", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await acceptRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("opposite incomplete relationship request exists", () => {
    beforeEach(async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();
    });
    it("should throw bad request error", async () => {
      await expect(async () => {
        await acceptRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("relationship request exists", () => {
    it("should insert a->b document with correct data", async () => {
      await acceptRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          relationshipType: RelationshipType.Active,
        })
      );
    });
    it("should insert b->a document with correct data", async () => {
      await acceptRelationship(A, B);

      expect(
        await Relationship.findOne({
          sourceUser: B,
          targetUser: A,
        })
      ).toEqual(
        expect.objectContaining({
          relationshipType: RelationshipType.Active,
        })
      );
    });
    it("should publish event", async () => {
      await acceptRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
