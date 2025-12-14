# Netlify Manual Deployment Issue - Forbidden Error

## Summary
Attempting to manually deploy to Netlify production using `netlify deploy --prod` results in a `JSONHTTPError: Forbidden` error.

## What Was Completed Successfully

### 1. Email Testing ✅
- **Email service**: Brevo (formerly Sendinblue) API
- **Local configuration**: `BREVO_API_KEY` is configured in `.env.local`
- **Test result**: Successfully sent test email via `POST /api/admin/test-email`
  - Endpoint: `http://localhost:3000/api/admin/test-email`
  - Response: `{"success":true,"message":"Test email sent successfully to asereopeyemimichael@gmail.com","messageId":"<202512140023.85176606563@smtp-relay.mailin.fr>"}`
  - HTTP Status: 200

### 2. Netlify Environment Variables ✅
- **Project**: `daiyet` (ID: `bb9c4248-c522-4321-9842-367de210a773`)
- **Project URL**: `https://daiyet.store`
- **Admin URL**: `https://app.netlify.com/projects/daiyet`
- **Environment variables verified in production context**:
  - `GOOGLE_CLIENT_ID` ✅
  - `GOOGLE_CLIENT_SECRET` ✅
  - `PAYSTACK_SECRET_KEY` ✅
  - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` ✅
  - `NEXT_PUBLIC_SITE_URL` ✅
  - `BREVO_API_KEY` ✅ (added during this session)

### 3. Build Process ✅
- **Build command**: `npm run build`
- **Build status**: Completed successfully
- **Build output**: `.next` directory created
- **Warnings**: Some expected warnings about dynamic server usage (routes using cookies cannot be statically rendered)

## The Deployment Issue

### Error Details
```
Command: npx netlify-cli deploy --prod
Error: JSONHTTPError: Forbidden
```

### Attempted Solutions

1. **Standard deployment**:
   ```bash
   npx netlify-cli deploy --prod
   ```
   Result: `JSONHTTPError: Forbidden`

2. **Deployment with pre-built directory**:
   ```bash
   npx netlify-cli deploy --prod --dir=.next
   ```
   Result: `JSONHTTPError: Forbidden`

3. **Project status check**:
   ```bash
   npx netlify-cli status
   ```
   Result: ✅ Project is linked correctly
   - Current project: `daiyet`
   - Project ID: `bb9c4248-c522-4321-9842-367de210a773`
   - Admin URL: `https://app.netlify.com/projects/daiyet`
   - Project URL: `https://daiyet.store`

### Possible Causes

1. **Permissions Issue**:
   - The authenticated user (`michaelasereoo@gmail.com`) may not have deployment permissions for the production branch
   - The project might require team/organization-level permissions

2. **Branch Protection**:
   - Production deployments might be restricted to specific branches or require approval
   - The project might be configured to only allow deployments from Git pushes

3. **Netlify Account/Plan Limitations**:
   - Some Netlify plans restrict manual CLI deployments
   - The account might have deployment restrictions enabled

4. **Authentication Token Issue**:
   - The Netlify CLI authentication token might be expired or have insufficient permissions
   - The token might be scoped to read-only operations

5. **Project Configuration**:
   - The project might be configured to only allow deployments through the Git integration
   - Manual deployments might be disabled in project settings

## Current Project Configuration

- **Netlify CLI Version**: `23.12.3` (from `package.json` devDependencies)
- **Next.js Version**: `16.0.8`
- **Project Type**: Next.js application
- **Repository**: `https://github.com/michaelasereoo/daiyet-app`
- **Team**: Daiyet

## Recommended Next Steps for Senior Dev

1. **Check Netlify Dashboard**:
   - Navigate to: `https://app.netlify.com/projects/daiyet`
   - Go to **Site settings** → **Build & deploy** → **Deploy settings**
   - Verify if manual deployments are enabled
   - Check branch protection settings

2. **Verify User Permissions**:
   - Check if `michaelasereoo@gmail.com` has deployment permissions
   - Verify team/organization role (Admin, Member, etc.)

3. **Check Netlify Account Settings**:
   - Review account plan limitations
   - Check if there are any deployment restrictions

4. **Alternative Deployment Methods**:
   - **Option A**: Use Git push to trigger automatic deployment
     ```bash
     git push origin main
     ```
   - **Option B**: Use Netlify Dashboard to trigger a deploy
     - Go to Deploys tab → Click "Trigger deploy" → "Deploy site"
   - **Option C**: Re-authenticate Netlify CLI
     ```bash
     npx netlify-cli login
     ```

5. **Check Netlify Logs**:
   - Review deployment logs in the Netlify dashboard
   - Check for any error messages or restrictions

6. **Verify Build Settings**:
   - Ensure build command is set correctly: `npm run build`
   - Verify publish directory: `.next` (or as configured)
   - Check if `netlify.toml` exists and has correct settings

## Environment Variables Status

All required environment variables are configured in Netlify production context:
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `PAYSTACK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- ✅ `NEXT_PUBLIC_SITE_URL`
- ✅ `BREVO_API_KEY` (newly added)

## Email Functionality Status

✅ **Email service is working correctly**:
- Brevo API integration is functional
- Test email sent successfully
- `BREVO_API_KEY` is configured both locally and in Netlify

## Commands Executed

```bash
# Check email configuration
grep BREVO_API_KEY .env.local

# Test email API
curl -X POST http://localhost:3000/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"emailType": "booking_confirmation", "recipientEmail": "asereopeyemimichael@gmail.com"}'

# Check Netlify status
npx netlify-cli status

# List environment variables
npx netlify-cli env:list --context production

# Add BREVO_API_KEY to Netlify
npx netlify-cli env:set BREVO_API_KEY "xkeysib-..." --context production

# Build project
npm run build

# Attempt deployment (failed)
npx netlify-cli deploy --prod
```

## Conclusion

The application builds successfully and email functionality is working. The deployment issue appears to be related to Netlify permissions or configuration rather than code issues. The recommended approach is to either:
1. Use Git push to trigger automatic deployment
2. Use the Netlify Dashboard to trigger a manual deploy
3. Have a team admin verify and adjust deployment permissions
