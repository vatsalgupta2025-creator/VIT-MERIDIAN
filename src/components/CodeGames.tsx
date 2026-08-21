'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gamepad2, Trophy, Clock, Star, Zap, Flame, ChevronRight,
    CheckCircle, XCircle, Play, RotateCcw, Code, Bug, Puzzle,
    Keyboard, Target, Award, Lock, Unlock, Sparkles, Timer
} from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { currentUser } from '@/data/mockData';
import LetterGlitch from './LetterGlitch';

// Types
interface Question {
    id: string;
    type: 'multiple-choice' | 'fill-blank' | 'debug' | 'typing' | 'code-output' | 'reorder' | 'true-false';
    language: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    question: string;
    code?: string;
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
    xp: number;
    timeLimit?: number;
    codeLines?: string[];
    correctOrder?: number[];
}

interface GameLevel {
    id: number;
    name: string;
    description: string;
    language: string;
    icon: string;
    questions: Question[];
    unlocked: boolean;
    completed: boolean;
    highScore: number;
}

// Programming Languages Data
const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍', color: 'from-yellow-500 to-green-500' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡', color: 'from-yellow-400 to-yellow-600' },
    { id: 'typescript', name: 'TypeScript', icon: '📘', color: 'from-blue-500 to-blue-600' },
    { id: 'java', name: 'Java', icon: '☕', color: 'from-red-500 to-orange-500' },
    { id: 'cpp', name: 'C++', icon: '⚙️', color: 'from-blue-500 to-indigo-500' },
    { id: 'rust', name: 'Rust', icon: '🦀', color: 'from-orange-600 to-red-600' },
    { id: 'go', name: 'Go', icon: '🐹', color: 'from-cyan-400 to-blue-400' },
    { id: 'sql', name: 'SQL', icon: '🗃️', color: 'from-purple-500 to-violet-500' },
];

// Sample Questions Database
const QUESTIONS_DB: Question[] = [
    // Python Questions
    {
        id: 'py1',
        type: 'multiple-choice',
        language: 'python',
        difficulty: 'beginner',
        question: 'What is the output of: print(type([]))?',
        options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "<class 'tuple'>"],
        correctAnswer: 0,
        explanation: 'In Python, [] creates an empty list, and type([]) returns <class \'list\'>',
        xp: 10,
        timeLimit: 30
    },
    {
        id: 'py2',
        type: 'fill-blank',
        language: 'python',
        difficulty: 'beginner',
        question: 'Complete the list comprehension to create a list of squares from 1 to 5:',
        code: 'squares = [x**2 ___ x in range(1, 6)]',
        correctAnswer: 'for',
        explanation: 'List comprehensions use "for" to iterate over the range',
        xp: 15,
        timeLimit: 45
    },
    {
        id: 'py3',
        type: 'debug',
        language: 'python',
        difficulty: 'intermediate',
        question: 'Find the bug in this code. What line has the error?',
        code: `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(-1))`,
        options: ['Line 1', 'Line 2', 'Line 4', 'No syntax error, but infinite recursion'],
        correctAnswer: 3,
        explanation: 'There\'s no syntax error, but calling factorial(-1) causes infinite recursion. The function needs a check for negative numbers.',
        xp: 25,
        timeLimit: 60
    },
    {
        id: 'py4',
        type: 'typing',
        language: 'python',
        difficulty: 'beginner',
        question: 'Type the correct Python syntax to create a dictionary with key "name" and value "John":',
        correctAnswer: '{"name": "John"}',
        explanation: 'Dictionaries in Python are created using curly braces with key-value pairs separated by colons.',
        xp: 20,
        timeLimit: 30
    },
    // JavaScript Questions
    {
        id: 'js1',
        type: 'multiple-choice',
        language: 'javascript',
        difficulty: 'beginner',
        question: 'What does console.log(typeof null) output in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctAnswer: 2,
        explanation: 'In JavaScript, typeof null returns "object" due to a historical bug that cannot be fixed for backward compatibility.',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'js2',
        type: 'fill-blank',
        language: 'javascript',
        difficulty: 'intermediate',
        question: 'Complete the arrow function to double a number:',
        code: 'const double = (n) ___ n * 2;',
        correctAnswer: '=>',
        explanation: 'Arrow functions use => syntax. The expression after => is implicitly returned.',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'js3',
        type: 'debug',
        language: 'javascript',
        difficulty: 'intermediate',
        question: 'What is wrong with this async code?',
        code: `async function getData() {\n    const result = await fetch('/api');\n    console.log(result.data);\n}`,
        options: ['Missing async keyword', 'await can only be used with Promise-returning functions', 'result.data is undefined (need result.json())', 'Nothing is wrong'],
        correctAnswer: 2,
        explanation: 'fetch() returns a Response object. You need to call result.json() to parse the JSON body.',
        xp: 30,
        timeLimit: 60
    },
    {
        id: 'js4',
        type: 'typing',
        language: 'javascript',
        difficulty: 'beginner',
        question: 'Type the method to add an element to the end of an array:',
        correctAnswer: '.push()',
        explanation: 'The push() method adds one or more elements to the end of an array.',
        xp: 15,
        timeLimit: 20
    },
    // Java Questions
    {
        id: 'java1',
        type: 'multiple-choice',
        language: 'java',
        difficulty: 'beginner',
        question: 'Which keyword is used to create a subclass in Java?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correctAnswer: 1,
        explanation: 'The "extends" keyword is used to create a subclass that inherits from a parent class.',
        xp: 10,
        timeLimit: 30
    },
    {
        id: 'java2',
        type: 'fill-blank',
        language: 'java',
        difficulty: 'intermediate',
        question: 'Complete the ArrayList declaration:',
        code: 'ArrayList<String> list = ___ ArrayList<>();',
        correctAnswer: 'new',
        explanation: 'In Java, objects are created using the "new" keyword followed by the constructor.',
        xp: 15,
        timeLimit: 30
    },
    // C++ Questions
    {
        id: 'cpp1',
        type: 'multiple-choice',
        language: 'cpp',
        difficulty: 'intermediate',
        question: 'What is the difference between delete and delete[] in C++?',
        options: ['No difference', 'delete[] is for arrays, delete for single objects', 'delete[] is faster', 'delete is deprecated'],
        correctAnswer: 1,
        explanation: 'delete[] must be used for arrays to properly call destructors on all elements. Using delete on arrays causes undefined behavior.',
        xp: 25,
        timeLimit: 45
    },
    {
        id: 'cpp2',
        type: 'typing',
        language: 'cpp',
        difficulty: 'beginner',
        question: 'Type the C++ keyword to define a constant value:',
        correctAnswer: 'const',
        explanation: 'The "const" keyword in C++ declares a value that cannot be modified after initialization.',
        xp: 10,
        timeLimit: 20
    },
    // Rust Questions
    {
        id: 'rust1',
        type: 'multiple-choice',
        language: 'rust',
        difficulty: 'intermediate',
        question: 'What does the borrow checker in Rust prevent?',
        options: ['Memory leaks', 'Data races at compile time', 'Stack overflow', 'Null pointer exceptions'],
        correctAnswer: 1,
        explanation: 'Rust\'s borrow checker enforces ownership rules at compile time to prevent data races.',
        xp: 30,
        timeLimit: 45
    },
    {
        id: 'rust2',
        type: 'fill-blank',
        language: 'rust',
        difficulty: 'beginner',
        question: 'Complete the macro to print in Rust:',
        code: '___!("Hello, World!");',
        correctAnswer: 'println',
        explanation: 'println! is a macro in Rust (indicated by !) that prints to stdout with a newline.',
        xp: 15,
        timeLimit: 30
    },
    // Go Questions
    {
        id: 'go1',
        type: 'multiple-choice',
        language: 'go',
        difficulty: 'beginner',
        question: 'What is the correct way to declare a variable in Go?',
        options: ['var x int = 5', 'int x = 5', 'x := int(5)', 'Both A and C are valid'],
        correctAnswer: 3,
        explanation: 'Go supports both "var x int = 5" and short declaration "x := 5" (type inferred).',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'go2',
        type: 'typing',
        language: 'go',
        difficulty: 'intermediate',
        question: 'Type the keyword to start a goroutine:',
        correctAnswer: 'go',
        explanation: 'The "go" keyword before a function call starts it as a goroutine (concurrent execution).',
        xp: 20,
        timeLimit: 20
    },
    // Code Output Prediction Questions
    {
        id: 'py-output1',
        type: 'code-output',
        language: 'python',
        difficulty: 'beginner',
        question: 'What will be the output of this code?',
        code: 'x = [1, 2, 3]\nprint(x[-1])',
        options: ['1', '3', 'Error', '[-1]'],
        correctAnswer: 1,
        explanation: 'In Python, negative indices count from the end. x[-1] returns the last element (3).',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'js-output1',
        type: 'code-output',
        language: 'javascript',
        difficulty: 'intermediate',
        question: 'What will be the output?',
        code: 'console.log([1, 2, 3].map(x => x * 2).filter(x => x > 2));',
        options: ['[2, 4, 6]', '[4, 6]', '[2, 4]', '[1, 2, 3]'],
        correctAnswer: 1,
        explanation: 'map doubles each element to [2,4,6], then filter keeps only values > 2, resulting in [4, 6].',
        xp: 25,
        timeLimit: 45
    },
    {
        id: 'java-output1',
        type: 'code-output',
        language: 'java',
        difficulty: 'intermediate',
        question: 'What will this Java code print?',
        code: 'String s = "hello";\nSystem.out.println(s.substring(1, 3));',
        options: ['he', 'el', 'ell', 'hello'],
        correctAnswer: 1,
        explanation: 'substring(1, 3) returns characters from index 1 (inclusive) to 3 (exclusive), which is "el".',
        xp: 20,
        timeLimit: 30
    },
    // True/False Questions
    {
        id: 'py-tf1',
        type: 'true-false',
        language: 'python',
        difficulty: 'beginner',
        question: 'In Python, lists are immutable (cannot be changed after creation).',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'Python lists are mutable. Tuples are immutable. You can add, remove, or modify list elements.',
        xp: 10,
        timeLimit: 20
    },
    {
        id: 'js-tf1',
        type: 'true-false',
        language: 'javascript',
        difficulty: 'beginner',
        question: 'JavaScript is a statically typed language.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'JavaScript is dynamically typed. Variable types are determined at runtime and can change.',
        xp: 10,
        timeLimit: 20
    },
    {
        id: 'cpp-tf1',
        type: 'true-false',
        language: 'cpp',
        difficulty: 'intermediate',
        question: 'In C++, a class can inherit from multiple base classes.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'C++ supports multiple inheritance, allowing a class to inherit from more than one base class.',
        xp: 15,
        timeLimit: 25
    },
    // More Python Questions
    {
        id: 'py5',
        type: 'multiple-choice',
        language: 'python',
        difficulty: 'intermediate',
        question: 'Which decorator is used to define a static method in Python?',
        options: ['@staticmethod', '@static', '@StaticMethod', '@method'],
        correctAnswer: 0,
        explanation: '@staticmethod is used to define a method that belongs to the class rather than an instance.',
        xp: 20,
        timeLimit: 30
    },
    {
        id: 'py6',
        type: 'fill-blank',
        language: 'python',
        difficulty: 'intermediate',
        question: 'Complete the lambda function to square a number:',
        code: 'square = ___ x: x ** 2',
        correctAnswer: 'lambda',
        explanation: 'Lambda functions in Python are defined using the "lambda" keyword.',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'py7',
        type: 'code-output',
        language: 'python',
        difficulty: 'intermediate',
        question: 'What will be the output?',
        code: 'd = {"a": 1, "b": 2}\nprint(d.get("c", 0))',
        options: ['None', '0', 'Error', '{"c": 0}'],
        correctAnswer: 1,
        explanation: 'dict.get(key, default) returns the default value (0) if the key doesn\'t exist.',
        xp: 20,
        timeLimit: 30
    },
    // More JavaScript Questions
    {
        id: 'js5',
        type: 'multiple-choice',
        language: 'javascript',
        difficulty: 'intermediate',
        question: 'What is the output of: console.log(1 + "2" + 3)?',
        options: ['6', '"123"', '"33"', 'Error'],
        correctAnswer: 1,
        explanation: 'JavaScript concatenates from left to right. 1 + "2" = "12", then "12" + 3 = "123".',
        xp: 20,
        timeLimit: 30
    },
    {
        id: 'js6',
        type: 'fill-blank',
        language: 'javascript',
        difficulty: 'beginner',
        question: 'Complete the destructuring assignment:',
        code: 'const { name } = ___ { name: "John", age: 25 };',
        correctAnswer: '',
        explanation: 'The object literal is directly destructured. No additional keyword needed.',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'js7',
        type: 'code-output',
        language: 'javascript',
        difficulty: 'advanced',
        question: 'What will be logged?',
        code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1);\n}',
        options: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'Error'],
        correctAnswer: 1,
        explanation: 'var is function-scoped, not block-scoped. All callbacks reference the same i, which is 3 when the timeouts execute.',
        xp: 35,
        timeLimit: 60
    },
    // More Java Questions
    {
        id: 'java3',
        type: 'multiple-choice',
        language: 'java',
        difficulty: 'intermediate',
        question: 'Which access modifier makes a member accessible only within its own class?',
        options: ['public', 'protected', 'default', 'private'],
        correctAnswer: 3,
        explanation: 'The private modifier restricts access to only within the declaring class.',
        xp: 15,
        timeLimit: 25
    },
    {
        id: 'java4',
        type: 'code-output',
        language: 'java',
        difficulty: 'intermediate',
        question: 'What will this code output?',
        code: 'int[] arr = {1, 2, 3};\nSystem.out.println(arr.length);',
        options: ['2', '3', '4', 'Error'],
        correctAnswer: 1,
        explanation: 'arr.length returns the number of elements in the array, which is 3.',
        xp: 15,
        timeLimit: 25
    },
    // More C++ Questions
    {
        id: 'cpp3',
        type: 'multiple-choice',
        language: 'cpp',
        difficulty: 'beginner',
        question: 'Which header file is required for std::vector in C++?',
        options: ['<vector>', '<array>', '<container>', '<list>'],
        correctAnswer: 0,
        explanation: 'The <vector> header is required to use std::vector in C++.',
        xp: 10,
        timeLimit: 20
    },
    {
        id: 'cpp4',
        type: 'fill-blank',
        language: 'cpp',
        difficulty: 'intermediate',
        question: 'Complete the smart pointer declaration:',
        code: '___<int> ptr = std::make_shared<int>(42);',
        correctAnswer: 'std::shared_ptr',
        explanation: 'std::shared_ptr is a smart pointer that manages shared ownership of a dynamically allocated object.',
        xp: 25,
        timeLimit: 40
    },
    // More Rust Questions
    {
        id: 'rust3',
        type: 'multiple-choice',
        language: 'rust',
        difficulty: 'beginner',
        question: 'Which keyword is used to declare an immutable variable in Rust?',
        options: ['mut', 'let', 'const', 'var'],
        correctAnswer: 1,
        explanation: 'In Rust, "let" declares a variable. By default, variables are immutable unless "mut" is added.',
        xp: 10,
        timeLimit: 25
    },
    {
        id: 'rust4',
        type: 'code-output',
        language: 'rust',
        difficulty: 'intermediate',
        question: 'What does this Rust code print?',
        code: 'let s = String::from("hello");\nlet len = s.len();\nprintln!("{}", len);',
        options: ['4', '5', '6', 'Error'],
        correctAnswer: 1,
        explanation: 'String::from("hello") creates a string with 5 characters, so len() returns 5.',
        xp: 20,
        timeLimit: 30
    },
    // More Go Questions
    {
        id: 'go3',
        type: 'multiple-choice',
        language: 'go',
        difficulty: 'intermediate',
        question: 'What is the purpose of the defer statement in Go?',
        options: ['Skip execution', 'Delay until function returns', 'Create error', 'Import module'],
        correctAnswer: 1,
        explanation: 'defer schedules a function call to be executed when the surrounding function returns.',
        xp: 20,
        timeLimit: 30
    },
    {
        id: 'go4',
        type: 'fill-blank',
        language: 'go',
        difficulty: 'beginner',
        question: 'Complete the function declaration:',
        code: '___ add(a, b int) int {\n    return a + b\n}',
        correctAnswer: 'func',
        explanation: 'Functions in Go are declared using the "func" keyword.',
        xp: 10,
        timeLimit: 20
    },
    // TypeScript Questions (New Language)
    {
        id: 'ts1',
        type: 'multiple-choice',
        language: 'typescript',
        difficulty: 'beginner',
        question: 'Which keyword is used to declare a variable with a specific type in TypeScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3,
        explanation: 'TypeScript supports var, let, and const for variable declarations, all of which can have type annotations.',
        xp: 10,
        timeLimit: 25
    },
    {
        id: 'ts2',
        type: 'fill-blank',
        language: 'typescript',
        difficulty: 'intermediate',
        question: 'Complete the interface definition:',
        code: '___ User {\n  name: string;\n  age: number;\n}',
        correctAnswer: 'interface',
        explanation: 'Interfaces in TypeScript are defined using the "interface" keyword.',
        xp: 15,
        timeLimit: 30
    },
    {
        id: 'ts3',
        type: 'typing',
        language: 'typescript',
        difficulty: 'beginner',
        question: 'Type the TypeScript type for a variable that can be either string or number:',
        correctAnswer: 'string | number',
        explanation: 'Union types in TypeScript use the pipe (|) operator to combine multiple types.',
        xp: 20,
        timeLimit: 30
    },
    // SQL Questions (New Language)
    {
        id: 'sql1',
        type: 'multiple-choice',
        language: 'sql',
        difficulty: 'beginner',
        question: 'Which SQL command is used to retrieve data from a database?',
        options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
        correctAnswer: 2,
        explanation: 'SELECT is the SQL command used to query and retrieve data from database tables.',
        xp: 10,
        timeLimit: 20
    },
    {
        id: 'sql2',
        type: 'fill-blank',
        language: 'sql',
        difficulty: 'beginner',
        question: 'Complete the SQL query to filter results:',
        code: 'SELECT * FROM users ___ age > 18;',
        correctAnswer: 'WHERE',
        explanation: 'The WHERE clause is used to filter records based on a condition.',
        xp: 15,
        timeLimit: 25
    },
    {
        id: 'sql3',
        type: 'typing',
        language: 'sql',
        difficulty: 'intermediate',
        question: 'Type the SQL keyword to group results by a column:',
        correctAnswer: 'GROUP BY',
        explanation: 'GROUP BY is used to aggregate rows that have the same values in specified columns.',
        xp: 20,
        timeLimit: 25
    },
];

// Game Modes
type GameMode = 'menu' | 'select-language' | 'playing' | 'result';

export default function CodeGames() {
    const [gameMode, setGameMode] = useState<GameMode>('menu');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [userInput, setUserInput] = useState('');
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);
    const [totalXpEarned, setTotalXpEarned] = useState(0);

    // Get questions for selected language
    const currentQuestions = useMemo(() => {
        if (!selectedLanguage) return [];
        return QUESTIONS_DB.filter(q => q.language === selectedLanguage);
    }, [selectedLanguage]);

    const currentQuestion = currentQuestions[currentQuestionIndex];

    // Timer effect
    useEffect(() => {
        if (gameMode !== 'playing' || !currentQuestion || showExplanation) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameMode, currentQuestionIndex, showExplanation]);

    const handleTimeUp = () => {
        setIsCorrect(false);
        setShowExplanation(true);
        setStreak(0);
    };

    const startGame = (languageId: string) => {
        setSelectedLanguage(languageId);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setGameMode('playing');
        setShowExplanation(false);
        setSelectedAnswer(null);
        setUserInput('');
        const questions = QUESTIONS_DB.filter(q => q.language === languageId);
        if (questions.length > 0) {
            setTimeLeft(questions[0].timeLimit || 30);
        }
    };

    const handleAnswer = (answer: string | number) => {
        if (showExplanation) return;
        setSelectedAnswer(answer);
        checkAnswer(answer);
    };

    const checkAnswer = (answer: string | number) => {
        if (!currentQuestion) return;

        let correct = false;
        if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'debug' ||
            currentQuestion.type === 'code-output' || currentQuestion.type === 'true-false') {
            correct = answer === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === 'fill-blank' || currentQuestion.type === 'typing') {
            correct = String(answer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim();
        }

        setIsCorrect(correct);
        setShowExplanation(true);

        if (correct) {
            const timeBonus = Math.floor((timeLeft / (currentQuestion.timeLimit || 30)) * 10);
            const streakBonus = streak * 2;
            const earnedXp = currentQuestion.xp + timeBonus + streakBonus;
            setScore(prev => prev + earnedXp);
            setStreak(prev => prev + 1);
            setTotalXpEarned(prev => prev + earnedXp);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#06b6d4', '#10b981', '#8b5cf6']
            });
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowExplanation(false);
            setSelectedAnswer(null);
            setUserInput('');
            setIsCorrect(null);
            setTimeLeft(currentQuestions[currentQuestionIndex + 1].timeLimit || 30);
        } else {
            // Game complete
            if (selectedLanguage) {
                setCompletedLevels(prev => [...new Set([...prev, selectedLanguage])]);
                currentUser.totalPoints += score;
            }
            setGameMode('result');
        }
    };

    const renderGameMenu = () => (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-cyan-500/10 to-emerald-500/20 p-8 border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                            <Gamepad2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Code Games</h1>
                            <p className="text-sm text-white/50">Learn programming through interactive challenges</p>
                        </div>
                    </div>
                    <p className="text-white/60 max-w-xl">
                        Master programming languages by solving puzzles, debugging code, and racing against the clock.
                        Earn XP, build streaks, and level up your coding skills!
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <Trophy size={18} />
                        <span className="text-xs font-medium">Total XP</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{currentUser.totalPoints + totalXpEarned}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                        <Flame size={18} />
                        <span className="text-xs font-medium">Current Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{streak}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle size={18} />
                        <span className="text-xs font-medium">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{completedLevels.length}/{LANGUAGES.length}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                        <Star size={18} />
                        <span className="text-xs font-medium">Level</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.floor((currentUser.totalPoints + totalXpEarned) / 100) + 1}</p>
                </div>
            </div>

            {/* Game Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => setGameMode('select-language')}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Puzzle className="text-cyan-400 mb-3" size={28} />
                    <h3 className="text-lg font-bold text-white mb-1">Quick Challenge</h3>
                    <p className="text-sm text-white/50">Solve coding puzzles and earn XP</p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-cyan-400 transition-colors" />
                </button>

                <button
                    onClick={() => setGameMode('select-language')}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 border border-white/10 hover:border-orange-500/30 transition-all text-left"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Bug className="text-orange-400 mb-3" size={28} />
                    <h3 className="text-lg font-bold text-white mb-1">Debug Mode</h3>
                    <p className="text-sm text-white/50">Find and fix code errors</p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-orange-400 transition-colors" />
                </button>

                <button
                    onClick={() => setGameMode('select-language')}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 border border-white/10 hover:border-emerald-500/30 transition-all text-left"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Keyboard className="text-emerald-400 mb-3" size={28} />
                    <h3 className="text-lg font-bold text-white mb-1">Speed Typing</h3>
                    <p className="text-sm text-white/50">Type code as fast as you can</p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                    onClick={() => setGameMode('select-language')}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Code className="text-pink-400 mb-3" size={28} />
                    <h3 className="text-lg font-bold text-white mb-1">Output Prediction</h3>
                    <p className="text-sm text-white/50">Predict code execution results</p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-pink-400 transition-colors" />
                </button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                    <Award size={16} /> Recent Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: '🎯', name: 'First Steps', desc: 'Complete first challenge', unlocked: completedLevels.length > 0 },
                        { icon: '🔥', name: 'On Fire', desc: '5 streak in a row', unlocked: streak >= 5 },
                        { icon: '⚡', name: 'Speed Demon', desc: 'Answer in under 5s', unlocked: false },
                        { icon: '🏆', name: 'Champion', desc: 'Complete all levels', unlocked: completedLevels.length === LANGUAGES.length },
                        { icon: '🐍', name: 'Python Pro', desc: 'Master Python', unlocked: completedLevels.includes('python') },
                        { icon: '⚡', name: 'JS Ninja', desc: 'Master JavaScript', unlocked: completedLevels.includes('javascript') },
                        { icon: '☕', name: 'Java Master', desc: 'Master Java', unlocked: completedLevels.includes('java') },
                        { icon: '💎', name: 'Perfectionist', desc: '100% on a level', unlocked: false },
                    ].map((achievement, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg border ${achievement.unlocked
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-white/[0.02] border-white/[0.04] opacity-50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{achievement.icon}</div>
                            <p className="text-xs font-medium text-white/80">{achievement.name}</p>
                            <p className="text-[10px] text-white/40">{achievement.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderLanguageSelect = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setGameMode('menu')}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    ← Back
                </button>
                <h2 className="text-xl font-bold text-white">Choose Your Language</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {LANGUAGES.map((lang) => {
                    const isCompleted = completedLevels.includes(lang.id);
                    const questions = QUESTIONS_DB.filter(q => q.language === lang.id);
                    return (
                        <motion.button
                            key={lang.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startGame(lang.id)}
                            className="relative group overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all p-5 text-left"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-3xl">{lang.icon}</span>
                                    {isCompleted && (
                                        <CheckCircle size={18} className="text-emerald-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{lang.name}</h3>
                                <p className="text-xs text-white/40">{questions.length} challenges</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${lang.color} transition-all`}
                                            style={{ width: isCompleted ? '100%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    const renderPlaying = () => {
        if (!currentQuestion) return null;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setGameMode('select-language')}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            ← Exit
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{LANGUAGES.find(l => l.id === selectedLanguage)?.icon}</span>
                            <span className="text-sm font-medium text-white/60">
                                {LANGUAGES.find(l => l.id === selectedLanguage)?.name}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Zap size={14} className="text-amber-400" />
                            <span className="text-sm font-bold text-amber-400">{score} XP</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <Flame size={14} className="text-orange-400" />
                            <span className="text-sm font-bold text-orange-400">{streak}🔥</span>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-white/40">
                        {currentQuestionIndex + 1}/{currentQuestions.length}
                    </span>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft <= 10 ? 'bg-red-500/20 border-red-500/30' : 'bg-white/[0.03] border-white/[0.06]'} border`}>
                        <Timer size={16} className={timeLeft <= 10 ? 'text-red-400' : 'text-white/40'} />
                        <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>

                {/* Question Card */}
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden"
                >
                    {/* Question Type Badge */}
                    <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentQuestion.type === 'multiple-choice' && <Target size={16} className="text-cyan-400" />}
                            {currentQuestion.type === 'fill-blank' && <Puzzle size={16} className="text-violet-400" />}
                            {currentQuestion.type === 'debug' && <Bug size={16} className="text-orange-400" />}
                            {currentQuestion.type === 'typing' && <Keyboard size={16} className="text-emerald-400" />}
                            {currentQuestion.type === 'code-output' && <Code size={16} className="text-pink-400" />}
                            {currentQuestion.type === 'true-false' && <CheckCircle size={16} className="text-blue-400" />}
                            <span className="text-xs font-medium text-white/60 capitalize">
                                {currentQuestion.type.replace('-', ' ')}
                            </span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${currentQuestion.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                            currentQuestion.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>

                    {/* Question Content */}
                    <div className="p-6">
                        <p className="text-lg text-white mb-4">{currentQuestion.question}</p>

                        {/* Code Block */}
                        {currentQuestion.code && (
                            <div className="bg-black/40 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                                <pre className="text-cyan-300 whitespace-pre-wrap">{currentQuestion.code}</pre>
                            </div>
                        )}

                        {/* Answer Options */}
                        {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'debug' ||
                            currentQuestion.type === 'code-output' || currentQuestion.type === 'true-false' ? (
                            <div className="space-y-2">
                                {currentQuestion.options?.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={showExplanation}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${showExplanation
                                            ? i === currentQuestion.correctAnswer
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : selectedAnswer === i
                                                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                                    : 'bg-white/[0.02] border-white/[0.06] text-white/60'
                                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-cyan-500/30 text-white/80'
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !showExplanation) {
                                            handleAnswer(userInput);
                                        }
                                    }}
                                    disabled={showExplanation}
                                    placeholder="Type your answer..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 font-mono"
                                    autoFocus
                                />
                                {!showExplanation && (
                                    <button
                                        onClick={() => handleAnswer(userInput)}
                                        disabled={!userInput.trim()}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Answer
                                    </button>
                                )}
                                {showExplanation && (
                                    <div className={`p-3 rounded-xl ${isCorrect ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                        <p className={`text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                                            Correct answer: <span className="font-mono font-bold">{currentQuestion.correctAnswer}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                        {showExplanation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/[0.06]"
                            >
                                <div className="p-6 bg-white/[0.02]">
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                                        ) : (
                                            <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isCorrect ? 'Correct!' : 'Incorrect'}
                                            </p>
                                            <p className="text-sm text-white/60">{currentQuestion.explanation}</p>
                                            {isCorrect && (
                                                <p className="text-xs text-amber-400 mt-2">
                                                    +{currentQuestion.xp} XP
                                                    {timeLeft > 0 && ` (+${Math.floor((timeLeft / (currentQuestion.timeLimit || 30)) * 10)} time bonus)`}
                                                    {streak > 1 && ` (+${(streak - 1) * 2} streak bonus)`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                                    >
                                        {currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'See Results'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    };

    const renderResult = () => {
        const percentage = Math.round((score / currentQuestions.reduce((acc, q) => acc + q.xp, 0)) * 100);
        const isNewHighScore = true; // For demo purposes

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30">
                        <Trophy size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete!</h2>
                    <p className="text-white/50">
                        {LANGUAGES.find(l => l.id === selectedLanguage)?.name} Challenge
                    </p>
                </motion.div>

                {/* Score Card */}
                <div className="w-full max-w-md bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                            {score}
                        </p>
                        <p className="text-sm text-white/40 mt-1">XP Earned</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">{currentQuestions.length}</p>
                            <p className="text-xs text-white/40">Questions</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-400">{streak}</p>
                            <p className="text-xs text-white/40">Best Streak</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-400">{percentage}%</p>
                            <p className="text-xs text-white/40">Efficiency</p>
                        </div>
                    </div>

                    {isNewHighScore && (
                        <div className="flex items-center justify-center gap-2 text-amber-400">
                            <Sparkles size={16} />
                            <span className="text-sm font-medium">New High Score!</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => selectedLanguage && startGame(selectedLanguage)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-medium hover:bg-white/[0.08] transition-colors"
                    >
                        <RotateCcw size={18} />
                        Play Again
                    </button>
                    <button
                        onClick={() => setGameMode('select-language')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold hover:opacity-90 transition-opacity"
                    >
                        More Languages
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative h-[calc(100vh-120px)] w-full overflow-y-auto custom-scrollbar bg-black/50" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden fixed-bg">
                <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
            </div>
            <div className="relative z-10 w-full min-h-full">
                <AnimatePresence mode="wait">
                    {gameMode === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {renderGameMenu()}
                        </motion.div>
                    )}
                    {gameMode === 'select-language' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {renderLanguageSelect()}
                        </motion.div>
                    )}
                    {gameMode === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {renderPlaying()}
                        </motion.div>
                    )}
                    {gameMode === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {renderResult()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
