# Deploying Easy Habit Pro to Google Cloud

This guide explains how to deploy the built static application to Google Cloud. Since this is a Vite Single Page Application (SPA), the recommended approach is using **Firebase Hosting** (part of Google Cloud Platform).

## Prerequisite: Build the Project

I have already built the project for you. The production-ready files are in the `dist/` folder.
If you need to rebuild it later:

```bash
npm run build
```

## Option 1: Firebase Hosting (Recommended)

Firebase Hosting is the easiest way to host static apps on Google Cloud.

1.  **Install Firebase CLI** (if not already installed):
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Google**:
    ```bash
    firebase login
    ```

3.  **Initialize Firebase**:
    Run this command in the project root:
    ```bash
    firebase init hosting
    ```

    **Select the following options when prompted:**
    *   **Project**: Select "Use an existing project" (select your Google Cloud project) or "Create a new project".
    *   **Public directory**: Type `dist`
    *   **Configure as a single-page app (rewrite all urls to /index.html)?**: Type `Yes` (y)
    *   **Set up automatic builds and deploys with GitHub?**: `No` (n) (unless you want that)
    *   **File dist/index.html already exists. Overwrite?**: `No` (n)

4.  **Deploy**:
    ```bash
    firebase deploy
    ```

    Your app will be live at `https://your-project-id.web.app`.

---

## Option 2: Google Cloud Storage (Manual)

You can also host the static files directly in a Google Cloud Storage bucket.

1.  **Create a Bucket**:
    *   Go to Google Cloud Console > Cloud Storage > Buckets.
    *   Create a new bucket (e.g., `easy-habit-pro`).
    *   Uncheck "Enforce public access prevention" (to allow a website).
    *   Choose "Uniform" access control.

2.  **Upload Files**:
    *   Upload all files and folders inside `dist/` to the root of the bucket.

3.  **Configure Website**:
    *   In the bucket configuration, look for "Website configuration".
    *   **Index page**: `index.html`
    *   **Error page**: `index.html` (Important for SPA routing)

4.  **Make Public**:
    *   Go to the "Permissions" tab.
    *   Click "Grant Access".
    *   **New principals**: `allUsers`
    *   **Role**: `Storage Object Viewer`
    *   Save.

    Your site will be available via the bucket's public endpoint (usually `https://storage.googleapis.com/YOUR_BUCKET_NAME/index.html` or a custom domain).

---

## Option 3: Google Cloud Run (Recommended for Scalability)

This option uses Docker to containerize your application, ensuring it runs exactly the same way in the cloud as it does locally (or in a container). This is the industry-standard way to deploy specialized web apps to Google Cloud.

**Prerequisites:**
*   [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`) installed and initialized.
*   (Optional) Docker installed for local testing.

**Files Created for you:**
*   `Dockerfile`: Defines how to build the container (Node.js build -> Nginx server).
*   `nginx.conf`: Configures Nginx to handle Single Page App routing (redirects 404s to index.html).
*   `.dockerignore`: Keeps your image small.

### Deployment Steps

1.  **Enable Services** (One time only):
    Enable the Cloud Run and Container Registry/Artifact Registry APIs.
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```

2.  **Build and Deploy Single Command**:
    Deepmind/Google Cloud recommends using Cloud Build for the easiest experience (no local Docker required).

    Run this from your project root:

    ```bash
    gcloud run deploy easy-habit-pro \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

    *   `easy-habit-pro`: The name of your service.
    *   `--source .`: Builds the container from the current directory (using the Dockerfile).
    *   `--allow-unauthenticated`: Makes the website public.

3.  **Wait for the URL**:
    The command will output a Service URL (e.g., `https://easy-habit-pro-xyz-uc.a.run.app`). Click it to see your live app!

### 4. Configure Environment Variables (Critical)

You need to add your Supabase credentials so the app can connect to the database.

1.  Go to the [Cloud Run Console](https://console.cloud.google.com/run).
2.  Click on your service (`easy-habit-pro`).
3.  Click **"Edit & Deploy New Revision"** (at the top).
4.  Go to the **"Variables & Secrets"** tab.
5.  Add the following variables:
    *   `VITE_SUPABASE_URL`: (Your Supabase Project URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
6.  Click **"Deploy"**.

**Note:** This works because I've added a special script (`env.sh`) that injects these variables into the app when the container starts.

```bash
# Build the image
docker build -t easy-habit-pro .

# Run the container on localhost:8080
docker run -p 8080:80 easy-habit-pro
```
Open http://localhost:8080 to verify.
