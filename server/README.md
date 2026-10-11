# AgriVision API

The Express API is the application boundary between the React client, MongoDB, and the Flask crop-disease classifier.

## Environment

Create `server/.env` with:

```env
PORT=4000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/agrivision?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
FLASK_AI_URL=http://127.0.0.1:5000/predict
```

If MongoDB is unavailable during local development, the service starts with an in-memory store. This keeps registration, authentication, and history usable, but data resets when the API restarts.

## API contracts

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /api/health` | Public | Returns API, database, and AI-service configuration status. |
| `POST /api/auth/register` | Public | Creates a farmer account with a validated email and password. |
| `POST /api/auth/login` | Public | Returns a one-day bearer token and safe user profile. |
| `POST /api/predict` | Authenticated | Accepts one PNG/JPEG crop image (maximum 5 MB), calls Flask, persists the result, and returns treatment guidance. |
| `GET /api/history` | Authenticated | Returns the signed-in farmer's newest predictions. |
| `GET /api/operations/reports` | Officer/Admin | Returns the newest global prediction queue. |
| `GET /api/operations/summary` | Admin | Returns user, officer, and prediction counts. |

Authenticated requests need this header:

```http
Authorization: Bearer <token>
```

## Error behavior

Every endpoint returns JSON. Expected client errors include an `error` message and an appropriate status code: `400` for invalid request data, `401` for missing or invalid sessions, `403` for missing role access, `413` for oversized images, `415` for an unsupported image type, and `503` when the AI service is offline.
