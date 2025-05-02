# SiteSafe AI - MVP Scaffold

This repository contains the scaffold for the SiteSafe AI MVP, a lightweight SaaS application designed to automate UK construction Health & Safety compliance reporting using AI.

Built with Next.js, Supabase, Stripe, Prisma, and OpenAI.

## Features Implemented (Scaffold)

*   **Landing Page:** Basic structure with hero section, benefits, pricing placeholder, and CTA.
*   **Authentication:** NextAuth.js setup with Email Magic Link provider and Prisma adapter.
*   **Database:** Prisma schema defined for User, Subscription, Upload, and Report models.
*   **Payments:** Stripe Checkout integration for subscription creation (monthly/yearly with trial) and webhook handling for subscription status updates.
*   **File Uploads:** API route for handling file uploads to Supabase Storage.
*   **AI Processing:** Placeholder API route (`/api/queue/process`) for triggering AI report generation (requires actual AI logic implementation and potentially a proper queue system).
*   **Dashboard:** Basic dashboard page displaying user reports and an onboarding checklist placeholder.
*   **Report Viewing:** Page for displaying generated reports (Markdown rendering) with risk flags and PDF export functionality using `@react-pdf/renderer`.

## Getting Started

### 1. Prerequisites

*   Node.js (v18 or later recommended)
*   npm or pnpm or yarn
*   Access to Supabase (for Postgres database and file storage)
*   Access to Stripe (for payments)
*   Access to OpenAI API (for AI features)
*   An email sending service configured for NextAuth magic links (e.g., Resend, SendGrid)

### 2. Clone & Install Dependencies

```bash
# Clone the repository (or download and extract the code)
git clone <repository-url>
cd sitesafe-ai

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Now, edit the `.env` file and replace all placeholder values with your actual credentials and keys:

*   `DATABASE_URL`: Your full Supabase Postgres connection string.
*   `SUPABASE_URL`: Your Supabase project URL.
*   `SUPABASE_ANON_KEY`: Your Supabase project anon key.
*   `STRIPE_SECRET_KEY`: Your Stripe secret key (use a test key for development).
*   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook endpoint secret.
*   `STRIPE_PRICE_ID_MONTHLY`: Stripe Price ID for your monthly plan.
*   `STRIPE_PRICE_ID_YEARLY`: Stripe Price ID for your yearly plan.
*   `NEXTAUTH_SECRET`: A randomly generated secret (`openssl rand -base64 32`).
*   `NEXTAUTH_URL`: Your development URL (e.g., `http://localhost:3000`) or production URL.
*   `OPENAI_API_KEY`: Your OpenAI API key.
*   Email server variables (`EMAIL_SERVER_...`, `EMAIL_FROM`) for NextAuth magic links.

### 4. Set up Supabase Storage

*   Go to your Supabase project dashboard.
*   Navigate to Storage.
*   Create a new bucket named `uploads`.
*   Configure Row Level Security (RLS) policies for the `uploads` bucket to ensure users can only upload/access their own files. Example policies:
    *   Allow authenticated users to upload:
        ```sql
        CREATE POLICY "Allow authenticated uploads" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
        ```
    *   Allow authenticated users to read their own files:
        ```sql
        CREATE POLICY "Allow authenticated read access" ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
        ```

### 5. Apply Database Migrations

Once your `DATABASE_URL` is correctly set in `.env`, run Prisma Migrate:

```bash
npx prisma migrate dev --name init
```

This will synchronize your Supabase database schema with the `prisma/schema.prisma` file.

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Set up Stripe Webhook

*   Install the Stripe CLI.
*   Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
*   Copy the webhook signing secret provided by the CLI and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Key Implementation Notes

*   **AI Logic:** The AI report generation in `/api/queue/process/route.ts` is a placeholder. You need to implement the actual OpenAI API calls, function calling sequence, text extraction (PDF/OCR), and potentially integrate a robust queue system (e.g., BullMQ, Vercel KV Queue).
*   **Error Handling:** Basic error handling is included, but production applications will require more comprehensive error logging and monitoring.
*   **Security:** Ensure proper RLS policies are set in Supabase for storage and potentially for database tables.
*   **PDF Export:** The PDF export uses `@react-pdf/renderer`. Markdown rendering within the PDF is basic; complex formatting might require alternative approaches.
*   **Email:** Email sending for magic links requires configuration of your chosen email provider.

## Deployment

This project is configured for deployment on Vercel. Ensure all environment variables are set in your Vercel project settings.

```bash
# Deploy using Vercel CLI
vercel
```

Include the `vercel.json` file for configuration.

## Acceptance Tests (Manual Check)

Refer to the original brief for acceptance tests. Manually verify these flows after setting up your environment:

*   Registration & Payment Flow
*   Upload & Report Generation (using placeholder AI logic)
*   Access Control (non-subscribers blocked)
*   Stripe Webhook Handling (test subscription updates/cancellations)

