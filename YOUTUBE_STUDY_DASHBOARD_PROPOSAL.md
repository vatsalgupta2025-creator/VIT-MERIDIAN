# YouTube Study Dashboard — Integration Proposal

## 1. Objective
Integrate a centralized **YouTube Study Dashboard** into the existing Learning Hub that allows students to:
- Track study progress across YouTube-based courses
- Access curated, topic-wise educational playlists
- Maintain watch history with auto-bookmarking
- Generate AI quizzes from watched content
- Visualize learning streaks and weekly heatmaps

## 2. Current State Analysis
The codebase already has two learning-related components:

| Component | Purpose | Gaps |
|-----------|---------|------|
| `LearningHub.tsx` | Course catalog, leaderboard, video player modal, quiz system | No YouTube search/discovery, no progress dashboard, no playlist organization |
| `LearningComponent.tsx` | YouTube search + watch + quiz | Standalone, not integrated with dashboard metrics, hardcoded categories, no persistence |

**Existing assets to reuse:**
- `src/lib/youtubeApi.ts` — search, playlist, video details
- `src/lib/quizGenerator.ts` — AI quiz generation
- `src/types/learning.ts` — type definitions
- `src/data/learningData.ts` — mock courses, quizzes, leaderboard

## 3. Proposed Architecture

```
src/components/learning/
├── YouTubeStudyDashboard.tsx   # Main dashboard shell
├── ProgressTracker.tsx         # Heatmap, streaks, stats
├── CourseCatalog.tsx           # Curated playlists / courses grid
├── VideoPlayer.tsx             # Embedded YouTube player + notes
├── QuizPanel.tsx               # Inline quiz after video
├── WatchHistory.tsx            # Chronological history list
└── ContinueWatching.tsx        # Resume from where left off
```

## 4. Feature Breakdown

### 4.1 Dashboard Overview
- **Top stats row**: Total videos watched, hours spent, current streak, XP earned
- **Weekly heatmap**: GitHub-style activity graph (already partially implemented in `LearningComponent.tsx`)
- **Continue watching**: Cards showing partially watched videos with progress bars
- **Recommended next**: Based on watch history + course enrollment

### 4.2 Course Catalog
- Pre-loaded curated playlists mapped to VIT syllabus (DSA, DBMS, OS, CN, ML, etc.)
- Each course card shows: thumbnail, instructor, total videos, duration, enrollment count, rating
- Filter by category: Computer Science, Mathematics, Physics, Web Development, ML/AI
- Difficulty badges: Beginner / Intermediate / Advanced

### 4.3 Video Player Experience
- Embedded YouTube iframe with custom overlay controls
- Auto-pause detection for progress tracking
- Post-video quiz generation (using `quizGenerator.ts`)
- Notes panel (timestamped notes tied to video timeline)
- “Mark as Complete” with XP reward

### 4.4 Progress Tracking
- **localStorage-backed** watch history and completion state
- Per-course completion percentage
- Subject-wise mastery score (derived from quiz performance)
- Daily/weekly goals with streak maintenance

### 4.5 Quiz Integration
- Auto-generate 5-question quiz after each video
- Show explanation after each answer
- Award XP based on accuracy + speed
- Track quiz history per video/course

## 5. Data Model Additions

```ts
// src/types/learning.ts

interface WatchProgress {
  videoId: string;
  courseId: string;
  watchedSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  notes: { time: number; text: string }[];
}

interface StudySession {
  id: string;
  videoId: string;
  startedAt: string;
  endedAt: string;
  completed: boolean;
  quizScore?: number;
  pointsEarned: number;
}

interface CuratedPlaylist {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoIds: string[];
  tags: string[];
  source: 'youtube' | 'vit' | 'user';
}
```

## 6. Implementation Plan

### Phase 1 — Dashboard Shell + Progress (Week 1)
1. Create `YouTubeStudyDashboard.tsx` as the new Learning Hub entry point
2. Integrate `ProgressTracker` with existing heatmap + streak logic
3. Add “Continue Watching” rail using `WatchProgress` model
4. Wire into `src/app/page.tsx` under `case 'learning'`

### Phase 2 — Course Catalog + Player (Week 2)
1. Build `CourseCatalog` with curated VIT-relevant playlists
2. Implement `VideoPlayer` with embedded YouTube + progress polling
3. Add localStorage persistence for `WatchProgress`
4. Connect to `youtubeApi.ts` for search/playlist resolution

### Phase 3 — Quiz + Gamification (Week 3)
1. Integrate `QuizPanel` after video completion
2. Hook into `quizGenerator.ts` for AI quiz generation
3. Add XP rewards and update `currentUser.totalPoints`
4. Build `WatchHistory` and “Resume” flow

### Phase 4 — Polish (Week 4)
1. Add dark-theme YouTube chrome, custom controls
2. Skeleton loaders, error states, empty states
3. Responsive layout for tablet/mobile
4. Unit tests for progress calculation and quiz scoring

## 7. UI/UX Design Notes
- Match existing VIT-MERIDIAN aesthetic: `var(--surface-base)`, `var(--accent-primary)`, glass cards
- Reuse `DashCard` pattern from `DashboardOverview.tsx`
- Sidebar nav item: “Learning Hub” → opens `YouTubeStudyDashboard`
- Bottom nav inside dashboard: Catalog | Continue | History | Stats

## 8. Technical Considerations
- **SSR**: All new components must be `'use client'`; YouTube iframe already dynamically imported where needed
- **API limits**: Cache search results in React state; fallback to mock data if quota exhausted
- **Storage**: Use `localStorage` keys prefixed with `vitgroww_learning_` to avoid collisions
- **Performance**: Lazy-load course thumbnails; debounce search input 300ms

## 9. Success Metrics
- Dashboard load time < 2s
- Video search results < 500ms
- Quiz generation < 3s
- Progress persistence across sessions
- Build passes with zero TypeScript errors

## 10. Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| YouTube API quota exhaustion | Cache aggressively; fallback to mock data; allow user-supplied API key |
| Large bundle size | Lazy-load `LearningHub` and `YouTubeStudyDashboard` via `dynamic()` |
| State sync between old/new learning components | Gradually migrate; keep `LearningComponent.tsx` as fallback during transition |

---

**Recommendation**: Approve Phase 1 and Phase 2 for immediate implementation. They deliver the highest user value (dashboard + catalog) while laying the foundation for gamification in later phases.
