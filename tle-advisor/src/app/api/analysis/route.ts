import { NextRequest, NextResponse } from 'next/server';
import fetchUserSubmissions from '@/lib/fetchUserSubmissions';
import analyzePerformance from '@/lib/analyzePerformance';
import suggestProblems from '@/lib/suggestProblems';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Missing handle' }, { status: 400 });
  }

  try {
    const submissions = await fetchUserSubmissions(handle);
    const stats = analyzePerformance(submissions);
    const suggestions = suggestProblems(stats);

    return NextResponse.json({ handle, stats, suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
