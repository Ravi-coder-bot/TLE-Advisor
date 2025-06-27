
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const min = Number(req.nextUrl.searchParams.get('min'));
  const max = Number(req.nextUrl.searchParams.get('max'));
  const tags = req.nextUrl.searchParams.get('tags')?.split(',') || [];

  const cfRes = await fetch('https://codeforces.com/api/problemset.problems');
  const cfData = await cfRes.json();

  const allProblems = cfData.result.problems;

  const filtered = allProblems.filter((p: any) => {
    const rating = p.rating || 0;
    const matchTags = tags.length === 0 || tags.some(tag => p.tags.includes(tag));
    return rating >= min && rating <= max && matchTags;
  });

  return NextResponse.json({ problems: filtered.slice(0, 25) }); 
}
