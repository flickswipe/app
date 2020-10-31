import {
  BadRequestError,
  NotAuthorizedError,
  RelationshipType,
  TooManyRequestsError,
} from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipRequestedPublisher } from "../events/publishers/relationship-requested";
import { Relationship } from "../models/relationship";
import { RelationshipRequest } from "../models/relationship-request";

export async function requestRelationship(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  // check no current relationship exists
  const existingRelationshipDoc = await Relationship.findOne({
    sourceUser: fromUserId,
    targetUser: toUserId,
  });

  if (existingRelationshipDoc) {
    switch (existingRelationshipDoc.relationshipType) {
      case RelationshipType.Active:
        throw new BadRequestError(`Relationship already exists`);

      case RelationshipType.Blocked:
        throw new NotAuthorizedError();

      default:
        throw new Error(`Invalid relationship type`);
    }
  }

  // check no opposite "blocked" relationship exists
  const oppositeRelationshipDoc = await Relationship.findOne({
    relationshipType: RelationshipType.Blocked,
    sourceUser: toUserId,
    targetUser: fromUserId,
  });

  if (oppositeRelationshipDoc) {
    throw new NotAuthorizedError();
  }

  // check no current request exists
  const existingRequestDoc = await RelationshipRequest.findOne({
    sourceUser: fromUserId,
    targetUser: toUserId,
  }).sort({ createdAt: -1 });

  if (existingRequestDoc) {
    // don't have more than one incomplete request
    if (existingRequestDoc.complete === false) {
      throw new BadRequestError(`Request already exists`);
    }

    // throttle requests
    const minWaitDuration = 24 * 60 * 60;
    if (
      existingRequestDoc.updatedAt.getTime() >
      new Date().getTime() - minWaitDuration
    ) {
      throw new TooManyRequestsError();
    }
  }

  // check no opposite request exists
  const oppositeRequestDoc = await RelationshipRequest.findOne({
    sourceUser: toUserId,
    targetUser: fromUserId,
    complete: false,
  }).sort({ createdAt: -1 });

  if (oppositeRequestDoc) {
    throw new BadRequestError(
      `Opposite request already exists; accept it instead.`
    );
  }

  // create the request
  await RelationshipRequest.build({
    sourceUser: fromUserId,
    targetUser: toUserId,
  }).save();

  // publish event
  await new RelationshipRequestedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
    updatedAt: new Date(),
  });

  console.log(`${fromUserId} requested relationship with ${toUserId}`);
}
