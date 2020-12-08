import { randomBytes } from 'crypto';
import { promisify } from 'util';

/**
 * @see https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
 */
const randomBytesAsync = promisify(randomBytes);

/**
 * Handles token logic
 */
export class Token {
  /**
   * Create a token
   *
   * Tokens can be any length, and consist of numbers and uppercase characters
   * in the range A-F.
   *
   * @param length number of characters in token
   *
   * @returns {string} random string of length <length>
   */
  static async generate(length: number): Promise<string> {
    const buffer = await randomBytesAsync(length);

    const token = buffer.toString("hex").substr(0, length).toUpperCase();

    return token;
  }
}
