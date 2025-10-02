# AI Integration (legacy prototype)

This file explains a minimal, safe way to prototype LLM features in this Next.js app.

1) Server proxy route

- A server-side API route (archived under `legacy/api/ai/chat/route.ts`) proxies requests to the OpenAI Chat Completions endpoint when re-enabled in the app. The route reads `process.env.OPENAI_API_KEY` on the server side so the key never reaches the browser.

2) Client chat component

- A simple client component lives at `legacy/components/ai-chat.tsx` for reference. Drop it into any page to prototype a chat UI. It posts message history to `/api/ai/chat` when that route is active.

3) How to set your API key (local development)

- Create a `.env.local` file in the project root and add:

  OPENAI_API_KEY=sk-...your-key...

- Restart the dev server after adding env vars.

4) Security and safety notes

- Never commit your API key to source control. Use environment variables and secret management (Vercel/GitHub Secrets) for production.
- Rate-limit and audit calls to the upstream provider.
- Sanitize and validate user-provided content before sending to the LLM if you display or store results.
- Consider adding cost/usage caps in production and strict prompt templates to avoid unexpected outputs.

5) Suggested features to build next

- Drill assistant: Let users ask for a drill explanation, progressions, video recommendations, or step-by-step coaching cues based on their sport and skill level.
- Personalized training plan generator: take user profile and goals and generate a multi-week plan (store a hashed version of prompts + LLM output for auditing).
- Automated content summarization: Summarize long videos or training sessions into bullet points.
- Coach assistant: produce feedback on uploaded session data (requires careful data handling).

6) Notes about models and costs

- Adjust `model` and `max_tokens` in the server route to match desired quality/cost tradeoffs.

7) Next steps I can implement

- Add server-side usage limits and request logging.
- Add typed request/response schema and tests.
- Implement a modal in the app that uses the legacy chat component (`legacy/components/ai-chat.tsx`) and wire it to onboarding.



