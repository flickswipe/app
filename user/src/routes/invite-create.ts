import { currentUser, NotFoundError, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { requestRelationship } from "../modules/relationships/relationships";
import { User } from "../modules/track-auth/models/user";

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/create
 * @apiName CreateInvite
 * @apiGroup CreateInvite
 *
 * @apiDescription
 * Unblocks a user.
 *
 * @apiParam {string} id the user whose invitation to create
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
 *   "message": "User createed"
 * }
 */
router.post(
  "/api/en/user/relationships/:id/request",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id: targetUserId } = req.params;

    // get target user
    const targetUserDoc = await User.findOne({ _id: targetUserId });

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // request relationship
    await requestRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `User requested`,
    });
  }
);

export { router as inviteCreateRouter };
