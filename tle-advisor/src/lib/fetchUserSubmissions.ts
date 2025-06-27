import axios from 'axios';

export default async function fetchUserSubmissions(handle: string) {
  const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`;
  const response = await axios.get(url);
  const submissions = response.data.result;

  const accepted = submissions.filter((s: any) => s.verdict === 'OK');
  const solved = new Set();
  const problems: any[] = [];

  for (const sub of accepted) {
    const id = `${sub.problem.contestId}-${sub.problem.index}`;
    if (!solved.has(id)) {
      solved.add(id);
      problems.push(sub.problem);
    }
  }

  return problems;
}
