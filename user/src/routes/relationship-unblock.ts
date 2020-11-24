import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { unblockRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/unblock
 * @apiName Unblock Relationship
 * @apiGroup UnblockRelationship
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when user attempts to use their own id
 *      { message: "Two different IDs must be supplied" },
 *      // Present when user has not blocked target user
 *      { message: "User is not blocked" },
 *   ]
 * }
 *
 * @apiParam {string} id the user to unblock
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
 *   "message": "User unblocked"
 * }
 */
router.post(
  "/api/:iso6391/user/relationships/:id/unblock",
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

    // unblock relationship
    await unblockRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `User unblocked`,
    });
  }
);

export { router as relationshipUnblockRouter };
