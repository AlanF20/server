import {
  Injectable,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import type { CreateSongInput } from '../songs/songs.dto.js';
import type { AiEnrichInput } from './ai.dto.js';
import { fromZodError } from 'zod-validation-error';
import {
  OPENROUTER_API_KEY,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from '../config/envs.js';

const SpotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

const SpotifySearchResponseSchema = z.object({
  tracks: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        artists: z.array(z.object({ name: z.string() })).min(1),
        duration_ms: z.number(),
      }),
    ),
  }),
});

const AiEnrichmentSchema = z.object({
  key: z.string(),
  bpm: z.number().int(),
  author: z.string().nullish(),
  lyrics: z.string(),
});

const SYSTEM_PROMPT = `You are an expert music data assistant. Given a confirmed song title and artist, search the internet for precise metadata and return it as strict JSON.

### MANDATORY SEARCH INSTRUCTIONS:
1. Do NOT rely on pre-trained knowledge. Perform a real-time web search to verify the data.
2. Cross-reference reliable music databases (Spotify, Genius, MusicBrainz, Apple Music).

### OUTPUT FORMAT (STRICT JSON):
Return ONLY a valid JSON object — no markdown, no extra text:
{
  "key": string,     // e.g. "Am", "C", "F#m"
  "bpm": number,     // integer
  "author": string,  // songwriter(s), can equal artist
  "lyrics": string   // full song lyrics as plain text
}

### LYRICS RULES:
- Return the full, complete lyrics. No omissions, summaries, or placeholders.
- Do NOT add copyright disclaimers. Return the actual lyrics text.

### FALLBACK:
If the song cannot be verified after searching, return exactly: {"error": "Song not found"}`;

@Injectable()
export class AiService {
  private readonly client: OpenRouter;

  private spotifyToken: string | null = null;
  private spotifyTokenExpiresAt = 0;
  private spotifyTokenPromise: Promise<string> | null = null;

  constructor() {
    if (!OPENROUTER_API_KEY)
      throw new Error('OpenRouter API key not configured');
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET)
      throw new Error('Spotify credentials not configured');

    this.client = new OpenRouter({
      apiKey: OPENROUTER_API_KEY,
      httpReferer: 'https://repertory.app',
      appTitle: 'Repertory',
    });
  }

  private async getSpotifyAccessToken(): Promise<string> {
    if (this.spotifyToken && Date.now() < this.spotifyTokenExpiresAt) {
      return this.spotifyToken;
    }
    if (!this.spotifyTokenPromise) {
      this.spotifyTokenPromise = this.fetchSpotifyAccessToken().finally(() => {
        this.spotifyTokenPromise = null;
      });
    }
    return this.spotifyTokenPromise;
  }

  private async fetchSpotifyAccessToken(): Promise<string> {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new BadGatewayException('Spotify token request failed');

    const parsed = SpotifyTokenSchema.safeParse(await res.json());
    if (!parsed.success)
      throw new BadGatewayException('Unexpected Spotify token response');

    this.spotifyToken = parsed.data.access_token;
    this.spotifyTokenExpiresAt =
      Date.now() + (parsed.data.expires_in - 60) * 1000;
    return this.spotifyToken;
  }

  private async searchSpotify(title: string, artist?: string) {
    const token = await this.getSpotifyAccessToken();
    const q = artist ? `track:${title} artist:${artist}` : `track:${title}`;

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new BadGatewayException('Spotify API request failed');

    const parsed = SpotifySearchResponseSchema.safeParse(await res.json());
    if (!parsed.success || parsed.data.tracks.items.length === 0)
      throw new NotFoundException(`Track not found on Spotify: "${title}"`);

    const track = parsed.data.tracks.items[0];
    return {
      title: track.name,
      artist: track.artists[0].name,
      duration: Math.round(track.duration_ms / 1000),
    };
  }

  async enrichSong(dto: AiEnrichInput): Promise<CreateSongInput> {
    const spotifyTrack = await this.searchSpotify(dto.title, dto.artist);

    const result = await this.client.chat.send({
      chatRequest: {
        model: 'openrouter/free',
        responseFormat: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Title: ${spotifyTrack.title}\nArtist: ${spotifyTrack.artist}`,
          },
        ],
      },
    });

    const content: unknown = result.choices[0].message.content;
    if (typeof content !== 'string')
      throw new BadGatewayException('Unexpected AI response format');

    const raw: unknown = JSON.parse(content);
    const parsed = AiEnrichmentSchema.safeParse(raw);
    if (!parsed.success) {
      throw new BadGatewayException(
        `AI response failed validation: ${fromZodError(parsed.error).message}`,
      );
    }

    return { ...spotifyTrack, ...parsed.data };
  }
}
