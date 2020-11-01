import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { blockRelationship } from "../modules/relationships/relationships";
import { getUser } from "../modules/track-auth/track-auth";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/block
 * @apiName Block Relationship
 * @apiGroup BlockRelationship
 *
 * @apiDescription
 * Blocks a user.
 *
 * @apiParam {string} id the user to block
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when user attempts to use their own id
 *      { message: "Two different IDs must be supplied" },
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
 *   "message": "User blocked"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/block",
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

    // block relationship
    await blockRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `User blocked`,
    });
  }
);

export { router as relationshipBlockRouter };
