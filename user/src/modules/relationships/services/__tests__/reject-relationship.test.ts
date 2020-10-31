import { BadRequestError } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { rejectRelationship } from "../reject-relationship";

describe("reject relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("ids are the same", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await rejectRelationship(A, A);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("no opposite incomplete relationship request exists", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await rejectRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("incomplete relationship request exists", () => {
    beforeEach(async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();
    });
    it("should throw bad request error", async () => {
      await expect(async () => {
        await rejectRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("relationship request exists", () => {
    beforeEach(async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();
    });
    it("should update request as complete", async () => {
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
      await rejectRelationship(A, B);

      expect(await Relationship.countDocuments()).toBe(0);
    });
    it("should publish event", async () => {
      await rejectRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
