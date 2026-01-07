# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start             # or: expo start

# Run on platforms
npm run ios           # expo run:ios
npm run android       # expo run:android
npm run web           # expo start --web

# Database migrations (Drizzle)
npx drizzle-kit generate    # Generate new migration from schema changes
npx drizzle-kit push        # Push schema directly (dev only)
```

## Architecture Overview

This is a React Native Expo app using PowerSync for offline-first data synchronization with Supabase as the backend.

### Data Layer (Dual Database Pattern)

The app uses two database instances that share the same SQLite file (`manual-image-ps.db`):

1. **`dbForMigrations`** (`db/index.ts`) - Expo SQLite instance used only for running Drizzle migrations at app startup
2. **`dbForApp`** (`powersync/system.ts`) - PowerSync-wrapped Drizzle instance for all app queries/mutations

Schema is defined once in `db/schema.ts` using Drizzle ORM and converted to PowerSync format in `powersync/app-schema.ts` via `toPowerSyncTable()`.

### Sync Flow

1. App starts → Drizzle migrations run via `useMigrations()` hook
2. On migration success → `setupPowerSync()` initializes PowerSync and connects via `Connector`
3. Local writes go to SQLite immediately, then `uploadData()` in `powersync/connector.ts` syncs to backend
4. The connector routes different table operations (customers, attachments) to their respective API services

### Key Directories

- `db/` - Schema definitions, migrations, and local query functions
- `powersync/` - PowerSync configuration, schema conversion, and sync connector
- `services/` - Backend API calls (used by PowerSync connector for uploads)
- `lib/` - Shared utilities (Supabase client)
- `components/` - React Native UI components

### Environment Variables

Required in `.env.local`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_POWERSYNC_URL`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`

### Path Aliases

Use `@/` to import from project root (configured in `tsconfig.json`):
```typescript
import { supabase } from "@/lib/supabase";
import { customers } from "@/db/schema";
```

### Important Patterns

- **Attachments**: Local file → base64 → Supabase Storage, then metadata to API
- **Auth state**: Managed by Supabase, session passed to PowerSync for JWT tokens
- **Navigation**: Conditional stack navigator based on auth state (AuthStack vs AppStack)
