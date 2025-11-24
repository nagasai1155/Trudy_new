# Installing Stripe CLI on Windows

## Quick Installation Steps

### Method 1: Download Executable (Easiest)

1. **Go to Stripe CLI Releases:**
   - Direct link: https://github.com/stripe/stripe-cli/releases/latest
   - Or search: "stripe cli github releases"

2. **Download for Windows:**
   - Look for: `stripe_X.X.X_windows_x86_64.zip` (latest version)
   - Click to download

3. **Extract the ZIP file:**
   - Extract to a folder (e.g., `C:\stripe-cli\`)
   - You'll get `stripe.exe`

4. **Add to PATH (Optional but Recommended):**
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\stripe-cli` (or wherever you extracted it)
   - Click OK on all dialogs

5. **Verify Installation:**
   - Open new PowerShell window
   - Run: `stripe --version`
   - Should show version number

### Method 2: Using Scoop (If You Have It)

```powershell
scoop install stripe
```

### Method 3: Using Chocolatey (If You Have It)

```powershell
choco install stripe-cli
```

## After Installation

1. **Login to Stripe:**
   ```powershell
   stripe login
   ```
   - This will open your browser
   - Click "Allow access"
   - You'll be logged in

2. **Forward Webhooks:**
   ```powershell
   stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
   ```

3. **Copy Webhook Secret:**
   - The CLI will output: `Ready! Your webhook signing secret is whsec_xxxxx`
   - Copy this secret

4. **Add to Backend `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Troubleshooting

### "stripe is not recognized"
- Make sure you added Stripe CLI to PATH
- Or use full path: `C:\stripe-cli\stripe.exe --version`
- Restart PowerShell after adding to PATH

### "Permission denied"
- Run PowerShell as Administrator
- Or check Windows Defender isn't blocking it

