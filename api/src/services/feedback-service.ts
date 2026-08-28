import type {
  FeedbackInput,
  FeedbackRepository,
  FeedbackRow,
  FeedbackStatus,
} from "../repositories/feedback";

export class FeedbackService {
  constructor(private readonly repo: FeedbackRepository) {}

  async submit(input: FeedbackInput): Promise<FeedbackRow> {
    // Business rule: a submission must carry a rating or a comment (email is
    // optional contact info, never required).
    if (input.rating == null && (input.comment == null || input.comment.trim() === "")) {
      throw new FeedbackValidationError("A rating or a comment is required.");
    }
    return this.repo.insert({
      pagePath: input.pagePath,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
      email: input.email?.trim() || undefined,
    });
  }

  async list(options: {
    status?: FeedbackStatus;
    limit: number;
    offset: number;
  }): Promise<{ items: FeedbackRow[]; total: number; limit: number; offset: number }> {
    const [items, total] = await Promise.all([
      this.repo.list(options),
      this.repo.count(options.status),
    ]);
    return { items, total, limit: options.limit, offset: options.offset };
  }

  async updateStatus(id: number, status: FeedbackStatus): Promise<boolean> {
    return this.repo.updateStatus(id, status);
  }
}

export class FeedbackValidationError extends Error {}