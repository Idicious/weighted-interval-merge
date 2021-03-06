const testCases = [
    {
        test: "Flatten returns intervals.",
        input: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 }
        ]
    },
    {
        test: "Adds missing properties.",
        input: [
            { id: "1", start: 0, end: 30 }
        ],
        expected: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 }
        ]
    },
    {
        test: "Normalizes indexes correctly.",
        input: [
            { id: "3", start: 10, end: 15, index: 36, offsetStart: 0 },
            { id: "4", start: 15, end: 20, index: 10, offsetStart: 0 },
            { id: "1", start: 0, end: 5, index: 50, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 23, offsetStart: 0 },
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 4, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 0 },
            { id: "3", start: 10, end: 15, index: 3, offsetStart: 0 },
            { id: "4", start: 15, end: 20, index: 1, offsetStart: 0 },
        ]
    },
    {
        test: "Sorts correctly.",
        input: [
            { id: "3", start: 10, end: 15, index: 1, offsetStart: 0 },
            { id: "4", start: 15, end: 20, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 0 },
            { id: "1", start: 0, end: 5, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 0 },
            { id: "3", start: 10, end: 15, index: 1, offsetStart: 0 },
            { id: "4", start: 15, end: 20, index: 1, offsetStart: 0 },
        ]
    },
    

    /**
     * Tests all cases of merging within the same index
     */

    {
        test: "Drops intervals with the same index that are completely overlapped by another.",
        input: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 15, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 }
        ]
    },
    {
        test: "Merges partially overlapping interval with the same index by setting end of first to start of second.",
        input: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 },
            { id: "2", start: 15, end: 45, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 15, index: 1, offsetStart: 0 },
            { id: "2", start: 15, end: 45, index: 1, offsetStart: 0 }
        ]
    },

    /**
     * Tests all cases when high index starts first
     */

    {
        test: "Keeps both intervals if high index interval starts first without overlap.",
        input: [
            { id: "1", start: 0, end: 5, index: 2, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 2, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 0 }
        ]
    },
    {
        test: "Changes low index start if high index starts first and partially overlaps.",
        input: [
            { id: "1", start: 0, end: 7, index: 2, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 7, index: 2, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 1, offsetStart: 2 }
        ]
    },
    {
        test: "Drops low index if completely overlapped by high index.",
        input: [
            { id: "1", start: 10, end: 15, index: 1, offsetStart: 0 },
            { id: "2", start: 0, end: 30, index: 2, offsetStart: 0 }
        ],
        expected: [
            { id: "2", start: 0, end: 30, index: 2, offsetStart: 0 }
        ]
    },

    /**
     * Tests all cases where low index starts first
     */
    {
        test: "Keeps both if low index starts first without overlap.",
        input: [
            { id: "1", start: 0, end: 5, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 0 }
        ]
    },
    {
        test: "Changes low index end if low index starts first and is partially overlapped by high which ends after low.",
        input: [
            { id: "1", start: 0, end: 7, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, offsetStart: 0 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 0 }
        ]
    },
    {
        test: "Splits lower index with higher index.",
        input: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 },
            { id: "2", start: 7, end: 10, index: 2, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 7, index: 1, offsetStart: 0 },
            { id: "2", start: 7, end: 10, index: 2, offsetStart: 0 },
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 10 }
        ]
    },

    /**
     * A couple more complex test cases (several overlapping indexes, overlapped at multiple points etc.)
     */
    {
        test: "Splits lower index with higher index at multiple points taking offsets into account.",
        input: [
            { id: "1", start: 0, end: 28.5, index: 1, offsetStart: 1 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 2 },
            { id: "3", start: 20, end: 23, index: 2, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 7, index: 1, offsetStart: 1 },
            { id: "2", start: 5, end: 10, index: 2, offsetStart: 2 },
            { id: "1", start: 0, end: 20, index: 1, offsetStart: 10 },
            { id: "3", start: 20, end: 23, index: 2, offsetStart: 0 },
            { id: "1", start: 0, end: 28.5, index: 1, offsetStart: 23 }
        ]
    },
    {
        test: "Splits lower index with higher index when 3 indexes overlap.",
        input: [
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 0 },
            { id: "2", start: 10, end: 20, index: 2, offsetStart: 0 },
            { id: "3", start: 12, end: 18, index: 3, offsetStart: 0 }
        ],
        expected: [
            { id: "1", start: 0, end: 10, index: 1, offsetStart: 0 },
            { id: "2", start: 10, end: 12, index: 2, offsetStart: 0 },
            { id: "3", start: 12, end: 18, index: 3, offsetStart: 0 },
            { id: "2", start: 10, end: 20, index: 2, offsetStart: 8 },
            { id: "1", start: 0, end: 30, index: 1, offsetStart: 20 }
        ]
    },
    {
        test: "Drops lowest index when completely overlapped due to offset + splits 2 overlapping higher indexes.",
        input: [
            { id: "1", start: 0, end: 20, index: 1, offsetStart: 10 },
            { id: "2", start: 10, end: 20, index: 2, offsetStart: 0 },
            { id: "3", start: 12, end: 18, index: 3, offsetStart: 0 }
        ],
        expected: [
            { id: "2", start: 10, end: 12, index: 2, offsetStart: 0 },
            { id: "3", start: 12, end: 18, index: 3, offsetStart: 0 },
            { id: "2", start: 10, end: 20, index: 2, offsetStart: 8 }
        ]
    },
]

module.exports = testCases;