// ============================================================
// SYNAPSE — Mock Data Layer
// All simulated data for hackathon demo
// ============================================================

export interface Resource {
  id: number;
  title: string;
  type: 'PDF' | 'PPTX' | 'VIDEO' | 'DOCX' | 'CODE' | 'NOTES';
  category: string;
  trust: number;
  author: string;
  date: string;
  course: string;
  summary: string;
  tags: string[];
  views: number;
  rating: number;
  url: string;
}

export const resources: Resource[] = [
  {
    id: 1,
    title: "CS401_Week7_Advanced_Algorithms_Master.pdf",
    type: "PDF",
    category: "Study",
    trust: 98,
    author: "Prof. Rajesh Kumar",
    date: "2025-02-18",
    course: "CS401 — Advanced Algorithms",
    summary: "Comprehensive guide to advanced algorithmic paradigms including dynamic programming, greedy strategies, and amortized analysis. Covers Master Theorem applications with detailed proof walkthroughs and 15 worked examples from competitive programming.",
    tags: ["algorithms", "dynamic programming", "greedy", "complexity"],
    views: 847,
    rating: 4.9,
    url: 'https://drive.google.com/file/d/mockResource1/view',
  },
  {
    id: 2,
    title: "Database_Normalization_Complete_Guide.pdf",
    type: "PDF",
    category: "Study",
    trust: 95,
    author: "Prof. Sarah Chen",
    date: "2025-02-15",
    course: "CS201 — Database Systems",
    summary: "Explains all normal forms (1NF through BCNF) with real-world schema examples. Includes decomposition algorithms, functional dependency diagrams, and a complete case study normalizing a university enrollment database from scratch.",
    tags: ["database", "normalization", "SQL", "schema design"],
    views: 1203,
    rating: 4.8,
    url: 'https://drive.google.com/file/d/mockResource2/view',
  },
  {
    id: 3,
    title: "React_Hooks_Advanced_Patterns_Cheatsheet.pdf",
    type: "PDF",
    category: "Tutorial",
    trust: 92,
    author: "TA Priya Sharma",
    date: "2025-02-20",
    course: "CS301 — Web Development",
    summary: "A concise but thorough guide to React Hooks including useState, useEffect, useContext, useReducer, useMemo, and custom hooks. Covers common anti-patterns, performance optimization techniques, and real-world component architecture patterns.",
    tags: ["react", "hooks", "javascript", "frontend"],
    views: 2156,
    rating: 4.7,
    url: 'https://drive.google.com/file/d/mockResource3/view',
  },
  {
    id: 4,
    title: "Thermodynamics_Lecture4_Heat_Engines.pptx",
    type: "PPTX",
    category: "Lecture",
    trust: 97,
    author: "Prof. Michael Torres",
    date: "2025-02-19",
    course: "PHY201 — Thermodynamics",
    summary: "Lecture covering Carnot cycle, Otto cycle, and Diesel cycle heat engines. Includes efficiency calculations, T-S diagrams, and a comparative analysis of real-world engine implementations with worked numerical problems.",
    tags: ["thermodynamics", "heat engines", "carnot", "physics"],
    views: 567,
    rating: 4.6,
    url: 'https://drive.google.com/file/d/mockResource4/view',
  },
  {
    id: 5,
    title: "Machine_Learning_Linear_Regression_Deep_Dive.pdf",
    type: "PDF",
    category: "Study",
    trust: 94,
    author: "Prof. Emily Watson",
    date: "2025-02-17",
    course: "CS501 — Machine Learning",
    summary: "From simple linear regression to ridge and lasso regularization. Covers gradient descent optimization, feature scaling, polynomial regression, and model evaluation with cross-validation. Includes Python code examples using scikit-learn.",
    tags: ["machine learning", "regression", "gradient descent", "python"],
    views: 934,
    rating: 4.8,
    url: 'https://drive.google.com/file/d/mockResource5/view',
  },
  {
    id: 6,
    title: "Data_Structures_LinkedList_Operations_Explained.pdf",
    type: "PDF",
    category: "Study",
    trust: 96,
    author: "Prof. James Wilson",
    date: "2025-02-14",
    course: "CS102 — Data Structures",
    summary: "Complete reference for singly, doubly, and circular linked list operations. Covers insertion, deletion, reversal, cycle detection (Floyd's algorithm), and merge operations with visual diagrams and C++ implementations.",
    tags: ["data structures", "linked list", "algorithms", "C++"],
    views: 1876,
    rating: 4.9,
    url: 'https://drive.google.com/file/d/mockResource6/view',
  },
  {
    id: 7,
    title: "Operating_Systems_Process_Scheduling_Algorithms.pptx",
    type: "PPTX",
    category: "Lecture",
    trust: 93,
    author: "Prof. David Park",
    date: "2025-02-16",
    course: "CS302 — Operating Systems",
    summary: "Detailed walkthrough of CPU scheduling: FCFS, SJF, Priority, Round Robin, and Multilevel Queue. Includes Gantt chart examples, turnaround/waiting time calculations, and a comparison of preemptive vs non-preemptive approaches.",
    tags: ["operating systems", "scheduling", "processes", "CPU"],
    views: 723,
    rating: 4.5,
    url: 'https://drive.google.com/file/d/mockResource7/view',
  },
  {
    id: 8,
    title: "Calculus_III_Vector_Fields_and_Stokes_Theorem.pdf",
    type: "PDF",
    category: "Study",
    trust: 91,
    author: "Prof. Anna Martinez",
    date: "2025-02-13",
    course: "MATH301 — Multivariable Calculus",
    summary: "Covers line integrals, surface integrals, Green's theorem, Stokes' theorem, and the Divergence theorem. Rich with 3D visualizations of vector fields and step-by-step proof explanations tailored for engineering students.",
    tags: ["calculus", "vector fields", "stokes theorem", "mathematics"],
    views: 445,
    rating: 4.4,
    url: 'https://drive.google.com/file/d/mockResource8/view',
  },
  {
    id: 9,
    title: "Neural_Networks_Backpropagation_Tutorial.mp4",
    type: "VIDEO",
    category: "Tutorial",
    trust: 89,
    author: "TA Alex Rivera",
    date: "2025-02-21",
    course: "CS501 — Machine Learning",
    summary: "45-minute video tutorial explaining backpropagation from scratch. Starts with computational graphs, derives chain rule applications, and builds a neural network from scratch in NumPy. Includes visualization of gradient flow through layers.",
    tags: ["neural networks", "backpropagation", "deep learning", "tutorial"],
    views: 1567,
    rating: 4.7,
    url: 'https://drive.google.com/file/d/mockResource9/view',
  },
  {
    id: 10,
    title: "Discrete_Mathematics_Graph_Theory_Proofs.pdf",
    type: "PDF",
    category: "Study",
    trust: 88,
    author: "Prof. Lisa Chang",
    date: "2025-02-12",
    course: "MATH202 — Discrete Mathematics",
    summary: "Collection of important graph theory proofs including Euler's formula, Kuratowski's theorem, graph coloring theorems, and Dijkstra's shortest path proof. Each proof is presented with intuition-first approach before formal notation.",
    tags: ["discrete math", "graph theory", "proofs", "mathematics"],
    views: 389,
    rating: 4.3,
    url: 'https://drive.google.com/file/d/mockResource10/view',
  },
  {
    id: 11,
    title: "Computer_Networks_TCP_UDP_Comparison_Guide.docx",
    type: "DOCX",
    category: "Study",
    trust: 86,
    author: "TA Kevin Lee",
    date: "2025-02-10",
    course: "CS303 — Computer Networks",
    summary: "Side-by-side comparison of TCP and UDP protocols covering connection establishment, flow control, congestion avoidance, header formats, and real-world use cases. Includes packet capture analysis examples using Wireshark.",
    tags: ["networking", "TCP", "UDP", "protocols"],
    views: 654,
    rating: 4.5,
    url: 'https://drive.google.com/file/d/mockResource11/view',
  },
  {
    id: 12,
    title: "Software_Engineering_Design_Patterns_Catalog.pdf",
    type: "PDF",
    category: "Study",
    trust: 93,
    author: "Prof. Robert Hughes",
    date: "2025-02-08",
    course: "CS402 — Software Engineering",
    summary: "Comprehensive catalog of Gang of Four design patterns with modern implementations in Java and TypeScript. Covers Singleton, Factory, Observer, Strategy, Decorator, and Adapter with UML diagrams and refactoring examples.",
    tags: ["design patterns", "software engineering", "OOP", "architecture"],
    views: 1123,
    rating: 4.8,
    url: 'https://drive.google.com/file/d/mockResource12/view',
  },
  {
    id: 13,
    title: "Cybersecurity_OWASP_Top10_Lab_Exercises.pdf",
    type: "PDF",
    category: "Lab",
    trust: 90,
    author: "Prof. Maria Santos",
    date: "2025-02-22",
    course: "CS405 — Cybersecurity",
    summary: "Hands-on lab guide for understanding OWASP Top 10 vulnerabilities. Each vulnerability includes a vulnerable code sample, exploitation walkthrough, and secure implementation fix. Uses Docker-based lab environments.",
    tags: ["cybersecurity", "OWASP", "web security", "lab"],
    views: 789,
    rating: 4.6,
    url: 'https://drive.google.com/file/d/mockResource13/view',
  },
  {
    id: 14,
    title: "Compiler_Design_Lexical_Analysis_Implementation.code",
    type: "CODE",
    category: "Study",
    trust: 85,
    author: "Student contributor: Arjun Patel",
    date: "2025-02-19",
    course: "CS404 — Compiler Design",
    summary: "Complete lexical analyzer implementation in Python with regular expression engine, NFA to DFA conversion, and token classification. Includes test suite with 20+ test cases covering edge cases and error recovery strategies.",
    tags: ["compiler design", "lexer", "automata", "python"],
    views: 234,
    rating: 4.2,
    url: 'https://drive.google.com/file/d/mockResource14/view',
  },
  {
    id: 15,
    title: "Artificial_Intelligence_Search_Algorithms_Notes.pdf",
    type: "NOTES",
    category: "Study",
    trust: 87,
    author: "Student contributor: Nina Patel",
    date: "2025-02-20",
    course: "CS403 — Artificial Intelligence",
    summary: "Detailed notes on uninformed and informed search: BFS, DFS, UCS, A*, IDA*, and RBFS. Includes heuristic design guidelines, optimality proofs, and complexity analysis tables with visual search tree diagrams for each algorithm.",
    tags: ["AI", "search algorithms", "heuristics", "BFS", "A*"],
    views: 678,
    rating: 4.5,
    url: 'https://drive.google.com/file/d/mockResource15/view',
  },
];

// ============================================================
// Workflow Data
// ============================================================

export interface WorkflowStage {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  assignee: string;
  timestamp: string;
  comment: string;
  estimatedCompletion?: string;
}

export interface WorkflowRequest {
  id: string;
  title: string;
  type: string;
  stages: WorkflowStage[];
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export const workflowRequests: WorkflowRequest[] = [
  {
    id: "EVT-2025-0218-001",
    title: "AI Club Annual Hackathon 2025",
    type: "Event Approval",
    createdAt: "Feb 18, 2025 — 10:32 AM",
    priority: "high",
    stages: [
      {
        id: 1,
        name: "Request Submitted",
        status: "completed",
        assignee: "You",
        timestamp: "Feb 18, 10:32 AM",
        comment: "Event funding request for ₹45,000 submitted with venue and logistics details.",
      },
      {
        id: 2,
        name: "Club Advisor Review",
        status: "completed",
        assignee: "Dr. Sarah Chen",
        timestamp: "Feb 18, 2:45 PM",
        comment: "Approved. Budget is reasonable. Recommend adding mentorship track.",
      },
      {
        id: 3,
        name: "Department Review",
        status: "in-progress",
        assignee: "James Wilson — Student Affairs",
        timestamp: "Feb 19, 9:00 AM",
        comment: "Under review. Checking venue availability for March 15.",
        estimatedCompletion: "Feb 20 by 5:00 PM",
      },
      {
        id: 4,
        name: "Finance Approval",
        status: "pending",
        assignee: "Finance Office",
        timestamp: "",
        comment: "Awaiting department clearance.",
        estimatedCompletion: "Feb 21",
      },
      {
        id: 5,
        name: "Final Confirmation",
        status: "pending",
        assignee: "Dean of Student Activities",
        timestamp: "",
        comment: "Final sign-off pending.",
        estimatedCompletion: "Feb 22",
      },
    ],
  },
  {
    id: "LVE-2025-0220-003",
    title: "Medical Leave — 3 Days",
    type: "Leave Request",
    createdAt: "Feb 20, 2025 — 08:15 AM",
    priority: "medium",
    stages: [
      {
        id: 1,
        name: "Request Submitted",
        status: "completed",
        assignee: "You",
        timestamp: "Feb 20, 8:15 AM",
        comment: "Medical leave request with doctor's certificate attached.",
      },
      {
        id: 2,
        name: "Faculty Advisor Review",
        status: "completed",
        assignee: "Prof. Rajesh Kumar",
        timestamp: "Feb 20, 11:30 AM",
        comment: "Approved. Get well soon. Assignment deadline extended by 3 days.",
      },
      {
        id: 3,
        name: "HOD Approval",
        status: "completed",
        assignee: "Dr. Anita Desai",
        timestamp: "Feb 20, 3:00 PM",
        comment: "Approved.",
      },
      {
        id: 4,
        name: "Records Updated",
        status: "completed",
        assignee: "System",
        timestamp: "Feb 20, 3:01 PM",
        comment: "Attendance records updated automatically.",
      },
    ],
  },
];

// ============================================================
// Notification / Smart Briefing Data
// ============================================================

export interface Notification {
  id: number;
  type: 'deadline' | 'resource' | 'event' | 'system' | 'achievement' | 'alert';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
  course?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export const notifications: Notification[] = [
  {
    id: 1,
    type: "deadline",
    title: "CS201 Assignment Due",
    description: "Database Normalization assignment due in 2 days. You've completed 3 of 5 queries.",
    time: "2 days left",
    read: false,
    icon: "⚠️",
    course: "CS201",
    urgency: "critical",
  },
  {
    id: 2,
    type: "resource",
    title: "New Verified Notes Added",
    description: "Structured Query Languages — comprehensive SQL cheatsheet uploaded by TA Priya.",
    time: "3 hours ago",
    read: false,
    icon: "📚",
    course: "CS201",
    urgency: "medium",
  },
  {
    id: 3,
    type: "event",
    title: "AI/ML Club Workshop Tomorrow",
    description: "Building Your First Neural Network — Workshop at Lab 301, 4:00 PM. 12 spots remaining.",
    time: "Tomorrow 4:00 PM",
    read: false,
    icon: "🎯",
    urgency: "medium",
  },
  {
    id: 4,
    type: "achievement",
    title: "Contribution Milestone!",
    description: "You've earned 150 XP this week. You're now a Top 10% Contributor in CS201!",
    time: "1 hour ago",
    read: false,
    icon: "🏆",
    urgency: "low",
  },
  {
    id: 5,
    type: "system",
    title: "System Maintenance Notice",
    description: "Scheduled maintenance from 2:00 AM — 4:00 AM tonight. Services may be briefly unavailable.",
    time: "Tonight",
    read: true,
    icon: "🔧",
    urgency: "low",
  },
  {
    id: 6,
    type: "deadline",
    title: "CS401 Problem Set Due",
    description: "Advanced Algorithms problem set on dynamic programming. 4 days remaining.",
    time: "4 days left",
    read: true,
    icon: "📝",
    course: "CS401",
    urgency: "high",
  },
  {
    id: 7,
    type: "resource",
    title: "Lecture Recording Available",
    description: "Thermodynamics Lecture 4 recording has been processed with AI transcript & key slides.",
    time: "5 hours ago",
    read: true,
    icon: "🎬",
    course: "PHY201",
    urgency: "medium",
  },
  {
    id: 8,
    type: "event",
    title: "Photography Club Meetup",
    description: "Weekend photo walk this Saturday. Meet at Main Gate, 7:00 AM. All skill levels welcome.",
    time: "This Saturday",
    read: true,
    icon: "📸",
    urgency: "low",
  },
  {
    id: 9,
    type: "alert",
    title: "Study Group Invitation",
    description: "Arjun Patel invited you to the CS401 Exam Prep study group. 4 members so far.",
    time: "30 min ago",
    read: false,
    icon: "👥",
    course: "CS401",
    urgency: "medium",
  },
];

// ============================================================
// Engagement / RUVI Data
// ============================================================

export interface EngagementData {
  attendance: number;
  academicResources: number;
  socialLife: number;
  systemUsage: number;
  contributions: number;
  consistency: number;
}

export const userEngagement: EngagementData = {
  attendance: 87,
  academicResources: 62,
  socialLife: 91,
  systemUsage: 78,
  contributions: 55,
  consistency: 73,
};

export const weeklyHeatmap: number[][] = [
  [3, 5, 2, 7, 4, 1, 0],
  [2, 6, 8, 3, 5, 2, 1],
  [4, 3, 7, 9, 6, 3, 0],
  [1, 4, 5, 8, 7, 4, 2],
];

export const heatmapLabels = {
  rows: ["Resources", "Assignments", "Forums", "Events"],
  cols: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

// ============================================================
// User Profile
// ============================================================

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  studentId: string;
  major: string;
  year: string;
  gpa: number;
  ruviScore: number;
  totalPoints: number;
  level: number;
  streak: number;
  rank: number;
}

export const currentUser: UserProfile = {
  name: "Ayush Upadhyay",
  email: "ayush.upadhyay@vitgroww.edu",
  avatar: "AU",
  studentId: "STU-2023-0847",
  major: "BTech CSE AIML",
  year: "3rd Year",
  gpa: 3.72,
  ruviScore: 74,
  totalPoints: 1250,
  level: 8,
  streak: 12,
  rank: 47,
};

// ============================================================
// Navigation Items
// ============================================================

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'search', label: 'Oracle Search', icon: 'Search' },
  { id: 'process', label: 'Process Hub', icon: 'GitBranch' },
  { id: 'pulse', label: 'Pulse Analytics', icon: 'Activity' },
  { id: 'briefing', label: 'Smart Briefing', icon: 'Bell' },
  { id: 'profile', label: 'Profile', icon: 'User' },
];
