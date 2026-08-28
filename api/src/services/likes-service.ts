import type { LikesRepository } from "../repositories/likes";
import { visitorHash } from "../lib/crypto";

export class LikesService {
  constructor(
    private readonly repo: LikesRepository,
    private readonly tokenSecret: string, // also salts visitor hashes
  ) {}

  async count(pagePath: string): Promise<number> {
    return this.repo.getCount(pagePath);
  }

  /**
   * Like a page on behalf of a visitor. `requestParts` are the raw headers
   * (ip + user-agent) — they are salted and hashed here so no raw request
   * data ever reaches the database.
   */
  async like(
    pagePath: string,
    requestParts: (string | null)[],
  ): Promise<{ liked: boolean; count: number }> {
    const hash = await visitorHash(requestParts, this.tokenSecret);
    const liked = await this.repo.like(pagePath, hash);
    const count = await this.repo.getCount(pagePath);
    return { liked, count };
  }
}