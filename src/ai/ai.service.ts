import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SongSchema } from '../songs/songs.dto.js';
import type { CreateSongInput } from '../songs/songs.dto.js';
import type { AiEnrichInput } from './ai.dto.js';
import { fromZodError } from 'zod-validation-error';

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

const SYSTEM_PROMPT = `You are a music data assistant. Given a song title and artist, return a JSON object matching this exact shape:
{
  "title": string,
  "artist": string,
  "author": string,        // songwriter(s), can equal artist
  "key": string,           // e.g. "Am", "C", "F#m"
  "bpm": number,           // integer
  "duration": number,      // total seconds (integer)
  "sections": [
    {
      "label": string,     // e.g. "Verse 1", "Chorus", "Bridge"
      "prog": string[],    // chord progression e.g. ["Am", "F", "C", "G"]
      "lines": [
        [                  // each line is an array of segments
          { "c": string | null, "t": string }  // c = chord above this word (null if none), t = lyric text
        ]
      ]
    }
  ]
}
Return ONLY valid JSON. No markdown, no explanation.`;

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async enrichSong(dto: AiEnrichInput): Promise<CreateSongInput> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey)
      throw new BadGatewayException('OpenRouter API key not configured');

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://repertory.app',
          'X-Title': 'Repertory',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Title: ${dto.title}\nArtist: ${dto.artist}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(`OpenRouter error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const raw: unknown = JSON.parse(data.choices[0].message.content);

    // Validate with shared Zod schema (omit id — not returned by AI)
    const parsed = SongSchema.omit({ id: true }).safeParse(raw);
    if (!parsed.success) {
      throw new BadGatewayException(
        `AI response failed validation: ${fromZodError(parsed.error).message}`,
      );
    }

    return parsed.data;
  }
}
