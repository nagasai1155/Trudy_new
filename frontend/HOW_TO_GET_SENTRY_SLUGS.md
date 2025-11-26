# How to Get Sentry Organization Slug and Project Slug

This is a quick visual guide to help you find your Organization Slug and Project Slug in Sentry.

## 🎯 Quick Method: Check the URL

This is the **fastest way** to get both slugs!

### Organization Slug

1. **Go to your Sentry dashboard** (any page in Sentry)
2. **Look at your browser's address bar**
3. The URL will look like this:
   ```
   https://sentry.io/organizations/YOUR-ORG-SLUG-HERE/
   ```
4. **Copy the part between `/organizations/` and the next `/`**
   - That's your Organization Slug!

**Example:**
- URL: `https://sentry.io/organizations/acme-corp/`
- Organization Slug: `acme-corp`

### Project Slug

1. **Go to your project** in Sentry (click on your project name)
2. **Look at your browser's address bar**
3. The URL will look like this:
   ```
   https://sentry.io/organizations/[org]/projects/YOUR-PROJECT-SLUG-HERE/
   ```
4. **Copy the part between `/projects/` and the next `/`**
   - That's your Project Slug!

**Example:**
- URL: `https://sentry.io/organizations/acme-corp/projects/trudy-frontend/`
- Project Slug: `trudy-frontend`

---

## 📋 Detailed Method: From Settings

If you prefer to find them in the settings:

### Organization Slug

1. **Click your profile icon** (top right corner of Sentry)
2. Click **"Settings"** from the dropdown
3. In the left sidebar, under **"Organization Settings"**, click **"General"**
4. Scroll down to find **"Organization Slug"**
5. Copy that value

**Visual Path:**
```
Profile Icon (top right) 
  → Settings 
    → Organization Settings (left sidebar)
      → General
        → Organization Slug
```

### Project Slug

1. **Go to your project** in Sentry (click on your project from the dashboard)
2. **Click the Settings icon** (⚙️ gear icon) in the left sidebar
3. Click **"General"** (should be the first option)
4. Look for **"Project Slug"** field
5. Copy that value

**Visual Path:**
```
Your Project 
  → Settings Icon (⚙️ in left sidebar)
    → General
      → Project Slug
```

---

## ✅ What to Put in Your .env.local

Once you have both slugs, add them to your `.env.local` file:

```env
SENTRY_ORG=your-org-slug-here
SENTRY_PROJECT=your-project-slug-here
```

**Real Example:**
```env
SENTRY_ORG=acme-corp
SENTRY_PROJECT=trudy-frontend
```

---

## 🔍 Still Can't Find It?

1. **Make sure you're logged into Sentry**
2. **Check that you have access to the organization/project**
3. **Try the URL method first** - it's the easiest!
4. If you're in a team, ask your team admin for the slugs

---

## 💡 Pro Tip

Both slugs are usually:
- **Lowercase**
- **Hyphenated** (use `-` not spaces)
- **Short and descriptive**

Examples:
- ✅ `my-company`
- ✅ `trudy-frontend`
- ✅ `acme-corp`
- ❌ `My Company` (has spaces)
- ❌ `MY_COMPANY` (has underscores, usually not used)

