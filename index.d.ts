export interface Interval {
  id: string;
  start: number;
  end: number;
  offsetStart: number;
  index: number;
}

/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @param intervals Intervals to flatten
 * @returns {Interval[]} flattened Interval array
 */
export function weightedIntervalMerge(intervals: Interval[]): Interval[];
