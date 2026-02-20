# Arduino Launchpad - Setup & Run

## Prerequisites

- Node.js (v16+)
- npm or bun package manager

## Installation

```bash
npm install
# or
bun install
```

## Running the Application

### Option 1: Run Both Frontend & Backend Together

```bash
npm run dev:all
```

This starts:
- **Frontend (Vite)**: http://localhost:8080
- **Backend (Express)**: http://localhost:5000

### Option 2: Run Them Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

If you are already inside the `server/` folder, use:
```bash
npm run dev:server
# or
npm start
```

## How It Works

1. **Frontend** (Vite + React) runs on `http://localhost:8080`
2. **Backend** (Express.js) runs on `http://localhost:5000`
3. When you select sensors in the UI, it sends a request to `/api/generate`
4. The backend calls the **OpenAI API** to generate project guides
5. The response is rendered in the frontend with images and code

## Environment Variables

Create or update `.env.local` in the root directory:

```env
OPENAI_API_KEY=your_actual_api_key_here
```

`server/.env.local` is also supported and takes precedence if present.

**Never commit this file to version control!**

## API Endpoint

### POST /api/generate

**Request:**
```json
{
  "sensors": [
    "Humidity Temperature Sensor",
    "Moisture Sensor",
    "Light Sensor",
    "Power LED"
  ]
}
```

**Response:**
```json
{
  "result": "1️⃣ PROJECT TITLE...[full project guide]"
}
```

## Testing the API

### Using curl:
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"sensors":["Humidity Temperature Sensor","Moisture Sensor"]}'
```

### Using Postman:
1. Create a new POST request to `http://localhost:5000/api/generate`
2. Set header: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "sensors": ["Humidity Temperature Sensor", "Moisture Sensor"]
   }
   ```

## Troubleshooting

### "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This usually means:
- Backend server is not running
- API key is not configured
- Network request is failing

**Solution:**
1. Make sure `npm run dev:server` is running
2. Check `server/.env.local` or `.env.local` has `OPENAI_API_KEY` set
3. Check browser console for more details

### Port Already In Use

If port 5000 is already in use:
```bash
PORT=3001 npm run dev:server
```

Then update the frontend to call `http://localhost:3001/api/generate`

## Production Deployment

For production, use a service like Vercel, Heroku, or Railway to host both:
- Frontend (Vite build)
- Backend (Express server)

Ensure environment variables are set in your hosting platform's settings.
