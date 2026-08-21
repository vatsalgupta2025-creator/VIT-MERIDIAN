// ============================================================
// SYNAPSE — Mock Backend API Simulation
// ============================================================

import { resources, type Resource } from './mockData';

/**
 * Semantic search simulation with fuzzy matching
 */
export function searchResources(query: string): Resource[] {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(/\s+/);

    const scored = resources.map(r => {
        let score = 0;
        const searchable = `${r.title} ${r.category} ${r.course} ${r.tags.join(' ')} ${r.summary}`.toLowerCase();

        for (const term of terms) {
            if (searchable.includes(term)) {
                score += 10;
                // Boost for title match
                if (r.title.toLowerCase().includes(term)) score += 15;
                // Boost for tag match
                if (r.tags.some(t => t.includes(term))) score += 8;
                // Boost for course match
                if (r.course.toLowerCase().includes(term)) score += 5;
            }
        }

        // Trust score bonus
        score += r.trust / 20;

        return { resource: r, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.resource);
}

/**
 * Simulate AI summary generation with delay
 */
export function summarizeResource(resourceId: number): Promise<string> {
    return new Promise((resolve) => {
        const resource = resources.find(r => r.id === resourceId);
        setTimeout(() => {
            resolve(resource?.summary || "No summary available for this resource.");
        }, 800 + Math.random() * 1200);
    });
}

/**
 * Get autocomplete suggestions
 */
export function getAutocompleteSuggestions(query: string): string[] {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();

    const allTerms = new Set<string>();
    resources.forEach(r => {
        // Extract meaningful terms
        const words = r.title.replace(/[_.-]/g, ' ').split(/\s+/);
        words.forEach(w => {
            if (w.length > 2 && w.toLowerCase().includes(q)) {
                allTerms.add(r.title.replace(/[_]/g, ' ').replace(/\.\w+$/, ''));
            }
        });
        r.tags.forEach(t => {
            if (t.toLowerCase().includes(q)) {
                allTerms.add(t.charAt(0).toUpperCase() + t.slice(1));
            }
        });
    });

    return Array.from(allTerms).slice(0, 6);
}

/**
 * Get random engagement stats variation
 */
export function getUserProgress() {
    return {
        attendance: 82 + Math.floor(Math.random() * 15),
        resourceAccess: 55 + Math.floor(Math.random() * 30),
        socialEngagement: 70 + Math.floor(Math.random() * 25),
        systemUsage: 65 + Math.floor(Math.random() * 25),
        weeklyTrend: Array.from({ length: 7 }, () => Math.floor(30 + Math.random() * 70)),
    };
}

/**
 * Simulate AI insight generation
 */
export function generateInsight(engagement: {
    attendance: number;
    academicResources: number;
    socialLife: number;
    systemUsage: number;
}): string {
    const insights: string[] = [];

    if (engagement.socialLife > engagement.academicResources + 15) {
        insights.push(
            "📊 Detected: High social engagement but lower resource usage. Recommend: Dedicate 2 focused study sessions this week — try the Physics Office Hours on Tuesday."
        );
    }
    if (engagement.attendance > 85) {
        insights.push(
            "✅ Great attendance consistency! Students with your pattern score 23% higher on midterms. Keep it up."
        );
    }
    if (engagement.academicResources < 65) {
        insights.push(
            "💡 Your resource access is below the cohort average. Students who scored top quartile accessed 4 more resources than you have so far. Check the Knowledge Mesh for curated recommendations."
        );
    }
    if (engagement.systemUsage > 75) {
        insights.push(
            "🚀 Power user detected! You're in the top 20% for platform engagement. Consider becoming a peer mentor to earn bonus XP."
        );
    }

    return insights[Math.floor(Math.random() * insights.length)] ||
        "📈 Your engagement profile is balanced. Keep maintaining steady resource access for optimal exam preparation.";
}
