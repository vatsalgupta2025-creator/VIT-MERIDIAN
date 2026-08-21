'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AlgorithmType = 'sorting' | 'pathfinding' | 'graph' | 'bst';

interface ArrayBar {
    value: number;
    state: 'default' | 'comparing' | 'sorted' | 'pivot' | 'selected';
}

interface GridNode {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isWall: boolean;
    isVisited: boolean;
    isPath: boolean;
    distance: number;
    previous: GridNode | null;
}

interface TreeNode {
    value: number;
    left: TreeNode | null;
    right: TreeNode | null;
    x: number;
    y: number;
    highlighted: boolean;
}

interface GraphNode {
    id: number;
    x: number;
    y: number;
    visited: boolean;
    inMST: boolean;
}

interface GraphEdge {
    from: number;
    to: number;
    weight: number;
    inMST: boolean;
}

const SORTING_ALGORITHMS = [
    { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)' },
    { id: 'selection', name: 'Selection Sort', complexity: 'O(n²)' },
    { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)' },
    { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)' },
    { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)' },
    { id: 'heap', name: 'Heap Sort', complexity: 'O(n log n)' },
];

const PATHFINDING_ALGORITHMS = [
    { id: 'dijkstra', name: "Dijkstra's Algorithm" },
    { id: 'astar', name: 'A* Algorithm' },
    { id: 'bfs', name: 'Breadth-First Search' },
    { id: 'dfs', name: 'Depth-First Search' },
];

export default function VisualAlgorithms() {
    const [activeTab, setActiveTab] = useState<AlgorithmType>('sorting');
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [arraySize, setArraySize] = useState(30);

    // Sorting state
    const [array, setArray] = useState<ArrayBar[]>([]);
    const [selectedSortAlgo, setSelectedSortAlgo] = useState('bubble');
    const [sortComparisons, setSortComparisons] = useState(0);
    const [sortSwaps, setSortSwaps] = useState(0);

    // Pathfinding state
    const [grid, setGrid] = useState<GridNode[][]>([]);
    const [startNode, setStartNode] = useState({ row: 5, col: 5 });
    const [endNode, setEndNode] = useState({ row: 10, col: 20 });
    const [selectedPathAlgo, setSelectedPathAlgo] = useState('dijkstra');
    const [isDrawingWalls, setIsDrawingWalls] = useState(false);
    const [pathfindingMode, setPathfindingMode] = useState<'start' | 'end' | 'wall'>('wall');

    // BST state
    const [bstRoot, setBstRoot] = useState<TreeNode | null>(null);
    const [bstInput, setBstInput] = useState('');
    const [bstTraversal, setBstTraversal] = useState<number[]>([]);
    const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder'>('inorder');

    // Graph state
    const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
    const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
    const [selectedGraphAlgo, setSelectedGraphAlgo] = useState('prim');
    const [graphMessage, setGraphMessage] = useState('');

    const stopRef = useRef(false);

    // Initialize array for sorting
    const generateArray = useCallback(() => {
        const newArray: ArrayBar[] = [];
        for (let i = 0; i < arraySize; i++) {
            newArray.push({
                value: Math.floor(Math.random() * 100) + 5,
                state: 'default',
            });
        }
        setArray(newArray);
        setSortComparisons(0);
        setSortSwaps(0);
    }, [arraySize]);

    // Initialize grid for pathfinding
    const initializeGrid = useCallback(() => {
        const newGrid: GridNode[][] = [];
        for (let row = 0; row < 20; row++) {
            const currentRow: GridNode[] = [];
            for (let col = 0; col < 35; col++) {
                currentRow.push({
                    row,
                    col,
                    isStart: row === startNode.row && col === startNode.col,
                    isEnd: row === endNode.row && col === endNode.col,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    distance: Infinity,
                    previous: null,
                });
            }
            newGrid.push(currentRow);
        }
        setGrid(newGrid);
    }, [startNode, endNode]);

    // Initialize graph
    const initializeGraph = useCallback(() => {
        const nodes: GraphNode[] = [
            { id: 0, x: 150, y: 80, visited: false, inMST: false },
            { id: 1, x: 250, y: 50, visited: false, inMST: false },
            { id: 2, x: 350, y: 80, visited: false, inMST: false },
            { id: 3, x: 100, y: 180, visited: false, inMST: false },
            { id: 4, x: 200, y: 150, visited: false, inMST: false },
            { id: 5, x: 300, y: 180, visited: false, inMST: false },
            { id: 6, x: 400, y: 150, visited: false, inMST: false },
        ];
        const edges: GraphEdge[] = [
            { from: 0, to: 1, weight: 4, inMST: false },
            { from: 0, to: 3, weight: 2, inMST: false },
            { from: 1, to: 2, weight: 3, inMST: false },
            { from: 1, to: 4, weight: 5, inMST: false },
            { from: 2, to: 6, weight: 1, inMST: false },
            { from: 3, to: 4, weight: 6, inMST: false },
            { from: 4, to: 5, weight: 3, inMST: false },
            { from: 5, to: 6, weight: 2, inMST: false },
            { from: 1, to: 3, weight: 7, inMST: false },
            { from: 2, to: 5, weight: 4, inMST: false },
        ];
        setGraphNodes(nodes);
        setGraphEdges(edges);
        setGraphMessage('');
    }, []);

    useEffect(() => {
        generateArray();
    }, [generateArray]);

    useEffect(() => {
        initializeGrid();
    }, [initializeGrid]);

    useEffect(() => {
        initializeGraph();
    }, [initializeGraph]);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // ==================== SORTING ALGORITHMS ====================

    const bubbleSort = async () => {
        const arr = [...array];
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (stopRef.current) return;
                arr[j].state = 'comparing';
                arr[j + 1].state = 'comparing';
                setArray([...arr]);
                setSortComparisons((c) => c + 1);
                await sleep(101 - speed);

                if (arr[j].value > arr[j + 1].value) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setSortSwaps((s) => s + 1);
                }
                arr[j].state = 'default';
                arr[j + 1].state = 'default';
            }
            arr[arr.length - 1 - i].state = 'sorted';
        }
        arr[0].state = 'sorted';
        setArray([...arr]);
    };

    const selectionSort = async () => {
        const arr = [...array];
        for (let i = 0; i < arr.length - 1; i++) {
            let minIdx = i;
            arr[i].state = 'pivot';
            for (let j = i + 1; j < arr.length; j++) {
                if (stopRef.current) return;
                arr[j].state = 'comparing';
                setArray([...arr]);
                setSortComparisons((c) => c + 1);
                await sleep(101 - speed);

                if (arr[j].value < arr[minIdx].value) {
                    minIdx = j;
                }
                arr[j].state = 'default';
            }
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setSortSwaps((s) => s + 1);
            }
            arr[i].state = 'sorted';
        }
        arr[arr.length - 1].state = 'sorted';
        setArray([...arr]);
    };

    const insertionSort = async () => {
        const arr = [...array];
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            arr[i].state = 'pivot';
            setArray([...arr]);
            await sleep(101 - speed);

            while (j >= 0 && arr[j].value > key.value) {
                if (stopRef.current) return;
                arr[j].state = 'comparing';
                setArray([...arr]);
                setSortComparisons((c) => c + 1);
                await sleep(101 - speed);

                arr[j + 1] = arr[j];
                setSortSwaps((s) => s + 1);
                arr[j].state = 'default';
                j--;
            }
            arr[j + 1] = key;
            arr[j + 1].state = 'default';
        }
        arr.forEach((_, idx) => (arr[idx].state = 'sorted'));
        setArray([...arr]);
    };

    const mergeSort = async () => {
        const arr = [...array];

        const merge = async (left: number, mid: number, right: number) => {
            const leftArr = arr.slice(left, mid + 1);
            const rightArr = arr.slice(mid + 1, right + 1);
            let i = 0,
                j = 0,
                k = left;

            while (i < leftArr.length && j < rightArr.length) {
                if (stopRef.current) return;
                arr[k].state = 'comparing';
                setArray([...arr]);
                setSortComparisons((c) => c + 1);
                await sleep(101 - speed);

                if (leftArr[i].value <= rightArr[j].value) {
                    arr[k] = { ...leftArr[i], state: 'default' };
                    i++;
                } else {
                    arr[k] = { ...rightArr[j], state: 'default' };
                    j++;
                }
                setSortSwaps((s) => s + 1);
                k++;
            }

            while (i < leftArr.length) {
                if (stopRef.current) return;
                arr[k] = { ...leftArr[i], state: 'default' };
                i++;
                k++;
                setArray([...arr]);
                await sleep(101 - speed);
            }

            while (j < rightArr.length) {
                if (stopRef.current) return;
                arr[k] = { ...rightArr[j], state: 'default' };
                j++;
                k++;
                setArray([...arr]);
                await sleep(101 - speed);
            }
        };

        const sort = async (left: number, right: number) => {
            if (left < right) {
                const mid = Math.floor((left + right) / 2);
                await sort(left, mid);
                await sort(mid + 1, right);
                await merge(left, mid, right);
            }
        };

        await sort(0, arr.length - 1);
        arr.forEach((_, idx) => (arr[idx].state = 'sorted'));
        setArray([...arr]);
    };

    const quickSort = async () => {
        const arr = [...array];

        const partition = async (low: number, high: number): Promise<number> => {
            const pivot = arr[high].value;
            arr[high].state = 'pivot';
            let i = low - 1;

            for (let j = low; j < high; j++) {
                if (stopRef.current) return -1;
                arr[j].state = 'comparing';
                setArray([...arr]);
                setSortComparisons((c) => c + 1);
                await sleep(101 - speed);

                if (arr[j].value < pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    setSortSwaps((s) => s + 1);
                }
                arr[j].state = 'default';
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            setSortSwaps((s) => s + 1);
            arr[i + 1].state = 'sorted';
            setArray([...arr]);
            return i + 1;
        };

        const sort = async (low: number, high: number) => {
            if (low < high) {
                const pi = await partition(low, high);
                if (pi === -1) return;
                await sort(low, pi - 1);
                await sort(pi + 1, high);
            }
        };

        await sort(0, arr.length - 1);
        arr.forEach((_, idx) => (arr[idx].state = 'sorted'));
        setArray([...arr]);
    };

    const heapSort = async () => {
        const arr = [...array];

        const heapify = async (n: number, i: number) => {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n) {
                setSortComparisons((c) => c + 1);
                if (arr[left].value > arr[largest].value) {
                    largest = left;
                }
            }

            if (right < n) {
                setSortComparisons((c) => c + 1);
                if (arr[right].value > arr[largest].value) {
                    largest = right;
                }
            }

            if (largest !== i) {
                if (stopRef.current) return;
                arr[i].state = 'comparing';
                arr[largest].state = 'comparing';
                setArray([...arr]);
                await sleep(101 - speed);

                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                setSortSwaps((s) => s + 1);
                arr[i].state = 'default';
                arr[largest].state = 'default';
                setArray([...arr]);

                await heapify(n, largest);
            }
        };

        // Build max heap
        for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
            await heapify(arr.length, i);
        }

        // Extract elements
        for (let i = arr.length - 1; i > 0; i--) {
            if (stopRef.current) return;
            [arr[0], arr[i]] = [arr[i], arr[0]];
            setSortSwaps((s) => s + 1);
            arr[i].state = 'sorted';
            setArray([...arr]);
            await heapify(i, 0);
        }
        arr[0].state = 'sorted';
        setArray([...arr]);
    };

    const runSortingAlgorithm = async () => {
        setIsRunning(true);
        stopRef.current = false;

        switch (selectedSortAlgo) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'merge':
                await mergeSort();
                break;
            case 'quick':
                await quickSort();
                break;
            case 'heap':
                await heapSort();
                break;
        }

        setIsRunning(false);
    };

    // ==================== PATHFINDING ALGORITHMS ====================

    const getUnvisitedNeighbors = (node: GridNode, grid: GridNode[][]): GridNode[] => {
        const neighbors: GridNode[] = [];
        const { row, col } = node;
        if (row > 0) neighbors.push(grid[row - 1][col]);
        if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
        if (col > 0) neighbors.push(grid[row][col - 1]);
        if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
        return neighbors.filter((n) => !n.isWall && !n.isVisited);
    };

    const dijkstra = async () => {
        const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
        const start = newGrid[startNode.row][startNode.col];
        start.distance = 0;
        const unvisited: GridNode[] = [];
        newGrid.forEach((row) => row.forEach((node) => unvisited.push(node)));

        while (unvisited.length > 0) {
            if (stopRef.current) return;
            unvisited.sort((a, b) => a.distance - b.distance);
            const current = unvisited.shift()!;

            if (current.distance === Infinity) break;
            if (current.isEnd) break;

            current.isVisited = true;
            setGrid([...newGrid]);
            await sleep(11 - speed / 10);

            const neighbors = getUnvisitedNeighbors(current, newGrid);
            for (const neighbor of neighbors) {
                const newDist = current.distance + 1;
                if (newDist < neighbor.distance) {
                    neighbor.distance = newDist;
                    neighbor.previous = current;
                }
            }
        }

        // Reconstruct path
        let current = newGrid[endNode.row][endNode.col];
        while (current.previous) {
            if (stopRef.current) return;
            current.isPath = true;
            setGrid([...newGrid]);
            await sleep(20);
            current = current.previous;
        }
    };

    const astar = async () => {
        const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
        const start = newGrid[startNode.row][startNode.col];
        const end = newGrid[endNode.row][endNode.col];

        const heuristic = (a: GridNode, b: GridNode) =>
            Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

        start.distance = 0;
        const openSet: GridNode[] = [start];
        const closedSet = new Set<GridNode>();

        while (openSet.length > 0) {
            if (stopRef.current) return;
            openSet.sort((a, b) => a.distance + heuristic(a, end) - (b.distance + heuristic(b, end)));
            const current = openSet.shift()!;

            if (current === end) break;

            closedSet.add(current);
            current.isVisited = true;
            setGrid([...newGrid]);
            await sleep(11 - speed / 10);

            const neighbors = getUnvisitedNeighbors(current, newGrid);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                const newDist = current.distance + 1;
                if (newDist < neighbor.distance) {
                    neighbor.distance = newDist;
                    neighbor.previous = current;
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // Reconstruct path
        let current = newGrid[endNode.row][endNode.col];
        while (current.previous) {
            if (stopRef.current) return;
            current.isPath = true;
            setGrid([...newGrid]);
            await sleep(20);
            current = current.previous;
        }
    };

    const bfs = async () => {
        const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
        const start = newGrid[startNode.row][startNode.col];
        const queue: GridNode[] = [start];
        start.isVisited = true;

        while (queue.length > 0) {
            if (stopRef.current) return;
            const current = queue.shift()!;

            if (current.isEnd) break;

            setGrid([...newGrid]);
            await sleep(11 - speed / 10);

            const neighbors = getUnvisitedNeighbors(current, newGrid);
            for (const neighbor of neighbors) {
                neighbor.isVisited = true;
                neighbor.previous = current;
                queue.push(neighbor);
            }
        }

        // Reconstruct path
        let current = newGrid[endNode.row][endNode.col];
        while (current.previous) {
            if (stopRef.current) return;
            current.isPath = true;
            setGrid([...newGrid]);
            await sleep(20);
            current = current.previous;
        }
    };

    const dfs = async () => {
        const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
        const start = newGrid[startNode.row][startNode.col];
        const stack: GridNode[] = [start];

        while (stack.length > 0) {
            if (stopRef.current) return;
            const current = stack.pop()!;

            if (current.isVisited) continue;
            current.isVisited = true;

            if (current.isEnd) break;

            setGrid([...newGrid]);
            await sleep(11 - speed / 10);

            const neighbors = getUnvisitedNeighbors(current, newGrid);
            for (const neighbor of neighbors) {
                neighbor.previous = current;
                stack.push(neighbor);
            }
        }

        // Reconstruct path
        let current = newGrid[endNode.row][endNode.col];
        while (current.previous) {
            if (stopRef.current) return;
            current.isPath = true;
            setGrid([...newGrid]);
            await sleep(20);
            current = current.previous;
        }
    };

    const runPathfindingAlgorithm = async () => {
        setIsRunning(true);
        stopRef.current = false;

        // Reset grid
        const newGrid = grid.map((row) =>
            row.map((node) => ({
                ...node,
                isVisited: false,
                isPath: false,
                distance: Infinity,
                previous: null,
            }))
        );
        setGrid(newGrid);

        switch (selectedPathAlgo) {
            case 'dijkstra':
                await dijkstra();
                break;
            case 'astar':
                await astar();
                break;
            case 'bfs':
                await bfs();
                break;
            case 'dfs':
                await dfs();
                break;
        }

        setIsRunning(false);
    };

    const handleGridClick = (row: number, col: number) => {
        if (isRunning) return;
        const newGrid = grid.map((r) => r.map((n) => ({ ...n })));

        if (pathfindingMode === 'start') {
            newGrid[startNode.row][startNode.col].isStart = false;
            newGrid[row][col].isStart = true;
            setStartNode({ row, col });
        } else if (pathfindingMode === 'end') {
            newGrid[endNode.row][endNode.col].isEnd = false;
            newGrid[row][col].isEnd = true;
            setEndNode({ row, col });
        } else {
            if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
                newGrid[row][col].isWall = !newGrid[row][col].isWall;
            }
        }
        setGrid(newGrid);
    };

    const handleGridMouseDown = (row: number, col: number) => {
        if (pathfindingMode === 'wall') {
            setIsDrawingWalls(true);
            handleGridClick(row, col);
        }
    };

    const handleGridMouseEnter = (row: number, col: number) => {
        if (isDrawingWalls && pathfindingMode === 'wall') {
            handleGridClick(row, col);
        }
    };

    const handleGridMouseUp = () => {
        setIsDrawingWalls(false);
    };

    // ==================== BST OPERATIONS ====================

    const insertBST = (root: TreeNode | null, value: number, x: number, y: number, level: number): TreeNode => {
        if (!root) {
            return { value, left: null, right: null, x, y, highlighted: false };
        }

        const offsetX = 150 / (level + 1);
        if (value < root.value) {
            root.left = insertBST(root.left, value, root.x - offsetX, root.y + 60, level + 1);
        } else {
            root.right = insertBST(root.right, value, root.x + offsetX, root.y + 60, level + 1);
        }
        return root;
    };

    const addBSTNode = () => {
        const value = parseInt(bstInput);
        if (isNaN(value)) return;
        const newRoot = insertBST(bstRoot, value, 300, 50, 0);
        setBstRoot({ ...newRoot });
        setBstInput('');
    };

    const inorderTraversal = async (node: TreeNode | null, result: number[]) => {
        if (!node || stopRef.current) return;
        await inorderTraversal(node.left, result);
        node.highlighted = true;
        setBstRoot({ ...bstRoot! });
        result.push(node.value);
        setBstTraversal([...result]);
        await sleep(500);
        node.highlighted = false;
        await inorderTraversal(node.right, result);
    };

    const preorderTraversal = async (node: TreeNode | null, result: number[]) => {
        if (!node || stopRef.current) return;
        node.highlighted = true;
        setBstRoot({ ...bstRoot! });
        result.push(node.value);
        setBstTraversal([...result]);
        await sleep(500);
        node.highlighted = false;
        await preorderTraversal(node.left, result);
        await preorderTraversal(node.right, result);
    };

    const postorderTraversal = async (node: TreeNode | null, result: number[]) => {
        if (!node || stopRef.current) return;
        await postorderTraversal(node.left, result);
        await postorderTraversal(node.right, result);
        node.highlighted = true;
        setBstRoot({ ...bstRoot! });
        result.push(node.value);
        setBstTraversal([...result]);
        await sleep(500);
        node.highlighted = false;
    };

    const runBSTTraversal = async () => {
        if (!bstRoot) return;
        setIsRunning(true);
        stopRef.current = false;
        setBstTraversal([]);

        switch (traversalType) {
            case 'inorder':
                await inorderTraversal(bstRoot, []);
                break;
            case 'preorder':
                await preorderTraversal(bstRoot, []);
                break;
            case 'postorder':
                await postorderTraversal(bstRoot, []);
                break;
        }

        setIsRunning(false);
    };

    const renderBST = (node: TreeNode | null, parentX?: number, parentY?: number) => {
        if (!node) return null;

        return (
            <g key={node.value}>
                {parentX !== undefined && parentY !== undefined && (
                    <line
                        x1={parentX}
                        y1={parentY}
                        x2={node.x}
                        y2={node.y}
                        stroke={node.highlighted ? '#22d3ee' : '#4b5563'}
                        strokeWidth={2}
                    />
                )}
                <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill={node.highlighted ? '#22d3ee' : '#1e293b'}
                    stroke={node.highlighted ? '#22d3ee' : '#6366f1'}
                    strokeWidth={2}
                    animate={{ scale: node.highlighted ? 1.2 : 1 }}
                />
                <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize={12}
                    fontWeight="bold"
                >
                    {node.value}
                </text>
                {renderBST(node.left, node.x, node.y)}
                {renderBST(node.right, node.x, node.y)}
            </g>
        );
    };

    // ==================== GRAPH ALGORITHMS ====================

    const primMST = async () => {
        setIsRunning(true);
        stopRef.current = false;
        setGraphMessage('Starting Prim\'s Algorithm...');

        const nodes = graphNodes.map((n) => ({ ...n, visited: false, inMST: false }));
        const edges = graphEdges.map((e) => ({ ...e, inMST: false }));
        nodes[0].inMST = true;
        setGraphNodes([...nodes]);
        await sleep(500);

        for (let i = 0; i < nodes.length - 1; i++) {
            if (stopRef.current) break;

            let minEdge: GraphEdge | null = null;
            let minWeight = Infinity;

            for (const edge of edges) {
                const fromInMST = nodes[edge.from].inMST;
                const toInMST = nodes[edge.to].inMST;

                if ((fromInMST && !toInMST) || (!fromInMST && toInMST)) {
                    if (edge.weight < minWeight) {
                        minWeight = edge.weight;
                        minEdge = edge;
                    }
                }
            }

            if (minEdge) {
                minEdge.inMST = true;
                nodes[minEdge.from].inMST = true;
                nodes[minEdge.to].inMST = true;
                setGraphEdges([...edges]);
                setGraphNodes([...nodes]);
                setGraphMessage(`Added edge ${minEdge.from}-${minEdge.to} with weight ${minEdge.weight}`);
                await sleep(800);
            }
        }

        setGraphMessage('MST Complete!');
        setIsRunning(false);
    };

    const kruskalMST = async () => {
        setIsRunning(true);
        stopRef.current = false;
        setGraphMessage('Starting Kruskal\'s Algorithm...');

        const nodes = graphNodes.map((n) => ({ ...n, inMST: false }));
        const edges = graphEdges.map((e) => ({ ...e, inMST: false }));
        const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

        const parent: number[] = nodes.map((_, i) => i);
        const find = (x: number): number => (parent[x] === x ? x : find(parent[x]));
        const union = (x: number, y: number) => {
            const px = find(x);
            const py = find(y);
            parent[px] = py;
        };

        for (const edge of sortedEdges) {
            if (stopRef.current) break;

            const px = find(edge.from);
            const py = find(edge.to);

            if (px !== py) {
                edge.inMST = true;
                nodes[edge.from].inMST = true;
                nodes[edge.to].inMST = true;
                union(edge.from, edge.to);
                setGraphEdges([...edges]);
                setGraphNodes([...nodes]);
                setGraphMessage(`Added edge ${edge.from}-${edge.to} with weight ${edge.weight}`);
                await sleep(800);
            }
        }

        setGraphMessage('MST Complete!');
        setIsRunning(false);
    };

    const runGraphAlgorithm = async () => {
        if (selectedGraphAlgo === 'prim') {
            await primMST();
        } else {
            await kruskalMST();
        }
    };

    const stopAlgorithm = () => {
        stopRef.current = true;
        setIsRunning(false);
    };

    // ==================== RENDER ====================

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white/90">Visual Algorithms</h2>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-white/60">Speed:</label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-32 accent-cyan-500"
                    />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                {[
                    { id: 'sorting', label: 'Sorting', icon: '📊' },
                    { id: 'pathfinding', label: 'Pathfinding', icon: '🗺️' },
                    { id: 'graph', label: 'Graph', icon: '🔗' },
                    { id: 'bst', label: 'BST', icon: '🌳' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AlgorithmType)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white border border-white/10'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* SORTING TAB */}
                {activeTab === 'sorting' && (
                    <motion.div
                        key="sorting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-wrap gap-3 items-center">
                            <select
                                value={selectedSortAlgo}
                                onChange={(e) => setSelectedSortAlgo(e.target.value)}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80"
                            >
                                {SORTING_ALGORITHMS.map((algo) => (
                                    <option key={algo.id} value={algo.id}>
                                        {algo.name} ({algo.complexity})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={arraySize}
                                onChange={(e) => setArraySize(parseInt(e.target.value))}
                                className="w-24 accent-cyan-500"
                                disabled={isRunning}
                            />
                            <span className="text-sm text-white/60">Size: {arraySize}</span>
                            <button
                                onClick={generateArray}
                                disabled={isRunning}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                🔄 New Array
                            </button>
                            {isRunning ? (
                                <button
                                    onClick={stopAlgorithm}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                    ⏹ Stop
                                </button>
                            ) : (
                                <button
                                    onClick={runSortingAlgorithm}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                                >
                                    ▶ Run
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4 text-sm">
                            <span className="text-white/60">Comparisons: <span className="text-cyan-400">{sortComparisons}</span></span>
                            <span className="text-white/60">Swaps: <span className="text-violet-400">{sortSwaps}</span></span>
                        </div>

                        <div className="h-64 flex items-end justify-center gap-[2px] bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                            {array.map((bar, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`w-full rounded-t transition-colors ${bar.state === 'comparing'
                                            ? 'bg-yellow-400'
                                            : bar.state === 'sorted'
                                                ? 'bg-emerald-400'
                                                : bar.state === 'pivot'
                                                    ? 'bg-pink-400'
                                                    : 'bg-gradient-to-t from-violet-500 to-cyan-500'
                                        }`}
                                    style={{ height: `${bar.value * 2}px`, minWidth: `${Math.max(2, 600 / arraySize)}px` }}
                                    animate={{ height: `${bar.value * 2}px` }}
                                    transition={{ duration: 0.1 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* PATHFINDING TAB */}
                {activeTab === 'pathfinding' && (
                    <motion.div
                        key="pathfinding"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-wrap gap-3 items-center">
                            <select
                                value={selectedPathAlgo}
                                onChange={(e) => setSelectedPathAlgo(e.target.value)}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80"
                            >
                                {PATHFINDING_ALGORITHMS.map((algo) => (
                                    <option key={algo.id} value={algo.id}>
                                        {algo.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                {(['wall', 'start', 'end'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPathfindingMode(mode)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${pathfindingMode === mode
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                : 'bg-white/[0.05] text-white/60 border border-white/10'
                                            }`}
                                    >
                                        {mode === 'wall' ? '🧱 Wall' : mode === 'start' ? '🟢 Start' : '🔴 End'}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={initializeGrid}
                                disabled={isRunning}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                🔄 Clear
                            </button>
                            {isRunning ? (
                                <button
                                    onClick={stopAlgorithm}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                    ⏹ Stop
                                </button>
                            ) : (
                                <button
                                    onClick={runPathfindingAlgorithm}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                                >
                                    ▶ Run
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-emerald-400"></div>
                                <span className="text-white/60">Start</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-red-400"></div>
                                <span className="text-white/60">End</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-slate-600"></div>
                                <span className="text-white/60">Wall</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-cyan-400/50"></div>
                                <span className="text-white/60">Visited</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                                <span className="text-white/60">Path</span>
                            </span>
                        </div>

                        <div
                            className="inline-block bg-white/[0.02] rounded-xl p-2 border border-white/[0.06]"
                            onMouseUp={handleGridMouseUp}
                            onMouseLeave={handleGridMouseUp}
                        >
                            {grid.map((row, rowIdx) => (
                                <div key={rowIdx} className="flex">
                                    {row.map((node, colIdx) => (
                                        <div
                                            key={colIdx}
                                            className={`w-5 h-5 border border-white/[0.03] cursor-pointer transition-colors ${node.isStart
                                                    ? 'bg-emerald-400'
                                                    : node.isEnd
                                                        ? 'bg-red-400'
                                                        : node.isWall
                                                            ? 'bg-slate-600'
                                                            : node.isPath
                                                                ? 'bg-yellow-400'
                                                                : node.isVisited
                                                                    ? 'bg-cyan-400/50'
                                                                    : 'bg-white/[0.02] hover:bg-white/[0.08]'
                                                }`}
                                            onMouseDown={() => handleGridMouseDown(rowIdx, colIdx)}
                                            onMouseEnter={() => handleGridMouseEnter(rowIdx, colIdx)}
                                            onClick={() => handleGridClick(rowIdx, colIdx)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* GRAPH TAB */}
                {activeTab === 'graph' && (
                    <motion.div
                        key="graph"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-wrap gap-3 items-center">
                            <select
                                value={selectedGraphAlgo}
                                onChange={(e) => setSelectedGraphAlgo(e.target.value)}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80"
                            >
                                <option value="prim">Prim's MST</option>
                                <option value="kruskal">Kruskal's MST</option>
                            </select>
                            <button
                                onClick={initializeGraph}
                                disabled={isRunning}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                🔄 Reset
                            </button>
                            {isRunning ? (
                                <button
                                    onClick={stopAlgorithm}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                    ⏹ Stop
                                </button>
                            ) : (
                                <button
                                    onClick={runGraphAlgorithm}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                                >
                                    ▶ Run
                                </button>
                            )}
                        </div>

                        {graphMessage && (
                            <div className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-cyan-400 text-sm">
                                {graphMessage}
                            </div>
                        )}

                        <div className="h-64 bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                            <svg width="100%" height="100%" viewBox="0 0 500 250">
                                {/* Edges */}
                                {graphEdges.map((edge, idx) => {
                                    const from = graphNodes[edge.from];
                                    const to = graphNodes[edge.to];
                                    return (
                                        <g key={idx}>
                                            <line
                                                x1={from.x}
                                                y1={from.y}
                                                x2={to.x}
                                                y2={to.y}
                                                stroke={edge.inMST ? '#22d3ee' : '#4b5563'}
                                                strokeWidth={edge.inMST ? 3 : 1}
                                            />
                                            <text
                                                x={(from.x + to.x) / 2}
                                                y={(from.y + to.y) / 2 - 5}
                                                fill={edge.inMST ? '#22d3ee' : '#9ca3af'}
                                                fontSize={10}
                                                textAnchor="middle"
                                            >
                                                {edge.weight}
                                            </text>
                                        </g>
                                    );
                                })}
                                {/* Nodes */}
                                {graphNodes.map((node) => (
                                    <g key={node.id}>
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={20}
                                            fill={node.inMST ? '#0e7490' : '#1e293b'}
                                            stroke={node.inMST ? '#22d3ee' : '#6366f1'}
                                            strokeWidth={2}
                                            animate={{ scale: node.inMST ? 1.1 : 1 }}
                                        />
                                        <text
                                            x={node.x}
                                            y={node.y}
                                            textAnchor="middle"
                                            dy=".3em"
                                            fill="white"
                                            fontSize={14}
                                            fontWeight="bold"
                                        >
                                            {node.id}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </motion.div>
                )}

                {/* BST TAB */}
                {activeTab === 'bst' && (
                    <motion.div
                        key="bst"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-wrap gap-3 items-center">
                            <input
                                type="number"
                                value={bstInput}
                                onChange={(e) => setBstInput(e.target.value)}
                                placeholder="Enter value"
                                className="px-4 py-2 w-32 bg-white/[0.05] border border-white/10 rounded-lg text-white/80"
                                disabled={isRunning}
                            />
                            <button
                                onClick={addBSTNode}
                                disabled={isRunning || !bstInput}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                ➕ Add Node
                            </button>
                            <select
                                value={traversalType}
                                onChange={(e) => setTraversalType(e.target.value as typeof traversalType)}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80"
                            >
                                <option value="inorder">Inorder</option>
                                <option value="preorder">Preorder</option>
                                <option value="postorder">Postorder</option>
                            </select>
                            {isRunning ? (
                                <button
                                    onClick={stopAlgorithm}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                    ⏹ Stop
                                </button>
                            ) : (
                                <button
                                    onClick={runBSTTraversal}
                                    disabled={!bstRoot}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    ▶ Traverse
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setBstRoot(null);
                                    setBstTraversal([]);
                                }}
                                disabled={isRunning}
                                className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                🗑️ Clear
                            </button>
                        </div>

                        {bstTraversal.length > 0 && (
                            <div className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg">
                                <span className="text-white/60">Traversal: </span>
                                <span className="text-cyan-400">{bstTraversal.join(' → ')}</span>
                            </div>
                        )}

                        <div className="h-64 bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] overflow-auto">
                            {bstRoot ? (
                                <svg width="100%" height="100%" viewBox="0 0 600 300">
                                    {renderBST(bstRoot)}
                                </svg>
                            ) : (
                                <div className="h-full flex items-center justify-center text-white/40">
                                    Add nodes to build the tree
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}