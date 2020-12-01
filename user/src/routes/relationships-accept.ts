import {
  currentUser,
  NotFoundError,
  requireAuth,
  validateIso6391Param,
  validateObjectIdParam,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { acceptRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/accept
 * @apiName Accept Relationship
 * @apiGroup AcceptRelationship
 *
 * @apiDescription
 * Accepts a user's relationship request.
 *
 * @apiParam {string} id the user whose relationship request to accept
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when user attempts to use their own id
 *      { message: "Two different IDs must be supplied" },
 *      // Present when there is no request to accept
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
 *   "message": "Relationship request accepted"
 * }
 */
router.post(
  "/api/:iso6391/user/relationships/:id/accept",
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

    // accept relationship
    await acceptRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request accepted`,
    });
  }
);

export { router as relationshipsAcceptRouter };
