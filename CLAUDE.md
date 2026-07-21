# Server conventions

## Spotify Web API

- OpenAPI spec: refer to the Spotify OpenAPI specification at https://developer.spotify.com/reference/web-api/open-api-schema.yaml for all endpoint paths, parameters, and response schemas. Do not guess endpoints or field names.
- Authorization: use the Authorization Code with PKCE flow (https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) for any user-specific data. If the app has a secure backend, the Authorization Code flow (https://developer.spotify.com/documentation/web-api/tutorials/code-flow) is also acceptable. Only use Client Credentials for public, non-user data (e.g. catalog search). Never use the Implicit Grant flow (deprecated).
- Redirect URIs: always use HTTPS redirect URIs (except `http://127.0.0.1` for local development). Never use `http://localhost` or wildcard URIs. See https://developer.spotify.com/documentation/web-api/concepts/redirect_uri.
- Scopes: request only the minimum scopes (https://developer.spotify.com/documentation/web-api/concepts/scopes) needed for the feature being built. Do not request broad scopes preemptively.
- Token management: store tokens securely, never expose the Client Secret in client-side code. Implement token refresh (https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens) and send the user through authorization again when a refresh token expires.
- Rate limits: implement exponential backoff and respect the `Retry-After` header on HTTP 429. Do not retry immediately or in tight loops.
- Deprecated endpoints: do not use deprecated endpoints (e.g. `/audio-features`, `/audio-analysis`, `/recommendations`, `/related-artists` — all deprecated Nov 2024 with no new-app access). Prefer `/playlists/{id}/items` over `/playlists/{id}/tracks`, and `/me/library` over type-specific library endpoints.
- Error handling: handle all HTTP error codes documented in the OpenAPI schema. Read the returned error message and surface meaningful feedback to the user.
- Developer Terms of Service: comply with https://developer.spotify.com/terms. In particular: do not cache Spotify content beyond what's needed for immediate use, always attribute content to Spotify, and do not use the API to train machine learning models on Spotify data.
