// ============================================================
// SYNAPSE Learning Hub — Mock Data
// ============================================================

import { Course, Quiz, LeaderboardEntry, RewardBadge, UserProgress } from '@/types/learning';

export const mockCourses: Course[] = [
    {
        id: 'course-1',
        title: 'Data Structures & Algorithms Masterclass',
        description: 'Master DSA concepts from basics to advanced. Learn arrays, linked lists, trees, graphs, dynamic programming, and more with hands-on coding examples.',
        thumbnail: 'https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
        instructor: 'Dr. Abdul Bari',
        category: 'Computer Science',
        difficulty: 'Intermediate',
        totalVideos: 45,
        totalDuration: '32h 15m',
        enrolledCount: 15420,
        rating: 4.9,
        videos: [
            {
                id: 'RBSGKlAvoiM',
                title: 'Introduction to Data Structures',
                description: 'Learn the fundamentals of data structures and why they are important in computer science.',
                thumbnail: 'https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
                channelTitle: 'Abdul Bari',
                channelId: 'UCZCFT11CWBi3MHNlGf019nw',
                publishedAt: '2023-01-15T10:00:00Z',
                duration: 'PT45M30S',
                viewCount: 1250000,
                likeCount: 45000,
            },
            {
                id: 'JgZQkS7_3gg',
                title: 'Arrays - Complete Guide',
                description: 'Deep dive into arrays, memory representation, and operations.',
                thumbnail: 'https://i.ytimg.com/vi/JgZQkS7_3gg/maxresdefault.jpg',
                channelTitle: 'Abdul Bari',
                channelId: 'UCZCFT11CWBi3MHNlGf019nw',
                publishedAt: '2023-01-20T10:00:00Z',
                duration: 'PT1H15M',
                viewCount: 980000,
                likeCount: 38000,
            },
        ],
    },
    {
        id: 'course-2',
        title: 'React - Complete Guide 2024',
        description: 'Learn React from scratch. Build modern web applications with React 18, hooks, context, Redux, and Next.js.',
        thumbnail: 'https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg',
        instructor: 'Maximilian Schwarzmüller',
        category: 'Web Development',
        difficulty: 'Beginner',
        totalVideos: 120,
        totalDuration: '48h 30m',
        enrolledCount: 28500,
        rating: 4.8,
        videos: [
            {
                id: 'bMknfKXIFA8',
                title: 'React Basics - Getting Started',
                description: 'Introduction to React, JSX, and components.',
                thumbnail: 'https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg',
                channelTitle: 'Academind',
                channelId: 'UCSJbGtTlrDami-tDGPUV9-w',
                publishedAt: '2023-06-01T08:00:00Z',
                duration: 'PT2H10M',
                viewCount: 2100000,
                likeCount: 72000,
            },
        ],
    },
    {
        id: 'course-3',
        title: 'Machine Learning A-Z',
        description: 'Master Machine Learning with Python. Learn supervised, unsupervised learning, deep learning, and practical projects.',
        thumbnail: 'https://i.ytimg.com/vi/ukzFI9rgwfU/maxresdefault.jpg',
        instructor: 'Andrew Ng',
        category: 'Machine Learning',
        difficulty: 'Advanced',
        totalVideos: 85,
        totalDuration: '56h 45m',
        enrolledCount: 42300,
        rating: 4.9,
        videos: [
            {
                id: 'ukzFI9rgwfU',
                title: 'What is Machine Learning?',
                description: 'Introduction to Machine Learning concepts and applications.',
                thumbnail: 'https://i.ytimg.com/vi/ukzFI9rgwfU/maxresdefault.jpg',
                channelTitle: 'Stanford',
                channelId: 'UC-EnprmTZC_hBkQKtMk6XZg',
                publishedAt: '2022-09-15T12:00:00Z',
                duration: 'PT55M',
                viewCount: 3200000,
                likeCount: 95000,
            },
        ],
    },
    {
        id: 'course-4',
        title: 'Python for Beginners',
        description: 'Start your programming journey with Python. Learn syntax, data types, functions, OOP, and build real projects.',
        thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
        instructor: 'Programming with Mosh',
        category: 'Computer Science',
        difficulty: 'Beginner',
        totalVideos: 35,
        totalDuration: '12h 20m',
        enrolledCount: 67800,
        rating: 4.7,
        videos: [
            {
                id: 'rfscVS0vtbw',
                title: 'Python Tutorial - Full Course',
                description: 'Complete Python tutorial for absolute beginners.',
                thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
                channelTitle: 'freeCodeCamp',
                channelId: 'UC8butISFssTIElRVOmh-0Og',
                publishedAt: '2023-03-10T14:00:00Z',
                duration: 'PT4H26M',
                viewCount: 15000000,
                likeCount: 320000,
            },
        ],
    },
    {
        id: 'course-5',
        title: 'System Design Interview Prep',
        description: 'Prepare for system design interviews. Learn to design scalable systems like Netflix, Uber, Twitter.',
        thumbnail: 'https://i.ytimg.com/vi/i7twT3U2_XQ/maxresdefault.jpg',
        instructor: 'Gaurav Sen',
        category: 'Computer Science',
        difficulty: 'Advanced',
        totalVideos: 50,
        totalDuration: '28h 10m',
        enrolledCount: 31200,
        rating: 4.8,
        videos: [
            {
                id: 'i7twT3U2_XQ',
                title: 'System Design Basics',
                description: 'Learn the fundamentals of system design interviews.',
                thumbnail: 'https://i.ytimg.com/vi/i7twT3U2_XQ/maxresdefault.jpg',
                channelTitle: 'Gaurav Sen',
                channelId: 'UCRPMAqdtSgd0Ipeef7iFsKw',
                publishedAt: '2023-02-20T09:00:00Z',
                duration: 'PT38M',
                viewCount: 890000,
                likeCount: 28000,
            },
        ],
    },
    {
        id: 'course-6',
        title: 'Node.js Full Stack Development',
        description: 'Build full-stack applications with Node.js, Express, MongoDB. Learn REST APIs, authentication, and deployment.',
        thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/maxresdefault.jpg',
        instructor: 'Net Ninja',
        category: 'Web Development',
        difficulty: 'Intermediate',
        totalVideos: 75,
        totalDuration: '35h 50m',
        enrolledCount: 22400,
        rating: 4.7,
        videos: [
            {
                id: 'Oe421EPjeBE',
                title: 'Node.js Crash Course',
                description: 'Complete Node.js tutorial for beginners.',
                thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/maxresdefault.jpg',
                channelTitle: 'Net Ninja',
                channelId: 'UCW5YeuERM1n6sQQq4PnhA7Q',
                publishedAt: '2023-04-05T11:00:00Z',
                duration: 'PT1H45M',
                viewCount: 750000,
                likeCount: 22000,
            },
        ],
    },
];

export const mockQuizzes: Quiz[] = [
    {
        id: 'quiz-1',
        videoId: 'RBSGKlAvoiM',
        courseId: 'course-1',
        title: 'Data Structures Fundamentals Quiz',
        timeLimit: 10,
        passingScore: 70,
        rewardPoints: 50,
        questions: [
            {
                id: 'q1-1',
                question: 'What is the time complexity of accessing an element in an array by index?',
                options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                correctAnswer: 0,
                explanation: 'Arrays provide constant time O(1) access to elements by index because the memory address can be calculated directly.',
            },
            {
                id: 'q1-2',
                question: 'Which data structure uses LIFO (Last In First Out) principle?',
                options: ['Queue', 'Stack', 'Linked List', 'Tree'],
                correctAnswer: 1,
                explanation: 'Stack follows LIFO principle - the last element pushed is the first one to be popped.',
            },
            {
                id: 'q1-3',
                question: 'What is the worst-case time complexity of searching in a binary search tree?',
                options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
                correctAnswer: 2,
                explanation: 'In the worst case (skewed tree), BST search becomes O(n) as we might need to visit all nodes.',
            },
            {
                id: 'q1-4',
                question: 'Which of the following is NOT a linear data structure?',
                options: ['Array', 'Stack', 'Tree', 'Queue'],
                correctAnswer: 2,
                explanation: 'Tree is a hierarchical (non-linear) data structure, while arrays, stacks, and queues are linear.',
            },
            {
                id: 'q1-5',
                question: 'What is the space complexity of a recursive function that makes n recursive calls?',
                options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
                correctAnswer: 1,
                explanation: 'Each recursive call adds a new frame to the call stack, resulting in O(n) space complexity.',
            },
        ],
    },
    {
        id: 'quiz-2',
        videoId: 'bMknfKXIFA8',
        courseId: 'course-2',
        title: 'React Fundamentals Quiz',
        timeLimit: 15,
        passingScore: 70,
        rewardPoints: 75,
        questions: [
            {
                id: 'q2-1',
                question: 'What is JSX?',
                options: [
                    'A JavaScript library',
                    'A syntax extension for JavaScript',
                    'A CSS framework',
                    'A database query language',
                ],
                correctAnswer: 1,
                explanation: 'JSX is a syntax extension for JavaScript that allows writing HTML-like code in React.',
            },
            {
                id: 'q2-2',
                question: 'Which hook is used for side effects in React?',
                options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                correctAnswer: 1,
                explanation: 'useEffect is the hook used to perform side effects in functional components.',
            },
            {
                id: 'q2-3',
                question: 'What is the purpose of the virtual DOM?',
                options: [
                    'To store data permanently',
                    'To improve performance by minimizing DOM manipulations',
                    'To handle routing',
                    'To manage state',
                ],
                correctAnswer: 1,
                explanation: 'Virtual DOM is a lightweight copy of the real DOM that React uses to optimize updates.',
            },
            {
                id: 'q2-4',
                question: 'How do you pass data from parent to child component?',
                options: ['Using state', 'Using props', 'Using context', 'Using refs'],
                correctAnswer: 1,
                explanation: 'Props (properties) are used to pass data from parent to child components in React.',
            },
        ],
    },
    {
        id: 'quiz-3',
        videoId: 'ukzFI9rgwfU',
        courseId: 'course-3',
        title: 'Machine Learning Basics Quiz',
        timeLimit: 12,
        passingScore: 70,
        rewardPoints: 100,
        questions: [
            {
                id: 'q3-1',
                question: 'What type of learning uses labeled data?',
                options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
                correctAnswer: 1,
                explanation: 'Supervised learning uses labeled data to train models to make predictions.',
            },
            {
                id: 'q3-2',
                question: 'Which algorithm is commonly used for classification?',
                options: ['K-Means', 'Linear Regression', 'Decision Tree', 'PCA'],
                correctAnswer: 2,
                explanation: 'Decision Tree is a classification algorithm, while K-Means and PCA are unsupervised.',
            },
            {
                id: 'q3-3',
                question: 'What is overfitting?',
                options: [
                    'Model performs well on training data but poorly on new data',
                    'Model performs poorly on all data',
                    'Model is too simple',
                    'Model trains too slowly',
                ],
                correctAnswer: 0,
                explanation: 'Overfitting occurs when a model learns training data too well, including noise, and fails to generalize.',
            },
        ],
    },
];

export const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'user-1', userName: 'Priya Sharma', avatar: 'PS', totalPoints: 4850, videosWatched: 89, quizzesCompleted: 42, streak: 15, badge: '🏆 Champion' },
    { rank: 2, userId: 'user-2', userName: 'Rahul Kumar', avatar: 'RK', totalPoints: 4620, videosWatched: 82, quizzesCompleted: 38, streak: 12, badge: '🥇 Expert' },
    { rank: 3, userId: 'user-3', userName: 'Ananya Singh', avatar: 'AS', totalPoints: 4180, videosWatched: 76, quizzesCompleted: 35, streak: 10, badge: '🥈 Advanced' },
    { rank: 4, userId: 'user-4', userName: 'Vikram Patel', avatar: 'VP', totalPoints: 3950, videosWatched: 71, quizzesCompleted: 32, streak: 8, badge: '🥉 Intermediate' },
    { rank: 5, userId: 'user-5', userName: 'Neha Gupta', avatar: 'NG', totalPoints: 3720, videosWatched: 68, quizzesCompleted: 30, streak: 7 },
    { rank: 6, userId: 'user-6', userName: 'Arjun Reddy', avatar: 'AR', totalPoints: 3480, videosWatched: 63, quizzesCompleted: 28, streak: 5 },
    { rank: 7, userId: 'user-7', userName: 'Sneha Verma', avatar: 'SV', totalPoints: 3210, videosWatched: 58, quizzesCompleted: 25, streak: 4 },
    { rank: 8, userId: 'user-8', userName: 'Karan Mehta', avatar: 'KM', totalPoints: 2950, videosWatched: 54, quizzesCompleted: 22, streak: 3 },
    { rank: 9, userId: 'user-9', userName: 'Divya Nair', avatar: 'DN', totalPoints: 2680, videosWatched: 49, quizzesCompleted: 20, streak: 2 },
    { rank: 10, userId: 'user-10', userName: 'Rohan Joshi', avatar: 'RJ', totalPoints: 2420, videosWatched: 45, quizzesCompleted: 18, streak: 1 },
];

export const mockBadges: RewardBadge[] = [
    { id: 'badge-1', name: 'First Steps', description: 'Complete your first video', icon: '🎯', pointsRequired: 10 },
    { id: 'badge-2', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '📝', pointsRequired: 100 },
    { id: 'badge-3', name: 'Dedicated Learner', description: 'Watch 50 videos', icon: '📚', pointsRequired: 500 },
    { id: 'badge-4', name: 'Streak Champion', description: 'Maintain a 7-day streak', icon: '🔥', pointsRequired: 200 },
    { id: 'badge-5', name: 'Knowledge Seeker', description: 'Earn 1000 points', icon: '⭐', pointsRequired: 1000 },
    { id: 'badge-6', name: 'Course Completer', description: 'Complete a full course', icon: '🎓', pointsRequired: 300 },
    { id: 'badge-7', name: 'Top Performer', description: 'Reach top 10 on leaderboard', icon: '🏅', pointsRequired: 500 },
    { id: 'badge-8', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', pointsRequired: 150 },
];

export const mockUserProgress: UserProgress = {
    userId: 'current-user',
    courseId: 'course-1',
    videosWatched: ['RBSGKlAvoiM', 'JgZQkS7_3gg'],
    quizzesCompleted: ['quiz-1'],
    totalPoints: 1250,
    watchTime: 180,
    lastAccessed: '2024-02-23T10:30:00Z',
    completed: false,
};

// YouTube API configuration
export const YOUTUBE_API_CONFIG = {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    maxResults: 10,
};

// Helper function to parse YouTube duration
export function parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to format view count
export function formatViewCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

// Mock Skills for Honeycomb
import { Code, Database, Globe, Brain, Palette, Server } from 'lucide-react';

export const mockSkills = [
    { id: 'skill-1', name: 'JavaScript', icon: Code, level: 75, progress: 75 },
    { id: 'skill-2', name: 'Python', icon: Code, level: 60, progress: 60 },
    { id: 'skill-3', name: 'React', icon: Globe, level: 80, progress: 80 },
    { id: 'skill-4', name: 'Database', icon: Database, level: 45, progress: 45 },
    { id: 'skill-5', name: 'ML/AI', icon: Brain, level: 30, progress: 30 },
    { id: 'skill-6', name: 'Design', icon: Palette, level: 55, progress: 55 },
    { id: 'skill-7', name: 'Node.js', icon: Server, level: 65, progress: 65 },
    { id: 'skill-8', name: 'TypeScript', icon: Code, level: 70, progress: 70 },
];