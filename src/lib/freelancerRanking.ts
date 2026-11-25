import type { SearchGigResult } from '@/hooks/useGigSearch';

export interface RankedFreelancer {
  id: string;
  name: string;
  avatar: string;
  username: string | null;
  skill: string;
  rating: number;
  reviews: number;
  completedOrders: number;
  score: number;
}

/** Score 0–100 from real data: rating 60%, completed orders 30%, review volume 10%. */
export const performanceScore = (rating: number, completed: number, reviews: number) => {
  const r = reviews > 0 ? Math.min(Math.max(rating, 0), 5) / 5 : 0;
  const c = Math.min(completed, 50) / 50;
  const v = Math.min(reviews, 50) / 50;
  return Math.round((r * 60 + c * 30 + v * 10) * 10) / 10;
};

/** Only freelancers with at least one completed order are eligible; no invented data. */
export const rankFreelancers = (gigs: SearchGigResult[], limit = 10): RankedFreelancer[] => {
  const map = new Map<string, RankedFreelancer>();
  for (const g of gigs) {
    const cur = map.get(g.freelancerId);
    const completed = Math.max(cur?.completedOrders ?? 0, g.completedOrders ?? 0);
    const reviews = Math.max(cur?.reviews ?? 0, g.reviews ?? 0);
    const rating = Math.max(cur?.rating ?? 0, g.rating ?? 0);
    map.set(g.freelancerId, {
      id: g.freelancerId,
      name: g.freelancer,
      avatar: g.freelancerAvatar,
      username: g.freelancerUsername,
      skill: cur?.skill ?? g.title,
      rating, reviews, completedOrders: completed,
      score: performanceScore(rating, completed, reviews),
    });
  }
  return [...map.values()]
    .filter((f) => f.completedOrders >= 1)
    .sort((a, b) => b.score - a.score || b.completedOrders - a.completedOrders)
    .slice(0, limit);
};
