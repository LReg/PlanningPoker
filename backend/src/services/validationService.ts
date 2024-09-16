import {EstimationOption, Session} from "../models/SessionModel.js";

/**
 * return true if estimate is allowed
 */
export function validateEstimate(estimate: string, session: Session): boolean {
  return session.estimationValues.includes(estimate);
}
