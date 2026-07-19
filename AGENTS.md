# Emotion CMS permanent rules

- Always read `docs/admin-ui-guidelines.md` before editing admin UI.
- Use shadcn/ui before creating custom UI; never add a second UI library.
- Keep user-facing admin copy in natural Bulgarian and simple for a non-technical owner.
- Never expose secrets or privileged keys. Validate every write on the server and authorize every protected mutation.
- Reuse shared Zod schemas and preserve the reusable public data layer.
- Do not add decorative features that do not support a real workflow.
- Run lint, typecheck, tests, and build after meaningful implementation phases.
- Update documentation whenever architecture or setup changes.

