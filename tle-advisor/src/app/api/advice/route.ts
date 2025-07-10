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
You are a competitive programming coach analyzing a Codeforces user's performance.

User Handle: ${sanitizedHandle}

Weak Topics Analysis:
${topicAnalysis}

Based on this analysis, create a personalized 10-day competitive programming improvement plan. For each day, provide:
1. Focus topic(s) from the weak areas
2. Specific problem rating ranges to target
3. Number of problems to solve
4. Key concepts to review
5. Practice strategy tips

Consider the user's current average rating in each topic when suggesting problem difficulties. If they have a low average rating in a topic, start with easier problems and gradually increase difficulty.

Format your response with clear day-by-day breakdown and actionable advice.
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