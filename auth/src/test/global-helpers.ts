/**
 * Provide global helper functions for tests
 */
import request from "supertest";

import { app } from "../app";
import { User, UserDoc } from "../models/user";

declare global {
  // @ts-ignore
  namespace NodeJS {
    interface Global {
      signIn(email?: string): Promise<string[]>;
      createUser(email?: string): Promise<UserDoc>;
    }
  }
}

/**
 * Create a user doc
 *
 * @param email user's email (leave blank for no email)
 *
 * @returns {UserDoc} user document
 */
global.createUser = async (email: string) => {
  const user = await User.build({ email });
  await user.save();

  return user;
};

/**
 * Create a user and sign them in
 *
 * @example
 *
 * const response = await request(app)
 *    .post("/api/en/auth/create-user")
 *    .set("Cookie", await global.signIn(email))
 *    .send();
 *
 * @param email user's email (leave blank for no email)
 *
 * @returns {array} cookie session array
 */
global.signIn = async (email: string) => {
  const response = await request(app)
    .post("/api/en/auth/create-user")
    .send({
      email,
    })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
