import {
  BadRequestError,
  NotAuthorizedError,
  RelationshipType,
  TooManyRequestsError,
} from "@flickswipe/common";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { requestRelationship } from "../request-relationship";

// sample data
import { USER_A, USER_B } from "../../../../test/sample-data/users";

describe("request relationship", () => {
  describe("invalid conditions", () => {
    describe("ids are the same", () => {
      it("should throw error", async () => {
        // throws error
        await expect(async () => {
          await requestRelationship(USER_A.id, USER_A.id);
        }).rejects.toThrowError(BadRequestError);
      });
    });

    describe("active relationship exists", () => {
      beforeEach(async () => {
        await Relationship.build({
          relationshipType: RelationshipType.Active,
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(BadRequestError);
      });
    });

    describe("requester has blocked receiver", () => {
      beforeEach(async () => {
        await Relationship.build({
          relationshipType: RelationshipType.Blocked,
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(NotAuthorizedError);
      });
    });

    describe("receiver has blocked requester", () => {
      beforeEach(async () => {
        await Relationship.build({
          relationshipType: RelationshipType.Blocked,
          sourceUser: USER_B.id,
          targetUser: USER_A.id,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(NotAuthorizedError);
      });
    });

    describe("incomplete request exists", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(BadRequestError);
      });
    });

    describe("last completed request too recent", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
          complete: true,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(TooManyRequestsError);
      });
    });

    describe("incomplete opposite request exists", () => {
      beforeEach(async () => {
        await RelationshipRequest.build({
          sourceUser: USER_B.id,
          targetUser: USER_A.id,
        }).save();
      });

      it("should throw error", async () => {
        // throws error
        await expect(
          async () => await requestRelationship(USER_A.id, USER_B.id)
        ).rejects.toThrowError(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    describe("can request relationship", () => {
      it("should create relationship request", async () => {
        await requestRelationship(USER_A.id, USER_B.id);

        // has been created
        expect(
          await RelationshipRequest.findOne({
            sourceUser: USER_A.id,
            targetUser: USER_B.id,
          })
        ).toEqual(
          expect.objectContaining({
            complete: false,
          })
        );
      });

      it("should publish event", async () => {
        await requestRelationship(USER_A.id, USER_B.id);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });
  });
});
