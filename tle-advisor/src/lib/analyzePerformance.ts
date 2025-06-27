export default function analyzePerformance(problems: any[]) {
  const tagMap: Record<string, { count: number; ratingSum: number; ratings: number[] }> = {};

  for (const prob of problems) {
    if (!prob.tags) continue;
    for (const tag of prob.tags) {
      if (!tagMap[tag]) tagMap[tag] = { count: 0, ratingSum: 0, ratings: [] };
      tagMap[tag].count++;
      if (prob.rating) {
        tagMap[tag].ratingSum += prob.rating;
        tagMap[tag].ratings.push(prob.rating);
      }
    }
  }

  const weakTopics = Object.entries(tagMap)
    .filter(([_, data]) => data.count < 5)
    .map(([tag, data]) => ({ tag, count: data.count }));

  return {
    tagStats: tagMap,
    weakTopics,
  };
}
