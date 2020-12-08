/**
 * Provide global helper functions for tests
 */
import request from 'supertest';

import { app } from '../app';

declare global {
  // @ts-ignore
  namespace NodeJS {
    interface Global {
      signIn(email?: string): Promise<string[]>;
    }
  }
}

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
