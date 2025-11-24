# Stripe CLI Quick Install - Windows

## Step 1: Download
1. Go to: **https://github.com/stripe/stripe-cli/releases/latest**
2. Download: `stripe_X.X.X_windows_x86_64.zip`

## Step 2: Extract
1. Extract ZIP to: `C:\stripe-cli\` (or any folder you prefer)
2. You should see `stripe.exe` in that folder

## Step 3: Add to PATH (So you can use `stripe` command)
1. Press `Win + X` → Click **"System"**
2. Click **"Advanced system settings"** (on the left)
3. Click **"Environment Variables"** button
4. Under **"System variables"**, find **"Path"** → Click **"Edit"**
5. Click **"New"** → Add: `C:\stripe-cli` (or your folder path)
6. Click **OK** on all dialogs
7. **Close and reopen PowerShell** for changes to take effect

## Step 4: Verify
Open new PowerShell and run:
```powershell
stripe --version
```
Should show version number like: `stripe version X.X.X`

## Step 5: Login
```powershell
stripe login
```
- Will open browser
- Click "Allow access"
- You're logged in!

## Step 6: Forward Webhooks
```powershell
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

This will:
- Show: `Ready! Your webhook signing secret is whsec_xxxxx`
- Forward all Stripe events to your local backend
- Keep running (don't close this terminal)

## Step 7: Copy Webhook Secret
- Copy the `whsec_xxxxx` from the output
- Add to `z-backend/.env`:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  ```

## Done! 🎉
Now you can test payments and webhooks will be forwarded to your local backend.

