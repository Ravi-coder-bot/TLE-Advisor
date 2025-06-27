import rawCurated from '@/data/curatedProblems.json';
import { CuratedProblems, Problem } from '@/types/index';

const curated = rawCurated as CuratedProblems;

export default function suggestProblems(stats: any) {
  const weak = stats.weakTopics.map((t: any) => t.tag);
  const suggestions: { tag: string; problems: Problem[] }[] = [];

  for (const tag of weak) {
    if (curated[tag]) {
      suggestions.push({
        tag,
        problems: curated[tag].slice(0, 3),
      });
    }
  }

  return suggestions;
}
