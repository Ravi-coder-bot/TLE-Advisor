import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get('handle');
    const topicsParam = url.searchParams.get('topics');

    // Validate required parameters
    if (!handle) {
      return NextResponse.json({ error: 'Missing handle parameter' }, { status: 400 });
    }

    if (!topicsParam) {
      return NextResponse.json({ error: 'Missing topics parameter' }, { status: 400 });
    }

    // Validate environment variable
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Parse topics data
    let topicsData;
    try {
      topicsData = JSON.parse(topicsParam);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid topics data format' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedHandle = handle.trim();

    // Create detailed topic analysis for the prompt
    const topicAnalysis = topicsData.map((topic: any) => {
      return `• ${topic.tag}: ${topic.count} problems solved, average rating: ${topic.avgRating || 'N/A'}`;
    }).join('\n');

    const prompt = `
You are an expert competitive programming coach and Codeforces analyst.

Analyze the performance of the user with the following handle: ${sanitizedHandle}.

Below is the topic-wise weakness analysis of the user (including their average rating per topic and areas of low accuracy or slow submission times):
${topicAnalysis}
Your task:
Based on this data, create a personalized and adaptive 10-day competitive programming improvement plan.

For each of the 10 days, include:
Focus Topic(s): Choose from the user's weakest topics.

Rating Range to Practice:

Start at the user's current average rating in the topic.

Gradually increase up to +200 rating by Day 10 to build confidence and progression.

Trending Problems to Practice:

Suggest 2-3 popular or recent Codeforces problems on that topic within the rating range.

Prefer problems that are tagged well, have high upvotes, and are commonly recommended for learning.

Key Concepts to Review:

Mention the core theoretical concepts, techniques, and edge cases in that topic.

Practice Strategy Tips:

Provide tactical tips for improvement, like "brute-force first, then optimize", "analyze editorial after 45 mins", or "draw state transitions for DP".

Additional instructions:
Prefer topics where the user has lowest average rating or lowest accuracy in early days.

Progressively introduce harder variations (e.g., from "basic DFS" to "DFS with backtracking").

Output the plan in markdown format, day-by-day, with clear formatting, subheadings, and bullet points.

Be smart, concise, and practical — the goal is to improve rating while building confidence.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text();

    // Validate response
    if (!suggestion || suggestion.trim().length === 0) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    return NextResponse.json({ 
      suggestion: suggestion.trim(),
      handle: sanitizedHandle,
      analyzedTopics: topicsData
    });

  } catch (error: any) {
    console.error('[Gemini Error]', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json({ error: 'API quota exceeded' }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to generate AI suggestion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}