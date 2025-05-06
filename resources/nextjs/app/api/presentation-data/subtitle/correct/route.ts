import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { srtContent, script } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You will be given the content of an SRT subtitle file and a script from which the subtitle file has been created. Your task is to correct the text of the subtitle file by referencing the script, focusing on spelling, capitalization and punctuation errors. Ensure that you do not alter any timing sequences in any way; only make textual corrections within the existing sequences."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Script: ${script}\nSRT Subtitle Content: \n${srtContent}`
            }
          ]
        }
      ],
      response_format: { type: "text" },
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const correctedSRT = completion.choices[0].message.content;

    if (!correctedSRT) {
      throw new Error('No correction received from OpenAI');
    }

    return NextResponse.json({ correctedSRT });
  } catch (error) {
    console.error('Error correcting subtitles:', error);
    return NextResponse.json(
      { error: 'Failed to correct subtitles' },
      { status: 500 }
    );
  }
}
