# Chennai AgroSmart AI

**Grow Better. Waste Less.**

Chennai AgroSmart AI is a focused crop-assistance MVP for small farmers. The core journey is:

```text
Home → Login → Dashboard → Upload crop photo → AI analysis → Recommendation → History
```

## MVP scope

This version intentionally keeps the product simple. It includes a responsive public homepage, configured authentication shell, protected dashboard, crop upload with JPG/PNG/WEBP validation and preview, plant-health demo analysis, recommendation detail pages, saved analysis history, profile/logout, loading states, and clear demo/advisory labels.

It does not include subscriptions, pricing, payments, pilot programs, investor pages, blogs, marketplaces, complex admin, or unnecessary analytics.

## Runtime note

The project uses the supported managed WebDev full-stack scaffold available in this session: React 19 + Vite + Tailwind CSS + Express + tRPC + Drizzle/MySQL/TiDB + Manus OAuth. The original product brief requested a MERN/MongoDB/JWT stack, but the managed runtime provides Drizzle/MySQL-compatible persistence and OAuth session infrastructure. The application is structured so the domain service and UI can be moved to a standalone Express/Mongoose/JWT deployment later without changing the crop-analysis result contract.

The current database is therefore **not MongoDB**, and authentication is provided by the managed OAuth session rather than a custom email/password JWT implementation. No live AI model is claimed.

## Local commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

The development server URL is printed by the runtime. The managed environment already provides database and OAuth configuration.

## Analysis service

`server/services/plantHealthService.ts` exports:

```ts
analyzeCrop(image, { crop, soilType, plantingDate })
```

The service returns a stable structured contract:

```json
{
  "crop": "Tomato",
  "healthStatus": "Healthy",
  "confidence": 86,
  "possibleIssue": "Low fungal disease risk",
  "wateringAdvice": "Continue regular irrigation",
  "recommendation": "Continue regular irrigation and monitor the lower leaves for yellowing or spots over the next few days.",
  "severity": "Low",
  "mode": "demo"
}
```

Replace the function body with a TensorFlow model, Python ML API, Gemini/OpenAI vision provider, or custom crop disease model when available. The frontend reads this contract through the typed tRPC procedures and does not need to change.

## Data model

`drizzle/schema.ts` includes the MVP `cropAnalyses` table with user, crop, soil, planting date, image reference, health status, confidence, issue, severity, watering advice, recommendation, mode, and creation timestamp. The generated migration is `drizzle/0002_cold_rhodey.sql`.

The existing broader tables remain available for future expansion but are not surfaced in the simplified navigation.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Short product homepage |
| `/login` | Public | Login entry point |
| `/register` | Public | Registration entry point |
| `/dashboard` | Protected | Crop summary and main CTA |
| `/upload` | Protected | Crop details, image preview, validation, and analysis |
| `/recommendation/:id` | Protected | Health result and explainable recommendation |
| `/history` | Protected | Previous analyses with detail links |
| `/profile` | Protected | Account details and logout |

## API procedures

The typed backend contract is served through `/api/trpc`:

- `auth.me` and `auth.logout` for the managed session.
- `analysis.create` for validation, demo analysis, and persistence.
- `analysis.list` for protected history.
- `analysis.get` for protected recommendation detail.

The public contact/pilot procedures and older service routes remain in the codebase for compatibility with the previous checkpoint, but they are not part of the current MVP navigation.

## Security and UX

The upload screen validates image MIME type and a 5MB size limit before submission. Protected screens are wrapped in the provided authenticated layout. Dashboard loading, upload analysis, history loading, invalid file, and analysis error states are rendered explicitly so the product does not leave a blank screen. Demo results are labelled as advisory and demo-mode.

## Deployment

1. Keep the managed database and OAuth environment configured.
2. Apply migrations through the managed workflow after reviewing generated SQL.
3. Run `pnpm build` in the deployment environment.
4. Keep provider keys server-side if a real crop model or external image service is added.
5. If a standalone MERN deployment is required later, port the `CropAnalysis` shape and `plantHealthService` contract to Mongoose/Express/JWT while preserving the current frontend response model.

## Verification completed

- TypeScript check passes.
- Unit tests cover auth logout, the ensemble demo contract, and the plant-health service contract.
- Production frontend and backend build passes.
- Desktop and mobile public pages plus protected crop-analysis screens are intended for responsive use.
