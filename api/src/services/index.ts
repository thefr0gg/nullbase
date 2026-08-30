import type { Database } from "../db/port";
import { AdminSessionRepository } from "../repositories/admin-sessions";
import { AdminUserRepository } from "../repositories/admin-users";
import { FeedbackRepository } from "../repositories/feedback";
import { LikesRepository } from "../repositories/likes";
import { AdminService } from "./admin-service";
import { FeedbackService } from "./feedback-service";
import { LikesService } from "./likes-service";

/** All services, built once per runtime against the Database port. */
export interface Services {
  admin: AdminService;
  feedback: FeedbackService;
  likes: LikesService;
}

export function createServices(db: Database, tokenSecret: string): Services {
  return {
    admin: new AdminService(new AdminUserRepository(db), new AdminSessionRepository(db), tokenSecret),
    feedback: new FeedbackService(new FeedbackRepository(db), tokenSecret),
    likes: new LikesService(new LikesRepository(db), tokenSecret),
  };
}