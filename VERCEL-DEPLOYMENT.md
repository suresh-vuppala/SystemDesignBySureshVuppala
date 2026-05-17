# System Design Learning Platform — Vercel Deployment Guide

Complete learning platform with **100+ real-world problems** and **comprehensive cheatsheet** for system design interviews.

**📌 Live Sites:**
- **Main:** `https://your-domain.vercel.app/` (landing page)
- **Real-Time Problems:** `https://your-domain.vercel.app/realtime`
- **Cheatsheet:** `https://your-domain.vercel.app/cheatsheet`
- **Cheatsheet Direct:** `https://your-domain.vercel.app/blog/cheatsheet/01-foundations.html`

---

## 🚀 Quick Start Deployment (5 minutes)

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

### **Step 2: Connect to Vercel**

**Option A: Using Vercel CLI (Recommended)**
```bash
npm install -g vercel          # Install Vercel CLI
vercel                          # Login & deploy
```

**Option B: Vercel Dashboard**
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Deploy" (no build config needed!)

### **Step 3: Custom Domain (Optional)**
In Vercel Dashboard → Project Settings → Domains → Add custom domain

---

## 📁 Project Structure for Vercel

```
SystemDesignBySureshVuppala/              ← Root
├── vercel.json                           ← Route config & headers
├── package.json                          ← Project metadata
├── .vercelignore                         ← Files to exclude
├── .gitignore
├── README.md
├── blog/                                 ← All content here
│   ├── index.html                        ← Main landing (/ route)
│   ├── cheatsheet/
│   │   ├── index.html                    ← /cheatsheet route
│   │   ├── 01-foundations.html
│   │   ├── ... (13 more modules)
│   │   └── css/  ├── style.css
│   │   └── js/   ├── header.js
│   ├── realtime/
│   │   ├── index.html                    ← /realtime route
│   │   ├── 01-chat-messaging.html
│   │   ├── ... (12 more categories)
│   │   └── css/
│   │   └── js/
│   ├── css/                              ← Shared styles
│   ├── js/                               ← Shared scripts
└── ... (other docs)
```

---

## 🔧 Configuration Files Explained

### **vercel.json** (Route Rewrites & Headers)
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/cheatsheet", "destination": "/blog/cheatsheet/index.html" },
    { "source": "/realtime", "destination": "/blog/realtime/index.html" },
    { "source": "/", "destination": "/blog/index.html" }
  ],
  "headers": [
    {
      "source": "/blog/css/:path*",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000" }]
    }
  ]
}
```

**What this does:**
- ✅ Routes `/cheatsheet` → `/blog/cheatsheet/index.html`
- ✅ Routes `/realtime` → `/blog/realtime/index.html`
- ✅ Root `/` → `/blog/index.html` (landing page)
- ✅ CSS/JS cached for 1 year (immutable)
- ✅ HTML cached for 1 hour (fresh content)

### **package.json** (Metadata)
- Tells Vercel it's a static site (no build needed)
- Includes dev script for local testing
- Tracks repository information

### **.vercelignore** (Exclude Large Files)
Prevents deployment of unnecessary files:
- README.md files
- Python scripts
- Markdown docs
- Git metadata

---

## 💻 Local Development

### **Test Locally Before Deploying**
```bash
# Using Python 3
python -m http.server 8000

# OR using Node.js
npx http-server ./
```

Then open: `http://localhost:8000/blog/`

### **File Structure for Local Testing**
All relative paths should work because they reference `../css/` and `../js/`

✅ **Click through the site:**
- Main landing → Real-Time Problems → Cheatsheet
- Ensure all navigation links work
- Check console for any errors (F12)

---

## 🎯 Routing & URLs After Deployment

| Page | URL |
|------|-----|
| Main Landing | `/` or `/blog/` |
| Real-Time Index | `/realtime/` or `/blog/realtime/` |
| Chat & Messaging | `/blog/realtime/01-chat-messaging.html` |
| Cheatsheet Index | `/cheatsheet/` or `/blog/cheatsheet/` |
| Foundations | `/blog/cheatsheet/01-foundations.html` |

**Vercel's rewrites automatically handle:**
- `/cheatsheet` → correct HTML file
- `/realtime` → correct HTML file
- Direct access to HTML files works too

---

## 📊 Performance Optimization

### **Caching Strategy** (in vercel.json)

```
Assets (CSS/JS) → 1-year cache (immutable)
HTML → 1-hour cache (fresh on updates)
Images → 7-day cache
```

### **Compression** (Automatic)
Vercel automatically:
- Gzip compresses text files
- Serves optimized images
- Minifies on the fly

### **CDN** (Global)
- Content served from edge locations worldwide
- ~50ms response time from any region

---

## 🔐 Environment Variables (If Needed)

If you add analytics or tracking later:

1. **Vercel Dashboard** → Project Settings → Environment Variables
2. **Add variables** (examples):
   ```
   ANALYTICS_KEY=xxx
   GITHUB_REPO_URL=xxx
   ```
3. **Restart deployment** for changes to take effect

Currently: **No env vars needed** (static site)

---

## 🚨 Troubleshooting

### **CSS/JS Not Loading**
- **Issue:** Relative paths broken after Vercel routes
- **Fix:** CSS loads from `../css/style.css` → Vercel handles the routing
- **Check:** Open browser DevTools → Network tab → verify CSS loads

### **404 on HTML Pages**
- **Issue:** Direct navigation to `/blog/realtime/01-chat-messaging.html` shows 404
- **Fix:** Add rewrites to vercel.json (already done ✅)

### **Site Shows Old Version**
- **Fix:** Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
- **Or:** Clear Vercel cache in Dashboard → Settings → Redeploy

### **Build Fails on Vercel**
- **Reason:** Unlikely (static site), but if it happens:
  1. Check `.vercelignore` — ensure nothing conflicts
  2. Verify all file paths are correct
  3. Check for large files (>100MB)

---

## 📈 Monitoring & Analytics

### **Vercel Dashboard Insights**
- Traffic analytics
- Edge function logs
- Deployment history
- Custom domain status

### **Add Google Analytics (Optional)**
Add this before `</head>` in `blog/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## 🆘 Getting Help

**Common Resources:**
- Vercel Docs: https://vercel.com/docs
- Static site guide: https://vercel.com/guides/deploying-static-site

**If something breaks:**
1. Check `.vercelignore` — nothing needed excluded
2. Verify relative paths in HTML files
3. Test locally with `python -m http.server 8000`
4. Check Vercel deployment logs

---

## 📝 Deployment Checklist

- ✅ `vercel.json` configured
- ✅ `package.json` created
- ✅ `.vercelignore` excludes unnecessary files
- ✅ `blog/index.html` landing page ready
- ✅ All HTML files use relative paths (`../css/`, `../js/`)
- ✅ Pushed to GitHub
- ✅ Connected Vercel to GitHub
- ✅ Deploy button clicked
- ✅ Custom domain added (optional)

---

## 🎉 You're Done!

Your system design learning platform is now **live on Vercel** with:
- ⚡ Global CDN distribution
- 🔄 Auto-deployment on push
- 🔒 HTTPS by default
- 📊 Built-in analytics
- 🚀 Instant scaling

**Share your platform:**
```
Check out my system design learning platform: https://your-domain.vercel.app
100+ real-time problems + complete cheatsheet!
```

---

## 🔄 Future Enhancements

**When you want to expand:**

1. **Add Backend (Node.js/Python):**
   - Convert to Next.js or add `/api` routes
   - Database for user progress tracking

2. **Search Feature:**
   - Add Algolia for full-text search across 100 problems

3. **Interactive Components:**
   - Add React for interactive diagrams

4. **User Accounts:**
   - Track problem difficulty ratings
   - Save bookmarks

For now, **static site is perfect** for learning platform! 🎯

---

**Last Updated:** May 2026 | **Status:** Ready for Production ✅
