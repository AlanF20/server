import { Injectable, BadGatewayException } from '@nestjs/common';
import { z } from 'zod';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '../config/envs.js';

const SpotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(z.object({ name: z.string() })).min(1),
  duration_ms: z.number(),
  album: z.object({
    name: z.string(),
    images: z.array(z.object({ url: z.string() })),
  }),
});

const SpotifySearchResponseSchema = z.object({
  tracks: z.object({ items: z.array(SpotifyTrackSchema) }),
});

@Injectable()
export class SpotifyService {
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private tokenPromise: Promise<string> | null = null;

  constructor() {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET)
      throw new Error('Spotify credentials not configured');
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchAccessToken().finally(() => {
        this.tokenPromise = null;
      });
    }
    return this.tokenPromise;
  }

  private async fetchAccessToken(): Promise<string> {
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

    this.token = parsed.data.access_token;
    this.tokenExpiresAt = Date.now() + (parsed.data.expires_in - 60) * 1000;
    return this.token;
  }

  async searchTracks(q: string, limit = 10) {
    const token = await this.getAccessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new BadGatewayException('Spotify API request failed');

    const parsed = SpotifySearchResponseSchema.safeParse(await res.json());
    if (!parsed.success)
      throw new BadGatewayException('Unexpected Spotify search response');

    return parsed.data.tracks.items.map((t) => ({
      spotifyId: t.id,
      title: t.name,
      artist: t.artists[0].name,
      album: t.album.name,
      albumArt: t.album.images[0]?.url ?? null,
      duration: Math.round(t.duration_ms / 1000),
    }));
  }
}
