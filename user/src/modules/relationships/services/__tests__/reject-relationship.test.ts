import { BadRequestError } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { rejectRelationship } from "../reject-relationship";

describe("reject relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("no incomplete relationship request exists", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await rejectRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("opposite incomplete relationship request exists", () => {
    it("should throw bad request error", async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();

      await expect(async () => {
        await rejectRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("relationship request exists", () => {
    it("should update request as complete", async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();

      await rejectRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: B,
          targetUser: A,
        })
      ).toEqual(
        expect.objectContaining({
          complete: true,
        })
      );
    });
    it("shouldn't create any relationship docs", async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();

      await rejectRelationship(A, B);

      expect(await Relationship.countDocuments()).toBe(0);
    });
    it("should publish event", async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();

      await rejectRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
