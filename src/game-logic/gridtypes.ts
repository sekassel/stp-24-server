export const GRIDS: number[][][] = [
  [
    [0,1],[0,2],
    [1,0],[1,1],[1,2],[1,3],
    [2,0],[2,1],[2,2],[2,3],
    [3,1],[3,2],
  ]
] as const;

export const GRIDS_NEW  = [
  [
    {
      vertices: [
        { id: 0, x: 1, y: 0, neighbors: [1,2,3,4] },
        { id: 1, x: 2, y: 0, neighbors: [0,3,4,5] },
        { id: 2, x: 0, y: 1, neighbors: [0,3,6,7] },
        { id: 3, x: 1, y: 1, neighbors: [0,1,2,4,6,7,8] },
        { id: 4, x: 2, y: 1, neighbors: [0,1,3,5,7,8,9] },
        { id: 5, x: 3, y: 1, neighbors: [1,4,8,9] },
        { id: 6, x: 0, y: 2, neighbors: [2,3,7,10] },
        { id: 7, x: 1, y: 2, neighbors: [2,3,4,6,8,10,11] },
        { id: 8, x: 2, y: 2, neighbors: [3,4,5,7,8,10,11] },
        { id: 9, x: 3, y: 2, neighbors: [4,5,8,11] },
        { id: 10, x: 1, y: 3, neighbors: [6,7,8,11] },
        { id: 11, x: 2, y: 3, neighbors: [7,8,9,10] },
      ],
      intersecting_edges: [
        [[0,4], [1,3]],
        [[2,7], [3,6]],
        [[3,8], [4,7]],
        [[4,9], [5,8]],
        [[7,11], [8,10]],
      ]
    },
    {
      vertices: [
        { id: 0, x: 2, y: 0, neighbors: [1,2,4] },
        { id: 1, x: 1, y: 1, neighbors: [0,2,3,4,6] },
        { id: 2, x: 3, y: 1, neighbors: [0,1,4,5,7] },
        { id: 3, x: 0, y: 2, neighbors: [1,4,6] },
        { id: 4, x: 2, y: 2, neighbors: [0,1,2,3,5,6,7,8] },
        { id: 5, x: 4, y: 2, neighbors: [2,4,7] },
        { id: 6, x: 1, y: 3, neighbors: [1,3,4,7,8] },
        { id: 7, x: 3, y: 3, neighbors: [2,4,5,6,8] },
        { id: 8, x: 2, y: 4, neighbors: [4,6,7] },
      ],
      intersecting_edges: [
        [[0,4], [1,2]],
        [[1,6], [3,4]],
        [[2,7], [4,5]],
        [[4,8], [6,7]],
      ]
    },
  ]
] as const;
