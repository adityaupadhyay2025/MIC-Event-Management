GYM MANAGEMENT SYSTEM - DA2

1. DATABASE
Open Oracle SQL Developer / SQL Plus.
Run db/schema.sql first.
Run db/seed.sql second.
Run db/plsql.sql third.

2. BACKEND
Open a terminal in backend folder:
  npm install
Copy .env.example to .env and fill in your Oracle username, password and connect string.
Example:
  DB_USER=SYSTEM
  DB_PASSWORD=your_password
  DB_CONNECT_STRING=localhost:1521/XEPDB1
Then:
  npm start
Backend: http://localhost:5000

3. FRONTEND
Open frontend/index.html with VS Code Live Server, or serve the frontend folder using any static server.
The frontend calls http://localhost:5000/api.

IMPORTANT:
- The backend needs Oracle Database running.
- If your Oracle service is not XEPDB1, change DB_CONNECT_STRING.
- If your DA1 column names differ, edit db/schema.sql and backend/server.js consistently.

DA2 DEMO FLOW:
1. Open dashboard.
2. Open Members -> Add a record (INSERT).
3. Edit that record (UPDATE).
4. Delete that record (DELETE).
5. Show Equipment, Maintenance and Payments.
6. Open SQL Reports and run the prepared queries.
7. In Oracle, show the PL/SQL procedure/function.
