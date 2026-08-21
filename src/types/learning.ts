// ============================================================
// SYNAPSE Learning Hub — Types
// ============================================================

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    duration: string;
    viewCount: number;
    likeCount: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: string;
    category: CourseCategory;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    totalVideos: number;
    totalDuration: string;
    enrolledCount: number;
    rating: number;
    videos: YouTubeVideo[];
}

export type CourseCategory =
    | 'Computer Science'
    | 'Mathematics'
    | 'Physics'
    | 'Data Science'
    | 'Web Development'
    | 'Machine Learning'
    | 'Mobile Development'
    | 'Cybersecurity'
    | 'Cloud Computing'
    | 'Other';

export interface Quiz {
    id: string;
    videoId: string;
    courseId: string;
    title: string;
    questions: QuizQuestion[];
    timeLimit: number; // in minutes
    passingScore: number;
    rewardPoints: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation: string;
}

export interface QuizResult {
    quizId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number; // in seconds
    completedAt: string;
    pointsEarned: number;
}

export interface UserProgress {
    userId: string;
    courseId: string;
    videosWatched: string[];
    quizzesCompleted: string[];
    totalPoints: number;
    watchTime: number; // in minutes
    lastAccessed: string;
    completed: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    avatar: string;
    totalPoints: number;
    videosWatched: number;
    quizzesCompleted: number;
    streak: number;
    badge?: string;
}

export interface RewardBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    pointsRequired: number;
    earnedAt?: string;
}

export interface VideoWatchHistory {
    videoId: string;
    watchedAt: string;
    watchDuration: number; // seconds
    completed: boolean;
    pointsEarned: number;
}

export interface YouTubeSearchResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    items: YouTubeVideo[];
}

export interface YouTubeVideoDetails {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        channelId: string;
        publishedAt: string;
        thumbnails: {
            default: { url: string; width: number; height: number };
            medium: { url: string; width: number; height: number };
            high: { url: string; width: number; height: number };
        };
    };
    contentDetails: {
        duration: string;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
    };
}
