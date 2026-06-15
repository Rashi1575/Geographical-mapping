# Smart Healthcare Mapping System

## Frontend & Backend Integration Notes

## Current Status

* Frontend is complete and ready for backend integration.
* Authentication pages (Login, Signup, Forgot Password) are implemented.
* Responsive layout is supported for both desktop and mobile.
* Guest mode is available.
* All current data is mock/static and should be replaced with backend APIs.

## Backend Integration

* Connect Login, Signup, and Forgot Password to backend APIs.
* Use `src/services/authService.ts` as the integration point for authentication.
* Replace mock/static hospital data, recommendations, search results, and placeholder values with real database/API responses.
* Route generation, distance, and availability can be connected to real mapping/routing services.
