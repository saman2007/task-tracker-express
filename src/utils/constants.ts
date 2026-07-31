import path from "path";

export const JSON_TASKS_PATH: string = path.join(
  __dirname,
  "..",
  "data",
  "tasks.json",
);

  /**
   * - `0`: for low priority filter
   * - `1`: for medium priority filter
   * - `2`: for high priority filter
   * - `3`: for all priorities
   */
export const PRIORITY_FILTERS = ["0", "1", "2", "3"];
