<div align="center">

# 🚀 VIT-MERIDIAN — The Smart Campus OS

### *One platform. Every student need. Powered by AI.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-orange?logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

**🏆 Built for hackathon. Designed for real life. Made by students, for students.**

[Live Demo](#) · [Video Walkthrough](#) · [Team](#-team)

</div>

---

## 💡 The Problem We're Solving

> *Every day, a VIT student wakes up, scrambles to check their timetable on one app, tracks attendance on another, hunts for PYQs in scattered WhatsApp groups, stresses about the upcoming TFW form on the VTOP portal, and desperately tries to find a roommate for next semester — all before 8 AM.*

Campus life is fragmented. Students juggle **10+ apps, 5+ portals, and countless WhatsApp groups** just to survive a single semester. Critical information lives in silos. Administrative processes are manual, slow, and opaque. And through it all, there's zero intelligent layer helping students make better decisions.

**VIT-MERIDIAN is the operating system layer that unifies it all — with AI at the core.**

---

## ✨ What is VIT-MERIDIAN?

VIT-MERIDIAN is a **full-stack, AI-powered Smart Campus Platform** built specifically for VIT students. Think of it as your personal campus co-pilot — part productivity suite, part AI mentor, part social network, all wrapped in a stunning, OS-like interface that feels native to your screen.

It doesn't just aggregate information. It **understands context, predicts needs, and takes action** on your behalf.

---

## 🔥 Feature Showcase

### 🧠 AI-Powered Core

| Feature | Description |
|---|---|
| **🎙️ AI Mock Interview** | Real-time voice-to-voice mock interviews powered by Gemini 2.0 Flash. MediaPipe face detection tracks your body language live. Get actual, contextual feedback — not canned answers. |
| **📚 AI Study Buddy** | Paste any notes or topic. Instantly generates flashcards, structured summaries, and MCQ quizzes. Spaced repetition built-in. |
| **🗺️ AI Career Roadmap** | Gemini analyses your branch, year, and interests to generate a personalised, month-by-month skill roadmap with curated resources. |
| **🤖 AI Chat (VIT Assistant)** | A context-aware chat interface tuned specifically on VIT campus knowledge — hostels, mess, clubs, academics, and more. |
| **📝 Answer Key Manager** | Upload PYQs or exam photos. AI extracts, evaluates, and auto-grades answers with detailed explanations. |
| **🧭 Mr. Vighelp** | A floating AI campus concierge — always one click away for instant help. |

---

### 📚 Academic Intelligence

| Feature | Description |
|---|---|
| **⏰ Timetable Helper** | Smart timetable builder with conflict detection, faculty lookups, and one-click export. |
| **📊 Attendance Tracker** | Know exactly how many classes you can safely bunk. Visual threshold alerts and per-subject breakdowns. |
| **📖 Study Materials** | Peer-uploaded, AI-tagged study resources. Search by subject, topic, or exam type. |
| **⚡ Visual Algorithms** | Animated, step-by-step CS algorithm visualiser. AVL trees, Dijkstra, sorting — watch code come alive. |
| **🔍 Oracle Search** | Semantic campus search engine — find anything from faculty names to hostel rules. |

---

### 🏛️ Campus Life

| Feature | Description |
|---|---|
| **🗺️ Campus Explorer** | Interactive 3D-style VIT campus map. Find buildings, labs, and facilities in seconds. |
| **🏠 Roommate Match** | Preference-based roommate matching: block, mess, AC preference, sleep schedule, social style. AI-calculated compatibility scores. |
| **📋 Lost & Found** | Campus-wide digital lost & found board with photo uploads and real-time claim tracking. |
| **🤝 Group Study** | Create or join study groups by subject. Integrated whiteboard and resource sharing. |
| **🎭 Clubs & Events** | Discover every active club, upcoming event, and open registration — all in one feed. |
| **📊 Quick Poll** | Create and share instant polls with your classmates. Real-time results visualisation. |

---

### 💼 Career & Growth

| Feature | Description |
|---|---|
| **🎯 Career Hub** | Resume builder, job board curated for VIT students, LinkedIn-style skill endorsements, and interview prep tracks. |
| **🎮 Code Games** | Gamified coding challenges to sharpen DSA skills. Leaderboard, streaks, and XP system. |
| **🏅 Leaderboard** | Campus-wide ranking system based on academic performance, participation, and platform activity. |
| **📖 Learning Hub** | Curated YouTube playlist recommender + AI summariser for any tech topic. |

---

### ⚙️ Productivity Suite

| Feature | Description |
|---|---|
| **💰 Budget Tracker** | Monthly budget planner with expense categories, visual charts, and AI spending advice. |
| **🔐 Focus Mode** | Distraction-free study mode with Pomodoro timer and ambient soundscapes. |
| **📁 File Share** | Secure peer-to-peer file sharing within the campus network. Zero friction, no external storage required. |
| **📝 Note Share** | Collaborative markdown note-taking with version history and subject tagging. |
| **📋 Admin Automation** | Auto-fills and submits common VTOP forms (NOC, leave letters, fee receipts) with a few clicks. |
| **📡 Smart Briefing** | Personalised morning digest — weather, today's classes, upcoming deadlines, campus news. |
| **📅 Calendar** | Unified academic calendar merging timetable, deadlines, events, and exams. |

---

## 🎨 The Experience

VIT-MERIDIAN isn't just functional — it's **visually arresting**.

- **Boot Screen** — A cinematic, animated OS boot sequence on first load
- **Shader Backgrounds** — Three.js WebGL aurora shaders breathe life into every page
- **MediaPipe Face Tracking** — Real-time face detection overlaid on your live camera feed during mock interviews
- **Framer Motion** — Every transition, panel, and card is meticulously animated
- **Dark-first Design** — A deep `#040812` base with violet-cyan gradient accents
- **Glassmorphism** — `backdrop-blur` layering throughout for depth and premium feel

---

## 🏗️ Architecture

```
vit-meridian/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main OS shell with router
│   │   └── layout.tsx
│   ├── components/             # 45+ feature modules
│   │   ├── AiMockInterview.tsx # Real-time AI interview + face tracking
│   │   ├── StudyBuddy.tsx      # AI flashcard / quiz generator
│   │   ├── CareerHub.tsx       # Career planning platform
│   │   ├── VisualAlgorithms.tsx# Algorithm visualiser
│   │   ├── CampusExplorer.tsx  # Interactive campus map
│   │   ├── RoommateMatch.tsx   # Preference-based matching
│   │   ├── BudgetTracker.tsx   # AI budget advisor
│   │   ├── AttendanceTracker.tsx
│   │   ├── AdminAutomation.tsx
│   │   └── ... (35+ more)
│   ├── components/ui/          # Design system
│   │   ├── animated-shader-background.tsx  # Three.js aurora
│   │   ├── shader-lines.tsx    # WebGL line shaders
│   │   └── animated-ai-chat.tsx
│   └── data/
│       └── mockData.ts         # Campus data layer
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + custom CSS |
| **Animation** | Framer Motion |
| **3D/Shaders** | Three.js, OGL |
| **AI** | Google Gemini 2.0 Flash API |
| **Vision** | MediaPipe Tasks Vision (TFLite) |
| **Speech** | Web Speech API (recognition + synthesis) |
| **Charts** | Chart.js + React-ChartJS-2 |
| **Icons** | Lucide React |

---

## ⚡ Pain Points Eliminated

| Before VIT-MERIDIAN | After VIT-MERIDIAN |
|---|---|
| 10+ apps for daily campus tasks | 1 unified platform |
| VTOP portal crashes during exams | Offline-ready cached views |
| WhatsApp hunting for PYQs | Semantic search in seconds |
| Mock interviews with no feedback | Real-time AI + body language analysis |
| Roommate roulette | Compatibility-scored matching |
| Manual attendance math | Automated bunk calculator |
| Paper-based lost & found | Digital, searchable, realtime |
| Budget managed in Notes app | AI-powered visual finance tracker |
| Admin forms take days | Auto-filled in clicks |

---

## 🛠️ Getting Started

```bash
# Clone the repository
git clone https://github.com/vatsalgupta2025-creator/VIT-MERIDIAN.git
cd VIT-MERIDIAN

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — and experience the boot sequence.

---

## 🔑 Environment Variables

```env
# Optional — API keys are pre-configured for demo
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

---

## 📈 Impact By Numbers

| Metric | Value |
|---|---|
| Feature Modules | **45+** |
| AI-Powered Features | **8** |
| Student Pain Points Addressed | **20+** |
| Lines of Code | **~15,000+** |
| Pages / Sections | **30+** |
| Time to Build | **Hackathon Sprint** |

---

## 🏆 Why VIT-MERIDIAN Wins

1. **Depth over breadth** — Every single module is fully functional, not a mockup
2. **Real AI, not chatbots** — Gemini 2.0 Flash with multimodal input (text + camera frames) for genuine intelligence
3. **Built by students who live this** — Every pain point here is real. We experienced every one of them
4. **A platform that scales** — Architecture designed to plug into actual VTOP APIs, SSO, and real-time data
5. **It's beautiful** — A campus tool that students will *actually want to open*

> "We didn't build a hackathon project. We built the app we wish existed when we started college."

---

## 👥 Team

| Name | Role |
|---|---|
| **Vatsal Gupta** | Full-Stack Lead, AI Integration |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ at VIT · Powered by Gemini · Designed to win**

*The campus deserves better. We built it.*

</div>
