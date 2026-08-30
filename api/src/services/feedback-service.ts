import type { FeedbackInput, FeedbackRepository, FeedbackRow, FeedbackStatus } from "../repositories/feedback";
import { RATE_LIMITS, DAY_AGO, HOUR_AGO, secondsUntilNextHour, secondsUntilUtcMidnight } from "../config";
import { hashWithSecret } from "../lib/crypto";
import { RateLimitedError } from "./errors";
import type { RequestIdentity } from "../types";

export class FeedbackService {
  constructor(
    private readonly repo: FeedbackRepository,
    private readonly tokenSecret: string, // salts identity hashes
  ) {}

  async submit(input: Omit<FeedbackInput, "visitorHash" | "ipHash">, identity: RequestIdentity): Promise<FeedbackRow> {
    // Business rule: a submission must carry a rating or a comment (email is
    // optional contact info, never required).
    if (input.rating == null && (input.comment == null || input.comment.trim() === "")) {
      throw new FeedbackValidationError("A rating or a comment is required.");
    }

    // Rate limits (same identity hashing as likes — one salted hash set per
    // request, never stored raw).
    const visitorHash = await hashWithSecret(
      [identity.visitorId, identity.ip, identity.userAgent],
      this.tokenSecret,
    );
    const ipHash = await hashWithSecret([identity.ip], this.tokenSecret);

    const byVisitor = await this.repo.countRecentByVisitor(visitorHash, HOUR_AGO());
    if (byVisitor >= RATE_LIMITS.feedbackPerVisitorPerHour) {
      throw new RateLimitedError(
        secondsUntilNextHour(),
        "You're sending feedback too quickly — please try again shortly.",
      );
    }
    const byIp = await this.repo.countRecentByIp(ipHash, DAY_AGO());
    if (byIp >= RATE_LIMITS.feedbackPerIpPerDay) {
      throw new RateLimitedError(
        secondsUntilUtcMidnight(),
        "Too much feedback from this network today — please try again tomorrow.",
      );
    }

    return this.repo.insert({
      pagePath: input.pagePath,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
      email: input.email?.trim() || undefined,
      visitorHash,
      ipHash,
    });
  }

  async list(options: {
    status?: FeedbackStatus;
    pagePath?: string;
    limit: number;
    offset: number;
  }): Promise<{ items: FeedbackRow[]; total: number; limit: number; offset: number }> {
    const [items, total] = await Promise.all([
      this.repo.list(options),
      this.repo.count(options.status, options.pagePath),
    ]);
    return { items, total, limit: options.limit, offset: options.offset };
  }

  async updateStatus(id: number, status: FeedbackStatus): Promise<boolean> {
    return this.repo.updateStatus(id, status);
  }
}

export class FeedbackValidationError extends Error {}