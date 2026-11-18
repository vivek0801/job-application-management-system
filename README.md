# Job Application Tracker (Full Stack)

## Requirements
- Node.js LTS
- MySQL Server and MySQL Workbench
- VS Code (recommended)

## 1. Create the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Open and execute `server/db/schema.sql`.
3. This creates the `job_tracker` database, the `applications` table, and two sample rows.

## 2. Configure the backend
1. Open a terminal in `server`.
2. Copy `.env.example` to `.env`.
3. Put your own MySQL password in `.env` (do not share or commit `.env`).
4. Run `npm install`.
5. Run `npm run dev`.
6. Check `http://localhost:5000/api/health`. Expected response: `{"status":"ok","database":"connected"}`.

## 3. Start the React frontend
1. Open a second terminal in `client`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL, usually `http://localhost:5173`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/applications` | Fetch all applications; optional `?status=Interview&search=Acme` |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |
| GET | `/api/health` | Check API and database connectivity |

Example POST JSON:
```json
{
  "company": "Infosys",
  "role": "Systems Engineer",
  "status": "Applied",
  "applied_date": "2026-11-18",
  "notes": "Applied through careers portal"
}
```

## Architecture / interview flow
Browser (React) -> `fetch()` HTTP request -> Express route -> parameterized SQL query via `mysql2` connection pool -> MySQL -> JSON response -> React state update -> UI re-render.

- React manages forms, search/filter state and renders the table.
- Node.js runs JavaScript on the server.
- Express defines REST endpoints and middleware (`express.json`, `cors`).
- `mysql2/promise` communicates with MySQL using a connection pool.
- SQL stores persistent records in the `applications` table.
- `?` placeholders keep user values separate from SQL text and help prevent SQL injection.

## Troubleshooting
- `ECONNREFUSED`: ensure MySQL Server is running and DB_HOST/port are correct.
- `Access denied`: check DB_USER and DB_PASSWORD in `.env`.
- `Unknown database`: execute `server/db/schema.sql` in Workbench.
- Frontend cannot reach API: start backend on port 5000 and frontend on port 5173.
- If the port is already in use, stop the other process or change PORT in `.env` (and update the client API URL if needed).
