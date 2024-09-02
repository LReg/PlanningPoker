const allowedEstimates = ['🤷‍♂️', '☕', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144'];
/**
 * return true if estimate is allowed
 */
export function validateEstimate(estimate: string): boolean {
  return allowedEstimates.includes(estimate);
}
