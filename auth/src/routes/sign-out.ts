import express from "express";

import { Jwt } from "../services/jwt";

const router = express.Router();

/**
 * @api {post} /api/en/auth/sign-out
 * @apiName SignOut
 * @apiGroup SignOut
 *
 * @apiDescription
 * Deletes JWT cookie.
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "User signed out"
 * }
 */
router.post("/api/:iso6391/auth/sign-out", async (req, res) => {
  Jwt.clearSession(req);

  res.status(200).send({
    message: `User signed out`,
  });
});

/**
 * Exports
 */
export { router as signOutRouter };
