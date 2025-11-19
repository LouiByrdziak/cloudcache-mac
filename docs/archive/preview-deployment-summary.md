# Preview Deployment Summary Report

**DEPRECATED**: This file has been consolidated.
**See**: `docs/all-deployment-truth.md` for current documentation.

**Migration Date**: 2025-11-19
**Archived On**: 2025-11-19 13:44:00

---

**Last Updated:** 2025-11-15 12:22:59

---

## 🚀 Clickable Preview.cloudcache.workers.dev Links

### APP Module

**Main:**

- [https://app-worker-preview.cloudcache.workers.dev](https://app-worker-preview.cloudcache.workers.dev)

**Health:**

- [https://app-worker-preview.cloudcache.workers.dev/healthz](https://app-worker-preview.cloudcache.workers.dev/healthz)

**Ready:**

- [https://app-worker-preview.cloudcache.workers.dev/readyz](https://app-worker-preview.cloudcache.workers.dev/readyz)

**Ping:**

- [https://app-worker-preview.cloudcache.workers.dev/api/v1/ping](https://app-worker-preview.cloudcache.workers.dev/api/v1/ping)

---

### ADMIN Module

**Main:**

- [https://admin-worker-preview.cloudcache.workers.dev](https://admin-worker-preview.cloudcache.workers.dev)

**Health:**

- [https://admin-worker-preview.cloudcache.workers.dev/healthz](https://admin-worker-preview.cloudcache.workers.dev/healthz)

**Ready:**

- [https://admin-worker-preview.cloudcache.workers.dev/readyz](https://admin-worker-preview.cloudcache.workers.dev/readyz)

---

### APEX Module

**Main:**

- [https://apex-worker-preview.cloudcache.workers.dev](https://apex-worker-preview.cloudcache.workers.dev)

**Health:**

- [https://apex-worker-preview.cloudcache.workers.dev/healthz](https://apex-worker-preview.cloudcache.workers.dev/healthz)

**Ready:**

- [https://apex-worker-preview.cloudcache.workers.dev/readyz](https://apex-worker-preview.cloudcache.workers.dev/readyz)

---

## 💻 Clickable Localhost Links - Cursor Internal Browser

Click these links in Cursor to open in the integrated simple browser:

- [http://localhost:8789](http://localhost:8789) - APP Module
- [http://localhost:8787](http://localhost:8787) - ADMIN Module
- [http://localhost:8788](http://localhost:8788) - APEX Module

**Quick Script:** Run `bash scripts/open-local-cursor.sh` to display all clickable links

---

## 🌐 Clickable Localhost Links - External Chrome Browser

These URLs open in your default external browser (Chrome recommended):

- [http://localhost:8789](http://localhost:8789) - APP Module
- [http://localhost:8787](http://localhost:8787) - ADMIN Module
- [http://localhost:8788](http://localhost:8788) - APEX Module

**Quick Script:** Run `bash scripts/open-local-chrome.sh` to automatically open all URLs in Chrome

---

## 🧪 Quick Test Commands

```bash
bash scripts/cloudcache test-preview app
bash scripts/cloudcache test-preview admin
bash scripts/cloudcache test-preview apex
```

---

## ✅ Expected Visual Content

All modules should display **green text** (`#00FF00`) centered both vertically and horizontally:

- **APP:** "I love Cloudcache APP"
- **ADMIN:** "I love Cloudcache ADMIN"
- **APEX:** "I love Cloudcache APEX"

**Note:** Content should be identical between preview URLs and localhost URLs.

---

## 📋 Additional Information

### Start Local Development Servers

```bash
# Build all modules and prepare for development
bash scripts/dev-local.sh

# Start all modules concurrently
pnpm dev

# Or start individually:
pnpm dev:app    # APP on port 8789
pnpm dev:admin  # ADMIN on port 8787
pnpm dev:apex   # APEX on port 8788
```

### Stop Development Servers

```bash
bash scripts/dev-stop.sh
```

### Deploy All Modules to Preview

```bash
bash scripts/deploy-preview.sh
```

---

**For detailed testing procedures and troubleshooting, see:** `docs/preview-test-execution-plan.md`
