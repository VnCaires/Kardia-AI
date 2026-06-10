## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local environment file:
   `cp .env.example .env.local`
3. Configure the OpenAI API in [.env.local](.env.local):

   ```env
   OPENAI_API_KEY="your_openai_api_key"
   OPENAI_MODEL="gpt-5.4-nano"
   OPENAI_TIMEOUT_MS="45000"
   ```

   - `OPENAI_API_KEY` is required and must come from the OpenAI Platform.
   - `OPENAI_MODEL` is optional. The default is `gpt-5.4-nano`, chosen to keep AI card generation inexpensive.
   - `OPENAI_TIMEOUT_MS` is optional. Increase it if the AI provider is slow or your connection is unstable.
   - Do not commit `.env.local`; it is ignored by Git and should contain your private key only on your machine.

   The app uses the OpenAI API only on the server (`server.ts`). Browser code calls local routes such as `/api/generate-cards` and `/api/assistant`, so the API key is never sent to the frontend.
4. Run the app:
   `npm run dev`
