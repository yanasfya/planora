# planora
Planora uses AI to create personalized travel itineraries tailored to your preferences, budget, and interests.

## Environment variables

Planora relies on [OpenRouter](https://openrouter.ai/) to generate itineraries with up-to-date travel suggestions. Add the following variables to your environment (for example in a `.env.local` file) before running the app:

```bash
OPENROUTER_API_KEY="your_api_key_here"
# Optional overrides
# OPENROUTER_MODEL="openrouter/auto"
# OPENROUTER_SITE_URL="https://your-site.example"
# OPENROUTER_APP_NAME="Planora"
```

If an API key is not configured the API will gracefully fall back to a lightweight rule-based itinerary generator so the UI remains functional during development.

## Development

```bash
pnpm install
pnpm dev
```
