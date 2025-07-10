import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get('handle');
    const weakTopics = url.searchParams.get('weak')?.split(',').filter(Boolean) || [];

    // Validate required parameters
    if (!handle) {
      return NextResponse.json({ error: 'Missing handle parameter' }, { status: 400 });
    }

    // Validate environment variable
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Sanitize inputs
    const sanitizedHandle = handle.trim();
    const sanitizedTopics = weakTopics.map(topic => topic.trim()).filter(Boolean);

    const prompt = `
You are a competitive programming coach.
The user with Codeforces handle "${sanitizedHandle}" is weak in the following topics: ${sanitizedTopics.length > 0 ? sanitizedTopics.join(', ') : 'general programming'}.
Generate a personalized 10-day competitive programming plan, including topic focus and recommended rated problems each day.
Format the response in a structured way with clear daily breakdowns.
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
      weakTopics: sanitizedTopics
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