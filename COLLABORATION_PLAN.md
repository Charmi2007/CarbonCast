# CarbonCast Collaboration Plan — Authentication, Onboarding, & Social Feed

This file serves as the shared coordination document between the **Backend/AI** and **Frontend** developers (and their Antigravity AI coders). 

---

## 1. Database Model & Endpoint Specifications

### User Schema (MongoDB `users` collection)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, lowercase index)",
  "password_hash": "string (hashed using bcrypt/pbkdf2)",
  "createdAt": "ISODate"
}
```

### Social Post Schema (MongoDB `posts` collection)
```json
{
  "_id": "ObjectId",
  "userId": "string (id of author)",
  "userName": "string (name of author)",
  "text": "string (up to 280 characters)",
  "category": "string (transport | energy | food | lifestyle)",
  "carbonSaved": "float (kg CO₂e saved)",
  "createdAt": "ISODate"
}
```

### Calculation Schema Link (MongoDB `records` collection)
We are adding an optional `userId` field to the root of calculation records:
```json
{
  "_id": "ObjectId",
  "userId": "string (null if guest calculation)",
  "personal": { "name": "string" },
  "...": "..."
}
```

---

## 2. API Contract Specs (Prefix: `http://localhost:5000`)

### A. User Signup
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/signup`
*   **Payload**: `{ "name": "string", "email": "string", "password": "string" }`
*   **Response (201 Created)**: `{ "status": "success", "token": "JWT_STRING", "user": { "id": "string", "name": "string", "email": "string" } }`

### B. User Login
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/login`
*   **Payload**: `{ "email": "string", "password": "string" }`
*   **Response (200 OK)**: `{ "status": "success", "token": "JWT_STRING", "user": { "id": "string", "name": "string", "email": "string" } }`

### C. Get Current User Details
*   **Method**: `GET`
*   **Path**: `/api/v1/auth/me`
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**: `{ "status": "success", "user": { "id": "string", "name": "string", "email": "string" } }`

### D. Secure Calculation History
*   **Method**: `GET`
*   **Path**: `/api/v1/results/my-history`
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**: List of calculations matching `userId`.

### E. Guest Data Sync
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/sync-guest-data`
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Payload**: `{ "record_ids": ["648f...", ...] }`
*   **Response (200 OK)**: `{ "status": "success", "synced_count": 3 }`

### F. Create Daily Green Post
*   **Method**: `POST`
*   **Path**: `/api/v1/posts`
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Payload**:
    ```json
    {
      "text": "Rode my bicycle to work today instead of driving!",
      "category": "transport",
      "carbon_saved": 4.5
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": "post_123",
      "user_id": "user_id_123",
      "user_name": "John Doe",
      "text": "Rode my bicycle to work today instead of driving!",
      "category": "transport",
      "carbon_saved": 4.5,
      "timestamp": "2026-07-02T12:00:00Z"
    }
    ```

### G. Get Public Community Feed
*   **Method**: `GET`
*   **Path**: `/api/v1/posts`
*   **Response (200 OK)**: List of the 50 latest daily green posts from all users.

---

## 3. Integration Checklist & Division of Labor

### 🛠️ Backend Tasks (Status: [COMPLETED])
*   [x] Add `passlib` and `pyjwt` dependencies.
*   [x] Implement secure hashing and JWT helper functions.
*   [x] Build signup, login, profile, user history, and guest sync endpoints.
*   [x] Build daily green posts create (`POST /api/v1/posts`) and read (`GET /api/v1/posts`) endpoints.
*   [x] Verify all auth and post endpoint pathways using automated test scripts.

### 🎨 Frontend Tasks (Status: [COMPLETED])
*   [x] **Create Auth Context**: Build `AuthContext.tsx` storing tokens in `localStorage` and adding Bearer headers to Axios calls.
*   [x] **Implement Onboarding Flow**: Redesign the signup process:
    - Step 1: User registers (Name, Email, Password).
    - Step 2: User completes their first Carbon Footprint calculation form in-place as part of onboarding (linked to user account).
    - Step 3: Redirect to the pre-populated dashboard, avoiding repeat form entry.
*   [x] **Build Social Community Feed**:
    - Create a **Community Feed** page/tab.
    - Include a small text box: *"What did you do today to reduce carbon? (e.g. Walked to lunch)"*.
    - Add a category dropdown (`transport`, `energy`, `food`, `lifestyle`) and carbon saved box (defaulting to a general estimate).
    - Display posts in a clean, vertical, scrollable grid with user names, green category badges, and carbon savings counters.
*   [x] **Sync Guest Data on Signup**: Merge guest history arrays using `/api/v1/auth/sync-guest-data`.
*   [x] **Compulsory Account Creation & Protected Routes**: Enforced a `ProtectedRoute` wrapper guarding `/calculator`, `/dashboard`, `/quests`, `/community`, and `/tips`. Unauthenticated guests are automatically routed to the sign-up page.
*   [x] **Branding Visual Enhancements**:
    - Extracted the circular footprint & leaf logo mark from `logo_with_text_and_slogan.jpeg` as `/logo.jpg` static asset.
    - Rendered the brand name `"CΛRBON CΛST"` using live, highly-styled HTML text and dynamic CSS styling.
    - Displayed the custom slogan `"Measure. Manage. Make a difference."` as styled subtext.

---

## 4. Antigravity Agent Coordination Notes (For Backend AI)

**To the next Antigravity AI assisting with Backend/ML tasks:**
- **Compulsory Route Protection active**: The frontend now guards all calculation and tracking routes using a `<ProtectedRoute>` component checking `localStorage.getItem('token')`.
- **Branding Assets**: Visual logo assets are now resolved from the static `/logo.jpg` path, ensuring smooth TypeScript compilation.
- **Machine Learning Integration**: If modifying endpoint payload shapes, ensure the results mapping continues to conform to the layout.
