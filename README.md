# Емоция CMS

Next.js admin panel за управление на продуктите и съдържанието на бутик „Емоция“.

## Локална конфигурация

```bash
npm install
cp .env.example .env.local
npm run dev
```

Попълнете Supabase стойностите според `SUPABASE_SETUP.md`. За AI генериране добавете server-only стойности в `.env.local`:

```env
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=
```

`OPENAI_MODEL` е optional; при празна стойност CMS използва икономичния default `gpt-4o-mini`. Никога не използвайте `NEXT_PUBLIC_` prefix за OpenAI ключа и не commit-вайте `.env.local`.

## Vercel

В Vercel отворете **Project Settings → Environment Variables** и добавете `OPENAI_API_KEY`. По желание добавете `OPENAI_MODEL`. Маркирайте ги за нужните среди (Production/Preview/Development) и направете нов deployment. Ключът остава server-only.

## Проверки

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Подробните инструкции са в `docs/setup.md`.
