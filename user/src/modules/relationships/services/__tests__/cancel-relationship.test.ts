import { BadRequestError } from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { cancelRelationship } from "../cancel-relationship";

describe("cancel relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("no opposite incomplete relationship request exists", () => {
    it("should throw bad request error", async () => {
      await expect(async () => {
        await cancelRelationship(A, B);
      }).rejects.toThrowError(BadRequestError);
    });
  });

  describe("relationship request exists", () => {
    beforeEach(async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();
    });
    it("should update request as complete", async () => {
      await cancelRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          complete: true,
        })
      );
    });
    it("shouldn't create any relationship docs", async () => {
      await cancelRelationship(A, B);

      expect(await Relationship.countDocuments()).toBe(0);
    });
    it("should publish event", async () => {
      await cancelRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
