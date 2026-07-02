# CarbonCast Collaboration Plan — Authentication & User Accounts

This file serves as the shared coordination document between the **Backend/AI** and **Frontend** developers (and their Antigravity AI coders). 

---

## 1. Database Model & Endpoint Specifications

### User Schema (MongoDB `users` collection)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, lowercase index)",
  "password_hash": "string (hashed using bcrypt)",
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
*   **Request Payload**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "648f...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    ```

### B. User Login
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/login`
*   **Request Payload**:
    ```json
    {
      "email": "john@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "648f...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    ```

### C. Get Current User Details
*   **Method**: `GET`
*   **Path**: `/api/v1/auth/me`
*   **Headers Required**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "user": {
        "id": "648f...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    ```

### D. Secure Calculation History
*   **Method**: `GET`
*   **Path**: `/api/v1/results/my-history`
*   **Headers Required**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    Returns a list of calculation history records belonging strictly to the authenticated user.

---

## 3. Integration Checklist & Division of Labor

### 🛠️ Backend Tasks (Status: [IN PROGRESS])
*   [x] Add `passlib[bcrypt]` and `pyjwt` dependencies.
*   [ ] Implement password hashing and JWT encoding/decoding utilities in `auth.py`.
*   [ ] Register signup, login, and profile validation router routes in `app.py`.
*   [ ] Update calculation creation route (`POST /api/v1/calculate`) to check for optional Authorization header and link the calculation to a `userId`.
*   [ ] Implement secure user-specific history route (`GET /api/v1/results/my-history`).

### 🎨 Frontend Tasks (Status: [PENDING FRONTEND AI])
*   [ ] **Create Auth Context**: Build `AuthContext.tsx` to wrap the app, maintaining token/user state and logging tokens to `localStorage`.
*   [ ] **Configure Axios Interceptors**: Modify config to automatically attach the `Authorization: Bearer <token>` header if a token exists.
*   [ ] **Build Onboarding Forms**: Implement Sign Up, Login, and Onboarding page interfaces.
*   [ ] **Update Dashboard Journey**: When loading `/dashboard/:id` or history trends, query `/api/v1/results/my-history` to render the logged-in user's data, falling back to local storage `my_calcs` only if the user is a guest.
*   [ ] **Sync Guest Data on Login**: Loop through anonymous IDs in local storage `my_calcs` and sync them (link them to the user account) upon signup/login.
