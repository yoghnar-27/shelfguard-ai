---
trigger: always_on
---

# ShelfGuard AI Development Rules

You are working on the existing ShelfGuard AI repository.

PROJECT:
ShelfGuard AI is a competitive e-commerce intelligence platform for Indian marketplaces.

TARGET RETAILERS:
- Amazon
- Flipkart
- Myntra
- Meesho
- Purplle

CURRENT STACK:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Existing project structure must be preserved unless there is a strong technical reason to change it.

IMPORTANT:
- Do not rebuild the project from scratch.
- Do not create a new frontend or backend.
- Do not delete existing working components.
- Do not introduce unnecessary dependencies.
- Do not modify unrelated files.
- Prefer small, focused changes.
- Before making major architectural changes, explain the plan.
- Never expose secrets or API keys.
- Never place Bright Data credentials in frontend code.
- Environment variables must be used for secrets.
- Keep the application production-oriented.
- Maintain responsive design.
- Preserve the existing dark SaaS dashboard aesthetic.
- Prefer reusable components.
- Avoid duplicated code.

BRIGHT DATA:
Bright Data is the external data collection provider.
Do not build a custom scraper unless explicitly instructed.
Do not replace Bright Data with another scraping service.

GIT:
The repository is already connected to GitHub.
Do not reset, force-push, delete branches, or rewrite Git history unless explicitly instructed.

DEVELOPMENT PROCESS:
1. Inspect the existing implementation before changing anything.
2. Explain what files will be changed.
3. Make the smallest reasonable implementation.
4. Run the relevant checks.
5. Report exactly what changed.
6. Report any errors that remain.

DO NOT:
- install large packages without asking
- modify package versions unnecessarily
- overwrite .env files
- expose API keys
- fabricate API responses as real production data
- claim something works without testing it