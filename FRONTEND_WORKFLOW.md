# KikoCloud Web Client - Architecture & Workflow Specification (BFF Architecture)

## 1. Architecture & Direct Upload Lifecycle

KikoCloud adopts a **Next.js (BFF Proxy & Metadata Sanitization) + AWS Lambda (Serverless Control Plane) + MinIO (Edge Storage Offloading)** architecture.
* **Business Metadata Path**: The browser communicates exclusively with the Next.js BFF (`app/api/`). The BFF extracts session tokens, forwards requests to the Go backend, cleans payload formats (DTO Mapping: snake_case -> camelCase), and handles errors uniformly.
* **Physical File Stream Path**: After obtaining a presigned URL, the browser issues direct `PUT` requests to the edge MinIO storage node (monitoring progress bars), offloading heavy bandwidth and memory from Next.js and AWS Lambda.

```
[ app/web (UI) ]              [ app/api (Next.js BFF) ]          [ AWS Lambda Control (Go) ]       [ MinIO Edge Node ]
       |                                  |                                  |                                  |
       | 1. useDirectUpload selects file  |                                  |                                  |
       | 2. POST /api/files/upload-ticket |                                  |                                  |
       |--------------------------------->|                                  |                                  |
       |                                  | Extract Cookie Session           |                                  |
       |                                  | 3. POST /api/v1/files/...-ticket |                                  |
       |                                  |    Header: Bearer <JWT>          |                                  |
       |                                  |--------------------------------->|                                  |
       |                                  |                                  | Validate Token & Generate Ticket |
       |                                  | 4. Return snake_case metadata    |                                  |
       |                                  |<---------------------------------|                                  |
       |                                  | Map to camelCase DTO             |                                  |
       | 5. Return { fileId, uploadUrl }   |                                  |                                  |
       |<---------------------------------|                                  |                                  |
       |                                                                                                        |
       | 6. Axios PUT direct upload to MinIO uploadUrl (Listen to onUploadProgress to update progress bar)     |
       |------------------------------------------------------------------------------------------------------->|
       |                                                                                                        |
       | 7. MinIO upload complete (HTTP 200)                                                                    |
       |<-------------------------------------------------------------------------------------------------------|
       |                                  |                                  |                                  |
       | 8. POST /api/files/callback      |                                  |                                  |
       |--------------------------------->|                                  |                                  |
       |                                  | 9. POST /api/v1/files/callback   |                                  |
       |                                  |--------------------------------->|                                  |
       |                                  |                                  | HeadObject verify & status ACTIVE|
       |                                  | 10. Confirmation Success         |                                  |
       |                                  |<---------------------------------|                                  |
       | 11. Trigger UI list auto refresh |                                  |                                  |
       |<---------------------------------|                                  |                                  |
```

---

## 2. Core Tech Stack

* **Core Framework**: Next.js 16.3.2 (App Router, Server Components & Route Handlers)
* **Authentication**: `@supabase/ssr` + `@supabase/supabase-js` (Pure Google OAuth 2.0 PKCE flow, Cookie session auto-renewal)
* **BFF Server Communication**: Native Server `fetch` / Server `api-client` (Communicates with Go Lambda & handles DTO Mapping)
* **Client Styling & UI**: Tailwind CSS v4.3+ `clsx` + `tailwind-merge` + `lucide-react` icons
* **Client State & Data Fetching**: `@tanstack/react-query` (SWR caching, optimistic updates, async state machine)
* **HTTP Client**: `axios` (Dedicated to client-side direct binary `PUT` uploads to MinIO with progress tracking)

---

## 3. Project Directory Structure

Strictly decoupled into the Application View Layer (`app/web/`) and the Data Proxy Transformation Layer (`app/api/`):

```text
kiko-cloud-web/
├── app/
│   ├── web/                     # Core Directory for Web Frontend Application Views
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx     # Login Page: Mounts @/features/auth/...
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Main Shell: Mounts @/components/layout/Navbar, Sidebar
│   │   │   ├── page.tsx         # My Files: Mounts @/features/files/components/FileExplorer
│   │   │   ├── recent/
│   │   │   │   └── page.tsx     # Recent Files View
│   │   │   └── trash/
│   │   │       └── page.tsx     # Trash Bin View
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts     # Supabase Google OAuth PKCE Callback Route Handler
│   │   │
│   │   ├── features/            # Domain-Driven Modules (UI, Hooks, BFF Client, Types Self-Contained)
│   │   │   ├── auth/            # Authentication Feature
│   │   │   │   ├── components/  # GoogleLoginBtn, AuthGuardCard
│   │   │   │   ├── hooks/       # useGoogleAuth, useCurrentUser
│   │   │   │   └── types/       # AuthUser, AuthState
│   │   │   │
│   │   │   ├── files/           # File Explorer & Operations Feature
│   │   │   │   ├── components/  # FileTable, FileGridCard, FileContextMenu, EmptyState
│   │   │   │   ├── hooks/       # useFileList, useFileDownload, useFileDelete
│   │   │   │   ├── api/         # BFF Client functions invoking /api/files
│   │   │   │   └── types/       # FileItem (Frontend camelCase definition), FileViewMode
│   │   │   │
│   │   │   ├── upload/          # Direct Upload Engine Feature
│   │   │   │   ├── components/  # UploadDropzone, UploadFloatingTray, DuplicateConflictModal
│   │   │   │   ├── hooks/       # useDirectUpload (BFF Ticket -> MinIO Upload -> BFF Callback)
│   │   │   │   └── types/       # UploadTask, UploadStatus
│   │   │   │
│   │   │   └── preview/         # Modal Online Preview Feature
│   │   │       ├── components/  # PreviewModal, ImageViewer, VideoPlayer, TextDocViewer
│   │   │       └── hooks/       # usePreviewModal
│   │   │
│   │   ├── components/          # Shared Generic UI Components for Web
│   │   │   ├── layout/          # Navbar, Sidebar, Breadcrumbs, StorageCapacityBar
│   │   │   ├── ui/              # Button, Modal, Dropdown, Skeleton, Toast
│   │   │   └── icons/           # File Extension Icon Mapping Components
│   │   │
│   │   ├── hooks/               # Global Utility Hooks (useMediaQuery, useDebounce, etc.)
│   │   └── lib/                 # Web Utilities & Supabase Browser Client
│   │       ├── supabase/        # Browser Client Configuration
│   │       └── utils.ts         # formatBytes, cn, formatDate
│   │
│   ├── api/                     # Next.js BFF Proxy & Data Transformation Layer (Route Handlers)
│   │   ├── files/
│   │   │   ├── route.ts         # GET (Fetch file list & map DTO)
│   │   │   ├── upload-ticket/
│   │   │   │   └── route.ts     # POST (Request direct upload Ticket & map DTO)
│   │   │   ├── callback/
│   │   │   │   └── route.ts     # POST (Forward upload confirmation callback)
│   │   │   └── [id]/
│   │   │       ├── download-url/
│   │   │       │   └── route.ts # GET (Fetch presigned download URL)
│   │   │       └── route.ts     # DELETE (Delete file metadata & storage object)
│   │   └── lib/
│   │       ├── backend-client.ts# BFF Server Client for invoking Go Lambda
│   │       └── mappers/         # Data sanitization functions (snake_case -> camelCase DTO)
│   │           └── file-mapper.ts
│   │
│   ├── globals.css              # Global Tailwind Styles
│   └── layout.tsx               # Global Root Layout (Mounts React Query Provider, Toaster)
│
├── middleware.ts                # Next.js Edge Route Guard (Redirects unauthenticated users to /web/login)
├── .env.local                   # Environment Variable Configuration
├── tsconfig.json                # Path Alias Configuration
└── package.json
```

---

## 4. Key Configurations & Path Aliases

### `tsconfig.json` (Path Alias)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/web/*": ["./app/web/*"],
      "@/features/*": ["./app/web/features/*"],
      "@/components/*": ["./app/web/components/*"],
      "@/lib/*": ["./app/web/lib/*"],
      "@/hooks/*": ["./app/web/hooks/*"],
      "@/api-lib/*": ["./app/api/lib/*"]
    }
  }
}
```

### `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
GO_BACKEND_API_BASE_URL=https://api.kikocloud.ca
```

---

## 5. BFF Data Mapping Specification (DTO Mapping in `app/api/`)

### Raw Response from Go Backend (PostgreSQL Schema Alignment):
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_id": "2c33311e-47f5-4adc-a10c-dd604c79e316",
  "original_name": "architecture_diagram.png",
  "object_key": "users/2c33311e-47f5-4adc-a10c-dd604c79e316/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.png",
  "bucket": "shu-kikodrive",
  "size_bytes": 2048576,
  "content_type": "image/png",
  "e_tag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
  "status": "ACTIVE",
  "created_at": "2026-08-23T15:00:00Z",
  "updated_at": "2026-08-23T15:00:00Z"
}
```

### Sanitized Output Returned to Frontend by BFF (Clean Camel Case DTO):
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "name": "architecture_diagram.png",
  "size": 2048576,
  "contentType": "image/png",
  "status": "active",
  "createdAt": "2026-08-23T15:00:00Z"
}
```

---

## 6. Detailed Implementation Milestones & Tasks

### Phase 1: Infrastructure & Google Authentication Integration
1. **Project Scaffolding & Dependencies**:
   ```bash
   npx create-next-app@latest kiko-cloud-web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   npm install @supabase/ssr @supabase/supabase-js @tanstack/react-query axios lucide-react clsx tailwind-merge
   ```
2. **Edge Middleware & OAuth Callback**:
   - `middleware.ts`: Extract session using `@supabase/ssr`, protect `/web/(dashboard)` routes, redirect unauthenticated requests to `/web/login`.
   - `app/web/auth/callback/route.ts`: Exchange Google OAuth PKCE authorization code for persistent session cookies.
3. **Login View Implementation**:
   - `app/web/features/auth/components/GoogleLoginBtn.tsx` triggers Google OAuth 2.0 login.

---

### Phase 2: BFF Proxy Layer & Data Sanitizer Implementation (`app/api/`)
1. **BFF Backend Client (`app/api/lib/backend-client.ts`)**:
   - Extract Supabase JWT from current request context, append `Authorization: Bearer <token>` & `user_id` query params, and invoke `GO_BACKEND_API_BASE_URL`.
2. **Metadata Mappers (`app/api/lib/mappers/file-mapper.ts`)**:
   - Create `mapFileToDTO` / `mapFileListToDTO` functions to map Go backend fields (`size_bytes`, `original_name`, `file_id`) into frontend DTOs.
3. **Route Handlers**:
   - `app/api/files/upload-ticket/route.ts`: Proxy `POST /api/v1/files/upload-ticket` and transform response DTO.
   - `app/api/files/callback/route.ts`: Proxy `POST /api/v1/files/callback`.
   - `app/api/files/route.ts`: Proxy `GET /api/v1/files` and output sanitized file arrays.
   - `app/api/files/[id]/download-url/route.ts`: Proxy `GET /api/v1/files/:id/download-url`.
   - `app/api/files/[id]/route.ts`: Proxy `DELETE /api/v1/files/:id`.

---

### Phase 3: Dashboard Layout & File Explorer (Dashboard & Files Feature)
1. **Shared Layout (`app/web/components/layout/`)**:
   - `Sidebar`: Navigation items, storage capacity bar, user profile.
   - `Navbar`: Search bar, global upload button, logout trigger.
   - `app/web/(dashboard)/layout.tsx`: Assembles the global layout framework.
2. **File Explorer & Actions (`app/web/features/files/`)**:
   - `app/web/features/files/api/`: Client functions invoking BFF (`/api/files`).
   - Drive `FileTable` & `FileGridCard` using React Query for smooth caching, skeleton loaders, and error states.
   - Wire optimistic updates for file deletion and download triggers.

---

### Phase 4: Direct Upload Engine & Progress Management (Upload Feature)
1. **Global Drag & Drop (`app/web/features/upload/components/UploadDropzone.tsx`)**:
   - Listen for drag & drop events across the window and support multi-file selection.
2. **Direct Upload Hook (`app/web/features/upload/hooks/useDirectUpload.ts`)**:
   - 1) Request ticket from BFF `/api/files/upload-ticket` (returns `{ fileId, uploadUrl, objectKey }`).
   - 2) Issue direct Axios `PUT uploadUrl` to MinIO, monitoring `onUploadProgress` to update progress state.
   - 3) After completion, issue confirmation request to BFF `/api/files/callback`.
   - 4) Trigger React Query invalidation to refresh the file list automatically.
3. **Duplicate Conflict Resolution (`app/web/features/upload/components/DuplicateConflictModal.tsx`)**:
   - Intercept duplicate filenames and present user options (Rename & Upload / Skip Upload).
4. **Floating Upload Progress Tray (`app/web/features/upload/components/UploadFloatingTray.tsx`)**:
   - Floating tray displaying real-time task progress, status icons, and retry buttons.

---

### Phase 5: Modal Online Preview & UX Refinements (Preview Feature)
1. **Modal Online Preview (`app/web/features/preview/components/PreviewModal.tsx`)**:
   - Support image display, HTML5 video streaming, PDF inline viewing (via local Object URLs), and plain text viewing.
2. **UX Polish**:
   - Shareable link copying and toast feedback.
