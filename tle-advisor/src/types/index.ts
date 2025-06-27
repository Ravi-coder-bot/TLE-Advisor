export interface Problem {
  name: string;
  link: string;
  rating: number;
}

export interface CuratedProblems {
  [tag: string]: Problem[];
}
