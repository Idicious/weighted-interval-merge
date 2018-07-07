/**
 * @typedef {Object} Interval
 * 
 * @property {number} start
 * @property {number} offsetStart
 * @property {number} end
 * @property {number} index
 */

 /**
  * @typedef {{[key: string]: Interval}} IntervalMap
  */

/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @param {Interval[]} intervals Segments to flatten
 * @returns {Interval[]} flattened Interval array
 */
export const weightedIntervalMerge = intervals => {
  if(intervals == null || intervals.length === 0) return [];

  const copied = copy(intervals);
  const sorted = sort(copied);
  const normalized = normalizeIndex(sorted);
  const grouped = groupByIndex(normalized);

  return weightedMerge(grouped);
}

/**
 * Returns the start time of an interval based on it's start and offset start
 * 
 * @param {Interval} interval 
 * @returns {number} 
 */
const calcStart = interval => interval.start + interval.offsetStart;

/**
 * Copies elements so original are unaltered
 * 
 * @param {Interval[]} intervals 
 * @returns {Interval[]}
 */
const copy = intervals => intervals.map(i => ({ ...i }));
  

/**
 * When an element is altered the index is set very high,
 * this functions normalizes the indexes back to 0
 * 
 * @param {Interval[]} intervals 
 * @returns {Interval[]}
 */
const normalizeIndex = intervals => {
  let index = 0;
  let preNormalizeIndex = Number.MIN_SAFE_INTEGER;
  intervals.forEach(el => {
    if (el.index > preNormalizeIndex) {
      preNormalizeIndex = el.index;
      el.index = ++index;
    } else {
      el.index = index;
    }
  });
  return intervals;
}

/**
 * Sorts the intervals by index, then by start
 * 
 * @param {Interval[]} intervals 
 * @return {Interval[]}
 */
const sort = intervals => intervals.sort((a, b) => cmp(a.index, b.index) || cmp(calcStart(a), calcStart(b)));

/**
 * Returns a map of intervals grouped by the key property
 * 
 * @param {Interval[]} intervals 
 * @returns {IntervalMap}
 */
const groupByIndex = intervals =>
  intervals.reduce((groups, interval) => {
    (groups[interval.index] = groups[interval.index] || []).push(interval);
    return groups;
  });


/**
 * Merges all the groups by index
 * 
 * @param {IntervalMap} grouped 
 * @returns {Interval[]}
 */
const weightedMerge = grouped => {
  let flattened = null;
  for (let index of Object.keys(grouped)) {
    const merged = merge(grouped[index]);
    if (flattened == null) {
      flattened = merged;
    } else {
      flattened = combine(merged, flattened);
    }
  }
  return flattened;
}

/**
 * Merges a set of intervals with the same index and remove any overlaps, left to right
 * 
 * @param {Interval[]} intervals 
 * @returns {Interval[]}
 */
const merge = intervals => {
  if (intervals.length <= 1) 
    return intervals;

  const result = [];

  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    // If current is completely overlapped by second it is merged into it
    if (current.end >= next.end) {
      continue;
    // Resolves partial overlaps by setting end of current to start of next
    } else if(calcStart(next) < current.end) {
      result.push({ ...current, end: calcStart(next) });
      current = next;
    } else {
      // No overlap, push onto results
      result.push(current);
      current = next;
    }
  }

  result.push(current);
  return result;
}

/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param {Interval[]} highIndexes
 * @param {Interval[]} lowIndexes
 * 
 * @returns {Interval[]}
 */
const combine = (highIndexes, lowIndexes) => {
  let highIndex = 0;
  let lowIndex = 0;

  const merged = [];

  while (highIndex < highIndexes.length || lowIndex < lowIndexes.length) {
    
    const high = highIndexes[highIndex];
    const low = lowIndexes[lowIndex];

    // Only low priority left so push low onto results
    if (highIndex === highIndexes.length) {
      merged.push({ ...low });
      lowIndex++;
    // Only high priority left so push high onto results
    } else if (lowIndex === lowIndexes.length) {
      merged.push({ ...high });
      highIndex++;
    // High priority start before or at same time as low
    } else if (calcStart(high) <= calcStart(low)) {
      // No overlap between low and high
      // low:                 ----------------------
      // high: ---------------
      if(high.end <= calcStart(low)) {
      // Partial overlap where high ends after low
      // low:                 ----------------------
      // high: ----------------------
      } else if(high.end < low.end) {
        low.offsetStart = high.end - low.start;
      // Low index completely overlapped, dismiss it
      // low:               -----------
      // high: -------------------------------------
      } else {
        lowIndex++;
      }

      merged.push({ ...high });
      highIndex++;
    // Low priority starts before high
    } else {
      // No overlap between low and high intervals
      // low: ---------------
      // high                ----------------------
      if (low.end <= calcStart(high)) {
        merged.push({ ...low });
        lowIndex++;
      // Partial overlap where high ends after low
      // low: ---------------------
      // high                ----------------------
      } else if (high.end > low.end) {
        merged.push({ ...low, end: calcStart(high) });
        lowIndex++;
      // Partial overlap where high ends before low
      // low: -------------------------------------
      // high             -----------
      } else {
        merged.push({ ...low, end: calcStart(high) });
        low.offsetStart = high.end - low.start;
      } 
    }
  }

  return merged;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * 
 * @returns {1 | -1 | 0}
 */
const cmp = (a, b) => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};