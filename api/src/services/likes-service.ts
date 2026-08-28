import type { LikesRepository } from "../repositories/likes";
import { RATE_LIMITS, DAY_AGO, secondsUntilUtcMidnight } from "../config";
import { hashWithSecret } from "../lib/crypto";
import { RateLimitedError } from "./errors";
import type { RequestIdentity } from "../types";

export class LikesService {
  constructor(
    private readonly repo: LikesRepository,
    private readonly tokenSecret: string, // salts all identity hashes
  ) {}

  async count(pagePath: string): Promise<number> {
    return this.repo.getCount(pagePath);
  }

  /**
   * Like a page on behalf of a visitor.
   *
   * Spam protection, in order:
   *  1. visitor_hash = SHA256(visitorId | ip | ua | secret) — binds the
   *     browser identity to the actual network; one like per (page, hash).
   *  2. 24h caps per visitor hash and per ip hash (blocks UA/localStorage
   *     rotation and request floods from one network).
   * Raw request data is never stored — only the salted hashes.
   */
  async like(
    pagePath: string,
    identity: RequestIdentity,
  ): Promise<{ liked: boolean; count: number }> {
    const visitorHash = await hashWithSecret(
      [identity.visitorId, identity.ip, identity.userAgent],
      this.tokenSecret,
    );
    const ipHash = await hashWithSecret([identity.ip], this.tokenSecret);

    const since = DAY_AGO();
    const byVisitor = await this.repo.countRecentByVisitor(visitorHash, since);
    if (byVisitor >= RATE_LIMITS.likesPerVisitorPerDay) {
      throw new RateLimitedError(
        secondsUntilUtcMidnight(),
        "Too many likes today — please try again tomorrow.",
      );
    }
    const byIp = await this.repo.countRecentByIp(ipHash, since);
    if (byIp >= RATE_LIMITS.likesPerIpPerDay) {
      throw new RateLimitedError(
        secondsUntilUtcMidnight(),
        "Too many likes from this network today — please try again tomorrow.",
      );
    }

    const liked = await this.repo.like(pagePath, visitorHash, ipHash);
    const count = await this.repo.getCount(pagePath);
    return { liked, count };
  }
}