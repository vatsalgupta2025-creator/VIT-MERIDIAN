// ============================================================
// SYNAPSE Learning Hub — AI Quiz Generator Service
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Quiz, QuizQuestion } from '@/types/learning';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD2Q4_VL9jOzpgcDBXW3m0dfwoNec-T0LI';


interface GeneratedQuiz {
    title: string;
    questions: QuizQuestion[];
}

interface VideoSummary {
    mainTopics: string[];
    keyConcepts: string[];
    learningObjectives: string[];
    summary: string;
}

// Generate a comprehensive summary of what the video covers based on title and description
async function generateVideoSummary(
    videoTitle: string,
    videoDescription: string
): Promise<VideoSummary | null> {
    if (!GEMINI_API_KEY) {
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an educational content analyzer. Analyze the following video metadata and generate a comprehensive summary of what this educational video would cover.

Video Title: "${videoTitle}"
Video Description: "${videoDescription}"

Based on the title and description, infer what topics, concepts, and learning objectives this video would cover. Be specific and educational.

Respond ONLY with a valid JSON object in this exact format:
{
  "mainTopics": ["topic1", "topic2", "topic3"],
  "keyConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "summary": "A 2-3 sentence summary of what the viewer would learn from this video"
}

Do not include any text before or after the JSON. Only return the JSON object.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from the response
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error generating video summary:', error);
        return null;
    }
}

// Generate quiz questions using Gemini AI based on video content
export async function generateQuizFromVideo(
    videoId: string,
    videoTitle: string,
    videoDescription: string,
    numQuestions: number = 5
): Promise<GeneratedQuiz | null> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured. Using fallback quiz.');
        return getFallbackQuiz(videoTitle);
    }

    try {
        // First, generate a summary of what the video covers
        const videoSummary = await generateVideoSummary(videoTitle, videoDescription);

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build a comprehensive prompt with video context
        let contextPrompt = '';

        if (videoSummary) {
            contextPrompt = `
Video Analysis:
- Main Topics: ${videoSummary.mainTopics.join(', ')}
- Key Concepts: ${videoSummary.keyConcepts.join(', ')}
- Learning Objectives: ${videoSummary.learningObjectives.join(', ')}
- Summary: ${videoSummary.summary}
`;
        }

        const prompt = `You are an educational quiz generator creating questions for students who just watched an educational video.

Video Title: "${videoTitle}"
Video Description: "${videoDescription}"
${contextPrompt}

Requirements:
1. Create ${numQuestions} multiple-choice questions that test understanding of the SPECIFIC topics covered in this video
2. Questions should be based on the main topics and key concepts identified above
3. Each question must have exactly 4 options (A, B, C, D)
4. Mark the correct answer index (0-3)
5. Provide a brief explanation for each correct answer that reinforces the learning
6. Questions should range from easy to moderate difficulty
7. Make questions SPECIFIC to the video content, not generic
8. Include questions about:
   - Key definitions and terminology from the video
   - How concepts work or relate to each other
   - Practical applications mentioned
   - Important details from the video topic

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Quiz: [Specific Topic from Video]",
  "questions": [
    {
      "id": "q1",
      "question": "Specific question about the video content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct with reference to the video content"
    }
  ]
}

Do not include any text before or after the JSON. Only return the JSON object.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from the response
        let jsonStr = responseText;

        // Try to find JSON in the response if it's wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Parse the JSON response
        const parsed = JSON.parse(jsonStr);

        // Validate the structure
        if (!parsed.title || !Array.isArray(parsed.questions)) {
            throw new Error('Invalid quiz structure');
        }

        // Ensure each question has the required fields
        const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => ({
            id: `q-${videoId}-${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'No explanation provided.',
        }));

        return {
            title: parsed.title,
            questions,
        };
    } catch (error) {
        console.error('Error generating quiz with Gemini:', error);
        return getFallbackQuiz(videoTitle);
    }
}

// Fallback quiz when API is not available - now more context-aware
function getFallbackQuiz(videoTitle: string): GeneratedQuiz {
    // Extract potential topic from video title
    const titleWords = videoTitle.toLowerCase();

    // Topic-specific fallback questions
    if (titleWords.includes('react') || titleWords.includes('javascript')) {
        return {
            title: `Quiz: React & JavaScript Concepts`,
            questions: [
                {
                    id: 'fallback-q1',
                    question: `Based on "${videoTitle}", what is a key concept in React development?`,
                    options: [
                        'Component-based architecture',
                        'Database normalization',
                        'Network protocols',
                        'Hardware optimization',
                    ],
                    correctAnswer: 0,
                    explanation: 'React uses a component-based architecture where UI is broken into reusable pieces.',
                },
                {
                    id: 'fallback-q2',
                    question: 'Which hook is used for side effects in React functional components?',
                    options: [
                        'useEffect',
                        'useSideEffect',
                        'useAction',
                        'useRender',
                    ],
                    correctAnswer: 0,
                    explanation: 'useEffect is the hook used to handle side effects in functional components.',
                },
                {
                    id: 'fallback-q3',
                    question: 'What is the purpose of state in React?',
                    options: [
                        'To store component data that can change over time',
                        'To define CSS styles',
                        'To handle network requests only',
                        'To create database connections',
                    ],
                    correctAnswer: 0,
                    explanation: 'State is used to store data that can change and trigger re-renders when updated.',
                },
                {
                    id: 'fallback-q4',
                    question: 'What does JSX stand for?',
                    options: [
                        'JavaScript XML',
                        'Java Syntax Extension',
                        'JSON XML',
                        'JavaScript Extra',
                    ],
                    correctAnswer: 0,
                    explanation: 'JSX stands for JavaScript XML, allowing HTML-like syntax in JavaScript.',
                },
                {
                    id: 'fallback-q5',
                    question: 'How do you pass data from parent to child component?',
                    options: [
                        'Through props',
                        'Through state',
                        'Through context only',
                        'Through global variables',
                    ],
                    correctAnswer: 0,
                    explanation: 'Props are used to pass data from parent to child components in React.',
                },
            ],
        };
    }

    if (titleWords.includes('python')) {
        return {
            title: `Quiz: Python Programming`,
            questions: [
                {
                    id: 'fallback-q1',
                    question: `Based on "${videoTitle}", what is a key feature of Python?`,
                    options: [
                        'Readable syntax and dynamic typing',
                        'Compiled execution only',
                        'Manual memory management',
                        'Platform-specific code',
                    ],
                    correctAnswer: 0,
                    explanation: 'Python is known for its readable syntax and dynamic typing system.',
                },
                {
                    id: 'fallback-q2',
                    question: 'Which data structure is ordered and mutable in Python?',
                    options: [
                        'List',
                        'Tuple',
                        'Set',
                        'Frozen set',
                    ],
                    correctAnswer: 0,
                    explanation: 'Lists in Python are ordered and mutable sequences.',
                },
                {
                    id: 'fallback-q3',
                    question: 'What is a decorator in Python?',
                    options: [
                        'A function that modifies another function\'s behavior',
                        'A design pattern for classes',
                        'A type of comment',
                        'A variable naming convention',
                    ],
                    correctAnswer: 0,
                    explanation: 'Decorators are functions that modify the behavior of other functions or methods.',
                },
                {
                    id: 'fallback-q4',
                    question: 'How do you handle exceptions in Python?',
                    options: [
                        'Using try-except blocks',
                        'Using catch-throw blocks',
                        'Using error-goto statements',
                        'Using exception handlers only',
                    ],
                    correctAnswer: 0,
                    explanation: 'Python uses try-except blocks for exception handling.',
                },
                {
                    id: 'fallback-q5',
                    question: 'What is a list comprehension in Python?',
                    options: [
                        'A concise way to create lists',
                        'A method to sort lists',
                        'A way to import lists',
                        'A type of loop structure',
                    ],
                    correctAnswer: 0,
                    explanation: 'List comprehensions provide a concise way to create lists based on existing sequences.',
                },
            ],
        };
    }

    if (titleWords.includes('data structure') || titleWords.includes('algorithm')) {
        return {
            title: `Quiz: Data Structures & Algorithms`,
            questions: [
                {
                    id: 'fallback-q1',
                    question: `Based on "${videoTitle}", what is the time complexity of binary search?`,
                    options: [
                        'O(log n)',
                        'O(n)',
                        'O(n²)',
                        'O(1)',
                    ],
                    correctAnswer: 0,
                    explanation: 'Binary search has O(log n) time complexity as it halves the search space each iteration.',
                },
                {
                    id: 'fallback-q2',
                    question: 'Which data structure uses LIFO (Last In First Out)?',
                    options: [
                        'Stack',
                        'Queue',
                        'Array',
                        'Linked List',
                    ],
                    correctAnswer: 0,
                    explanation: 'A stack follows LIFO principle where the last element added is the first to be removed.',
                },
                {
                    id: 'fallback-q3',
                    question: 'What is the advantage of a linked list over an array?',
                    options: [
                        'Dynamic size and efficient insertion/deletion',
                        'Better cache locality',
                        'Random access in O(1)',
                        'Less memory usage',
                    ],
                    correctAnswer: 0,
                    explanation: 'Linked lists have dynamic size and efficient insertion/deletion at any position.',
                },
                {
                    id: 'fallback-q4',
                    question: 'Which sorting algorithm has the best average-case time complexity?',
                    options: [
                        'Merge Sort - O(n log n)',
                        'Bubble Sort - O(n²)',
                        'Selection Sort - O(n²)',
                        'Insertion Sort - O(n²)',
                    ],
                    correctAnswer: 0,
                    explanation: 'Merge Sort has O(n log n) average and worst-case time complexity.',
                },
                {
                    id: 'fallback-q5',
                    question: 'What is a hash table used for?',
                    options: [
                        'Fast key-value lookups',
                        'Sorting data',
                        'Graph traversal',
                        'String matching',
                    ],
                    correctAnswer: 0,
                    explanation: 'Hash tables provide O(1) average time complexity for key-value lookups.',
                },
            ],
        };
    }

    if (titleWords.includes('machine learning') || titleWords.includes('ai') || titleWords.includes('deep learning')) {
        return {
            title: `Quiz: Machine Learning Concepts`,
            questions: [
                {
                    id: 'fallback-q1',
                    question: `Based on "${videoTitle}", what is supervised learning?`,
                    options: [
                        'Learning from labeled data',
                        'Learning without any data',
                        'Learning from unlabeled data',
                        'Learning through rewards only',
                    ],
                    correctAnswer: 0,
                    explanation: 'Supervised learning uses labeled training data to learn mapping from inputs to outputs.',
                },
                {
                    id: 'fallback-q2',
                    question: 'What is overfitting in machine learning?',
                    options: [
                        'Model performs well on training data but poorly on new data',
                        'Model is too simple',
                        'Model has too few parameters',
                        'Model trains too slowly',
                    ],
                    correctAnswer: 0,
                    explanation: 'Overfitting occurs when a model learns training data too well, including noise.',
                },
                {
                    id: 'fallback-q3',
                    question: 'What is the purpose of a loss function?',
                    options: [
                        'To measure how well the model performs',
                        'To generate training data',
                        'To visualize results',
                        'To clean the dataset',
                    ],
                    correctAnswer: 0,
                    explanation: 'Loss functions quantify the difference between predicted and actual values.',
                },
                {
                    id: 'fallback-q4',
                    question: 'What is gradient descent used for?',
                    options: [
                        'Optimizing model parameters',
                        'Generating random samples',
                        'Classifying images',
                        'Processing natural language',
                    ],
                    correctAnswer: 0,
                    explanation: 'Gradient descent is an optimization algorithm to minimize the loss function.',
                },
                {
                    id: 'fallback-q5',
                    question: 'What type of neural network is best for image recognition?',
                    options: [
                        'Convolutional Neural Network (CNN)',
                        'Recurrent Neural Network (RNN)',
                        'Simple perceptron',
                        'Linear regression model',
                    ],
                    correctAnswer: 0,
                    explanation: 'CNNs are specifically designed for processing grid-like data such as images.',
                },
            ],
        };
    }

    // Generic fallback for other topics
    const topic = videoTitle.split(' ').slice(0, 3).join(' ');

    return {
        title: `Quiz: ${topic}`,
        questions: [
            {
                id: 'fallback-q1',
                question: `What is the main topic covered in "${videoTitle}"?`,
                options: [
                    'Core concepts and fundamentals',
                    'Advanced topics only',
                    'Unrelated content',
                    'Entertainment only',
                ],
                correctAnswer: 0,
                explanation: 'This video focuses on teaching core concepts and fundamentals of the topic.',
            },
            {
                id: 'fallback-q2',
                question: 'What should you focus on while watching this educational content?',
                options: [
                    'Understanding key concepts and their applications',
                    'Memorizing without understanding',
                    'Skipping through quickly',
                    'Ignoring practical examples',
                ],
                correctAnswer: 0,
                explanation: 'Focus on understanding concepts and how they apply in real scenarios.',
            },
            {
                id: 'fallback-q3',
                question: 'How can you best retain information from this video?',
                options: [
                    'Take notes and practice what you learn',
                    'Watch without any engagement',
                    'Skip the difficult parts',
                    'Watch only once',
                ],
                correctAnswer: 0,
                explanation: 'Active engagement through note-taking and practice improves retention.',
            },
            {
                id: 'fallback-q4',
                question: 'What is the recommended approach after watching this video?',
                options: [
                    'Apply the concepts in practical projects',
                    'Forget and move to different topics',
                    'Avoid any practice',
                    'Never revisit the material',
                ],
                correctAnswer: 0,
                explanation: 'Practical application reinforces learning and builds real skills.',
            },
            {
                id: 'fallback-q5',
                question: 'Why is it important to complete quizzes after watching educational videos?',
                options: [
                    'To test and reinforce your understanding',
                    'To waste time',
                    'To skip learning',
                    'To avoid practice',
                ],
                correctAnswer: 0,
                explanation: 'Quizzes help identify knowledge gaps and reinforce what you learned.',
            },
        ],
    };
}

// Calculate points based on quiz performance
export function calculateQuizPoints(
    correctAnswers: number,
    totalQuestions: number,
    timeTaken: number, // in seconds
    timeLimit: number // in seconds
): number {
    // Base points for correct answers
    const basePoints = correctAnswers * 20;

    // Bonus for accuracy (percentage correct)
    const accuracyBonus = Math.round((correctAnswers / totalQuestions) * 50);

    // Time bonus (if completed quickly)
    const timeBonus = timeTaken < timeLimit * 0.5 ? 30 : timeTaken < timeLimit * 0.75 ? 15 : 0;

    // Perfect score bonus
    const perfectBonus = correctAnswers === totalQuestions ? 50 : 0;

    return basePoints + accuracyBonus + timeBonus + perfectBonus;
}

// Generate a unique quiz ID
export function generateQuizId(videoId: string): string {
    return `quiz-${videoId}-${Date.now()}`;
}

// Create a complete quiz object
export async function createQuizForVideo(
    videoId: string,
    videoTitle: string,
    videoDescription: string
): Promise<Quiz> {
    const generated = await generateQuizFromVideo(videoId, videoTitle, videoDescription);

    if (!generated) {
        throw new Error('Failed to generate quiz');
    }

    return {
        id: generateQuizId(videoId),
        videoId,
        courseId: 'dynamic',
        title: generated.title,
        questions: generated.questions,
        timeLimit: Math.max(5, generated.questions.length * 2), // 2 minutes per question, minimum 5
        passingScore: 60,
        rewardPoints: 100,
    };
}
