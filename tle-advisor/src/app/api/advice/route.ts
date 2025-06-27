import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const handle = url.searchParams.get('handle');
  const weakTopics = url.searchParams.get('weak')?.split(',') || [];

  if (!handle) {
    return NextResponse.json({ error: 'Missing handle' }, { status: 400 });
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a competitive programming coach.',
    },
    {
      role: 'user',
      content: `The user with Codeforces handle "${handle}" is weak in these topics: ${weakTopics.join(', ')}. Suggest a personalized 10-day CP plan with topic focus and rated problems.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: false,
    });

    const suggestion = completion.choices[0]?.message?.content ?? 'No suggestion generated.';

    return NextResponse.json({ suggestion });
  } catch (error: any) {
    console.error('[OpenAI Error]', error);
    return NextResponse.json({ error: 'Failed to generate AI suggestion' }, { status: 500 });
  }
}
