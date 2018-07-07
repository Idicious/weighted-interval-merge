(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.intervalMerge = {})));
}(this, (function (exports) { 'use strict';

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

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
  var weightedIntervalMerge = function weightedIntervalMerge(intervals) {
    if (intervals == null || intervals.length === 0) return [];

    var sorted = sort(intervals);
    var normalized = normalizeIndex(sorted);
    var copied = copy(normalized);
    var grouped = groupByIndex(copied);

    return weightedMerge(grouped);
  };

  /**
   * Returns the start time of an interval based on it's start and offset start
   * 
   * @param {Interval} interval 
   * @returns {number} 
   */
  var calcStart = function calcStart(interval) {
    return interval.start + interval.offsetStart;
  };

  /**
   * Copies elements so original are unaltered
   * 
   * @param {Interval[]} intervals 
   * @returns {Interval[]}
   */
  var copy = function copy(intervals) {
    return intervals.map(function (i) {
      return _extends({}, i);
    });
  };

  /**
   * When an element is altered the index is set very high,
   * this functions normalizes the indexes back to 0
   * 
   * @param {Interval[]} intervals 
   * @returns {Interval[]}
   */
  var normalizeIndex = function normalizeIndex(intervals) {
    var index = 0;
    var preNormalizeIndex = Number.MIN_SAFE_INTEGER;
    intervals.forEach(function (el) {
      if (el.index > preNormalizeIndex) {
        preNormalizeIndex = el.index;
        el.index = ++index;
      } else {
        el.index = index;
      }
    });
    return intervals;
  };

  /**
   * Sorts the intervals by index, then by start
   * 
   * @param {Interval[]} intervals 
   * @return {Interval[]}
   */
  var sort = function sort(intervals) {
    return intervals.sort(function (a, b) {
      return cmp(a.index, b.index) || cmp(calcStart(a), calcStart(b));
    });
  };

  /**
   * Returns a map of intervals grouped by the key property
   * 
   * @param {Interval[]} intervals 
   * @returns {IntervalMap}
   */
  var groupByIndex = function groupByIndex(intervals) {
    return intervals.reduce(function (groups, interval) {
      (groups[interval.index] = groups[interval.index] || []).push(interval);
      return groups;
    });
  };

  /**
   * Merges all the groups by index
   * 
   * @param {IntervalMap} grouped 
   * @returns {Interval[]}
   */
  var weightedMerge = function weightedMerge(grouped) {
    var flattened = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(grouped)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        var merged = merge(grouped[index]);
        if (flattened == null) {
          flattened = merged;
        } else {
          flattened = combine(merged, flattened);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return flattened;
  };

  /**
   * Merges a set of intervals with the same index and remove any overlaps, left to right
   * 
   * @param {Interval[]} intervals 
   * @returns {Interval[]}
   */
  var merge = function merge(intervals) {
    if (intervals.length <= 1) return intervals;

    var result = [];

    var current = intervals[0];
    for (var i = 1; i < intervals.length; i++) {
      var next = intervals[i];

      // If current is completely overlapped by second it is merged into it
      if (current.end >= next.end) {
        continue;
        // Resolves partial overlaps by setting end of current to start of next
      } else if (calcStart(next) < current.end) {
        result.push(_extends({}, current, { end: calcStart(next) }));
        current = next;
      } else {
        // No overlap, push onto results
        result.push(current);
        current = next;
      }
    }

    result.push(current);
    return result;
  };

  /**
   * Given two sets of intervals it merges them so the highIndexes set has priority
   *
   * @param {Interval[]} highIndexes
   * @param {Interval[]} lowIndexes
   * 
   * @returns {Interval[]}
   */
  var combine = function combine(highIndexes, lowIndexes) {
    var highIndex = 0;
    var lowIndex = 0;

    var merged = [];

    while (highIndex < highIndexes.length || lowIndex < lowIndexes.length) {

      var high = highIndexes[highIndex];
      var low = lowIndexes[lowIndex];

      // Only low priority left so push low onto results
      if (highIndex === highIndexes.length) {
        merged.push(_extends({}, low));
        lowIndex++;
        // Only high priority left so push high onto results
      } else if (lowIndex === lowIndexes.length) {
        merged.push(_extends({}, high));
        highIndex++;
        // High priority start before or at same time as low
      } else if (calcStart(high) <= calcStart(low)) {
        // No overlap between low and high
        // low:                 ----------------------
        // high: ---------------
        if (high.end <= calcStart(low)) ; else if (high.end < low.end) {
          low.offsetStart = high.end - low.start;
          // Low index completely overlapped, dismiss it
          // low:               -----------
          // high: -------------------------------------
        } else {
          lowIndex++;
        }

        merged.push(_extends({}, high));
        highIndex++;
        // Low priority starts before high
      } else {
        // No overlap between low and high intervals
        // low: ---------------
        // high                ----------------------
        if (low.end <= calcStart(high)) {
          merged.push(_extends({}, low));
          lowIndex++;
          // Partial overlap where high ends after low
          // low: ---------------------
          // high                ----------------------
        } else if (high.end > low.end) {
          merged.push(_extends({}, low, { end: calcStart(high) }));
          lowIndex++;
          // Partial overlap where high ends before low
          // low: -------------------------------------
          // high             -----------
        } else {
          merged.push(_extends({}, low, { end: calcStart(high) }));
          low.offsetStart = high.end - low.start;
        }
      }
    }

    return merged;
  };

  /**
   *
   * @param {number} a
   * @param {number} b
   * 
   * @returns {1 | -1 | 0}
   */
  var cmp = function cmp(a, b) {
    if (a > b) return +1;
    if (a < b) return -1;
    return 0;
  };

  exports.weightedIntervalMerge = weightedIntervalMerge;
  exports.default = weightedIntervalMerge;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
