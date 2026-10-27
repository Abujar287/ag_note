# Security Specification - Smart Bangla Notepad

## Data Invariants
1. A note must belong to a valid user (`userId` matches `request.auth.uid`).
2. Notes in the `users/{userId}/notes` collection must have a `userId` that matches the `{userId}` path variable.
3. Users can only read and write their own data.
4. Timestamps (`createdAt`, `updatedAt`) must be validated against `request.time` where possible, or kept consistent.

## Security Rules Plan
- Implement `isValidNote` and `isValidPreferences` helpers.
- Use `request.auth.uid` for all identity checks.
- Enforce strict field matching with `hasOnly`.
- Validate document IDs.
