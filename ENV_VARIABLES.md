# Environment Variables Required for AI Notes Feature

This document lists all environment variables needed for the automatic AI notes generation feature.

## Required Environment Variables

### Daily.co Video Integration

```bash
# Daily.co API Key (Server-side)
# Get from: https://dashboard.daily.co/developers
DAILY_API_KEY=your_daily_co_api_key_here

# Daily.co API URL (Optional - defaults to https://api.daily.co/v1)
DAILY_API_URL=https://api.daily.co/v1
```

**Note**: The Daily.co domain and client-side token generation may require `NEXT_PUBLIC_DAILY_API_KEY` if you plan to generate tokens client-side. Currently, room URLs are generated server-side, so this may not be required.

### OpenAI Whisper (Audio Transcription)

```bash
# OpenAI API Key for Whisper transcription
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Usage**: Transcribes audio recordings from therapy sessions into text.

### DeepSeek (SOAP Note Generation)

```bash
# DeepSeek API Key for AI note generation
# Get from: https://platform.deepseek.com/api_keys
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
```

**Usage**: Generates structured SOAP notes from de-identified transcripts.

## Storage Configuration

### Supabase Storage Bucket

The audio recordings are stored in Supabase Storage. Ensure the following bucket exists:

- **Bucket Name**: `session-recordings`
- **Privacy**: Private (with RLS policies)
- **Location**: Configured in Supabase dashboard

See `STORAGE_BUCKET_SETUP.md` for detailed setup instructions.

## Database Configuration

### Supabase/PostgreSQL

```bash
# PostgreSQL connection string (already configured)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Direct connection URL (for Prisma migrations)
DIRECT_URL=postgresql://postgres:password@host:5432/postgres
```

## Complete .env.local Template

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Daily.co
DAILY_API_KEY=your_daily_co_api_key
DAILY_API_URL=https://api.daily.co/v1

# OpenAI (Whisper)
OPENAI_API_KEY=sk-your_openai_api_key

# DeepSeek
DEEPSEEK_API_KEY=sk-your_deepseek_api_key

# Paystack (existing)
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

## Setup Steps

1. **Daily.co Setup**:
   - Sign up at https://dashboard.daily.co
   - Create an API key from the Developers section
   - Copy the API key to `DAILY_API_KEY`

2. **OpenAI Setup**:
   - Sign up at https://platform.openai.com
   - Navigate to API Keys section
   - Create a new API key
   - Copy to `OPENAI_API_KEY`
   - Ensure your account has credits/billing enabled

3. **DeepSeek Setup**:
   - Sign up at https://platform.deepseek.com
   - Navigate to API Keys section
   - Create a new API key
   - Copy to `DEEPSEEK_API_KEY`
   - Verify billing/credits are configured

4. **Supabase Storage**:
   - Create `session-recordings` bucket (see `STORAGE_BUCKET_SETUP.md`)
   - Set bucket to private
   - Configure RLS policies for therapist access

## Verification

After adding environment variables:

1. Restart your development server: `npm run dev`
2. Check that API keys are loaded (they won't be printed, but API calls should work)
3. Test video call creation (should create Daily.co room)
4. Test audio upload (should upload to Supabase Storage)
5. Test AI processing (should transcribe and generate notes)

## Security Notes

- Never commit `.env.local` to version control
- Keep API keys secure and rotate them periodically
- Use different keys for development and production
- Monitor API usage to prevent unexpected costs
- Daily.co free tier: 10,000 participant-minutes/month
- OpenAI Whisper: ~$0.006 per minute of audio
- DeepSeek: Very cost-effective, check current pricing

## Cost Estimation (Nigerian Context)

Based on $23/month budget:

- **Daily.co**: Free tier (10k participant-minutes/month) - $0
- **OpenAI Whisper**: ~$0.006/min × 100 sessions × 45min = ~$27/month
- **DeepSeek**: Very affordable, estimate ~$2-5/month for 100 sessions

**Recommendation**: Monitor usage and consider:
- Optimizing audio length
- Using DeepSeek for more operations (cheaper than OpenAI)
- Batch processing during off-peak hours
