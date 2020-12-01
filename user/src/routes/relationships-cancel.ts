import {
  currentUser,
  NotFoundError,
  requireAuth,
  validateIso6391Param,
  validateObjectIdParam,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { cancelRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/cancel
 * @apiName Cancel Relationship
 * @apiGroup CancelRelationship
 *
 * @apiDescription
 * Cancels a user's relationship request.
 *
 * @apiParam {string} id the user whose relationship request to cancel
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when user attempts to use their own id
 *      { message: "Two different IDs must be supplied" },
 *      // Present when there is no request to cancel
 *      { message: "Relationship request doesn't exist" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  404 Not found
 * {
 *   "errors": [
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Relationship request cancelled"
 * }
 */
router.post(
  "/api/:iso6391/user/relationships/:id/cancel",
  [validateIso6391Param("iso6391"), validateObjectIdParam("id")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id: targetUserId } = req.params;

    // get target user
    const targetUserDoc = await getUser(targetUserId);

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // cancel relationship
    await cancelRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request cancelled`,
    });
  }
);

export { router as relationshipsCancelRouter };
