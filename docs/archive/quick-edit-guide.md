# Quick Edit Guide: Updating Worker HTML Content

**DEPRECATED**: This file has been consolidated.  
**See**: `docs/all-local-dev-truth.md`

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:50:00

---

## Problem Summary

When editing HTML content in Cloudflare Workers (wrangler dev), changes to source files may not appear in the browser even after:

- Saving the file
- Hard refreshing the browser (Cmd+Shift+R)
- Restarting the IDE

## Root Cause

The wrangler dev server caches compiled code in memory. When you edit TypeScript source files, the running process may not automatically reload the changes, especially if:

- The dev server was started before the edit
- The `.wrangler` cache directory contains stale compiled code
- Multiple dev server processes are running

## Solution Process

### Step 1: Verify the File Change

```bash
# Check the actual file content
cd apps/[module-name]
grep -n "Your search text" src/index.ts

# Verify with hexdump if needed
cat src/index.ts | grep -A 2 -B 2 "Your text"
```

### Step 2: Verify What Server is Actually Serving

```bash
# Check what the server is returning
curl -s http://localhost:[port]/ | grep "Your search text"

# Compare file vs server output
curl -s http://localhost:[port]/ > /tmp/server_response.html
diff src/index.ts /tmp/server_response.html  # If applicable
```

### Step 3: Clear Wrangler Cache

```bash
cd apps/[module-name]
rm -rf .wrangler
```

### Step 4: Restart Dev Server

```bash
# Stop all dev servers cleanly
bash scripts/dev-stop.sh

# Or for a specific port, use the centralized kill_port function:
# source scripts/lib/core.sh
# kill_port [port]

# Restart the dev server
cd apps/[module-name]
pnpm dev
```

### Step 5: Verify the Fix

```bash
# Check server response
curl -s http://localhost:[port]/ | grep "Your text"

# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
```

## Module-Specific Ports

- **apex**: Port 8788 (`apps/apex`)
- **admin**: Check `apps/admin/package.json` for dev port
- **app**: Check `apps/app/package.json` for dev port

## Quick Reference Commands

```bash
# Full reset process for a module
MODULE=apex
cd apps/$MODULE
rm -rf .wrangler

# Stop all dev servers cleanly
bash scripts/dev-stop.sh

# Then restart
pnpm dev
```

## Prevention: Add Cache Headers

To prevent browser caching issues, add cache-control headers to responses:

```typescript
return new Response(html, {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  },
});
```

## Common Issues

1. **Multiple processes on same port**: Use `bash scripts/dev-stop.sh` to cleanly stop all dev servers
2. **Browser cache**: Use hard refresh (Cmd+Shift+R) or incognito mode
3. **File not saved**: Verify file timestamp with `ls -la src/index.ts`
4. **Wrong file edited**: Verify `wrangler.toml` points to correct `main` entry

## File Locations

- Source files: `apps/[module]/src/index.ts`
- Config: `apps/[module]/wrangler.toml` (check `main` field)
- Cache: `apps/[module]/.wrangler/` (can be deleted)
