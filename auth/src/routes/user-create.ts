import express, { Request, Response } from 'express';

import {
    BadRequestError, currentUser, validateIso6391Param, validateRequest
} from '@flickswipe/common';

import { UserCreatedPublisher } from '../events/publishers/user-created';
import { User } from '../models/user';
import { natsWrapper } from '../nats-wrapper';
import { Jwt } from '../services/classes/jwt';

const router = express.Router();

/**
 * Types
 */
type UserPayload = {
  id: string;
  email: string;
};

/**
 * @api {post} /api/en/auth/create-user
 * @apiName CreateUser
 * @apiGroup CreateUser
 *
 * @apiDescription
 * Creates new user, creates JWT cookie, and publishes `UserCreated` event.
 *
 * @apiParam {string} email (optional)
 *
 * @apiErrorExample {json}  400 Bad Request
 * {
 *   "errors": [
 *      // Present when params are missing or invalid
 *      { message: "Email must be valid", field: "email" },
 *      // Present when user already authenticated
 *      { message: "User already signed in" }
 *      // Present when email already associated with another user
 *      { message: "User already exists with this email" }
 *   ]
 * }
 *
 * @apiSuccessExample {json} 201 Created
 * {
 *   "message": "User created"
 * }
 */
router.post(
  "/api/:iso6391/auth/create-user",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    if (currentUser) {
      throw new BadRequestError(`User already signed in`);
    }

    // don't create multiple users with same email
    const { email } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new BadRequestError(`User already exists with this email`);
      }
    }

    // create user
    const user = User.build({ email });
    await user.save();

    // Publish an event saying that a user was created
    new UserCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
    } as UserPayload;

    // sign in user
    Jwt.setOnSession(req, userPayload);

    res.status(201).send({
      message: `User created`,
      user: userPayload,
    });

    console.info(
      `User ${user.id} created ${user.email ? "with" : "without"} email`
    );
  }
);

export { router as usersCreateRouter };
