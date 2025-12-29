# Deploying Valorant Frontend to AWS (S3 + CloudFront)

This guide walks you through deploying the frontend to AWS for $0 using the Free Tier.

## Prerequisites
- AWS Account (Free Tier eligible)
- Node.js installed
- Build artifacts (`dist` folder)

## Step 1: Build the Project
Run the text to optimized build:
```powershell
npm run build
```
This creates a `dist` folder with your static assets.

## Step 2: Create S3 Bucket
1. Go to **AWS Console > S3**.
2. Click **Create bucket**.
3. Name: e.g., `valorant-frontend-prod`.
4. Region: Choose one close to you (e.g., `us-east-1`).
5. **Uncheck** "Block all public access" (Warning will appear, acknowledge it).
   - *Note: For CloudFront OAI (more secure), you can keep it blocked, but for simplest static hosting, uncheck.*
6. Create bucket.

### Configure Static Hosting
1. Go to the bucket > **Properties**.
2. Scroll to **Static website hosting** > Edit > Enable.
3. Index document: `index.html`.
4. Error document: `index.html` (Important for React Router).
5. Save changes.

### Bucket Policy
1. Go to **Permissions** > **Bucket policy**.
2. Paste this (replace `YOUR_BUCKET_NAME`):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

## Step 3: Upload Files
1. Go to **Objects** tab.
2. Upload the **contents** of your `dist` folder (not the folder itself, but the files inside).

## Step 4: CloudFront (CDN) - Optional but Recommended for Speed & HTTPS
1. Go to **AWS Console > CloudFront**.
2. **Create distribution**.
3. Origin domain: Select your S3 bucket website endpoint (it might show up in dropdown, or paste the static hosting URL).
4. Viewer protocol policy: **Redirect HTTP to HTTPS**.
5. Create Distribution.
6. Once deployed, you get a `d1234.cloudfront.net` URL. Use this to access your site.

## Cost Analysis
- **S3 Standard**: First 5GB free.
- **CloudFront**: First 1TB data transfer free.
- **Total Estimated Cost**: $0.00 / month (within limits).
