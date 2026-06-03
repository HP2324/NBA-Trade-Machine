# NBA Trade Machine

A full-stack web application that simulates NBA trade validation using real salary data. Select players and draft picks from up to three teams and instantly check whether the trade satisfies the NBA's salary matching rules (125% + $100,000).

---

## Features

- Select up to 3 teams and build multi-team trades
- Toggle between players and draft picks per team
- Assign destinations for each asset in 3-team trades
- Real-time trade validation using the NBA's 125% + $100K salary rule
- Per-team breakdown showing outgoing, incoming, max allowed, and whether the trade is valid

---

## Technologies Used

**Frontend**
- React 18
- Tailwind CSS
- Axios

**Backend**
- Java 21
- Spring Boot 3.2.5 (Tomcat embedded)
- Apache Commons CSV
- Jackson (JSON serialization)

**Infrastructure**
- Docker + Docker Compose
- Nginx (frontend reverse proxy)

---

## Project Structure

```
trade-machine/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/trademachine/
│   │       │   ├── TradeMachineApplication.java
│   │       │   ├── controller/
│   │       │   │   ├── TeamController.java
│   │       │   │   └── TradeController.java
│   │       │   ├── model/
│   │       │   │   ├── Team.java
│   │       │   │   ├── Player.java
│   │       │   │   ├── TradeExchange.java
│   │       │   │   ├── TradeRequest.java
│   │       │   │   ├── TeamBreakdown.java
│   │       │   │   └── TradeValidationResult.java
│   │       │   └── service/
│   │       │       └── DataService.java
│   │       └── resources/
│   │           ├── application.properties
│   │           └── nba_salaries.csv
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TeamColumn.js
│   │   │   └── ValidationTable.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── nginx.conf
└── .gitignore
```

---

## Prerequisites

- **Java 21** — [Download Temurin](https://adoptium.net/)
  ```bash
  brew install --cask temurin@21
  ```
- **Maven 3.9+**
  ```bash
  brew install maven
  ```
- **Node.js 18+ and npm**
  ```bash
  brew install node
  ```
- **Docker** (optional, for containerised setup) — [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Installation & Setup

### Running Locally

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd trade-machine
```

**2. Start the backend**
```bash
cd backend
mvn clean spring-boot:run
```
Wait until you see:
```
Loaded X teams and Y players from CSV.
```
The backend runs on `http://localhost:8080`.

**3. Start the frontend** (in a new terminal)
```bash
cd frontend
npm install
npm start
```
The app opens at `http://localhost:3000`. All `/api/*` requests are proxied to the backend.

---

### Running with Docker

```bash
docker compose up --build
```
The app will be available at `http://localhost:80`.

---

## Data Source

There is no external database. Player and salary data is loaded from `backend/src/main/resources/nba_salaries.csv` into memory at startup. Draft picks (next 3 years, 1st and 2nd round) are injected automatically for every team.

The CSV contains the following relevant columns:

| Column | Description |
|---|---|
| Player Name | Full player name |
| Team | NBA team abbreviation |
| Salary | Player's salary in USD |

---

## API Endpoints

### `GET /api/teams`
Returns all teams loaded from the CSV.

**Response**
```json
[
  { "id": 1, "name": "ATL" },
  { "id": 2, "name": "BOS" }
]
```

---

### `GET /api/teams/:teamId/players`
Returns all players and draft picks for a given team.

**Response**
```json
[
  { "id": 1, "name": "Trae Young", "salary": 37096500, "isPick": false },
  { "id": 530, "name": "2027 1st Round Pick", "salary": 0, "isPick": true }
]
```

**Error**
```json
{ "error": "Team not found" }
```

---

### `POST /api/validate-trade`
Validates whether a trade satisfies the NBA's 125% + $100,000 salary matching rule for each team involved.

**Request body**
```json
{
  "trades": [
    { "from": 1, "to": 2, "playerIds": [10, 11] },
    { "from": 2, "to": 1, "playerIds": [45] }
  ]
}
```

**Response**
```json
{
  "valid": true,
  "breakdown": [
    {
      "teamId": 1,
      "teamName": "ATL",
      "outgoingSum": 37096500,
      "incomingSum": 30000000,
      "maxAllowed": 46470625,
      "isMatchOk": true
    }
  ]
}
```

**Trade validation rule:** For each team, `incomingSum` must not exceed `outgoingSum × 1.25 + $100,000`.

---

## Environment Variables

| File | Variable | Description |
|---|---|---|
| `backend/.env` | `PORT` | Port the backend runs on (overridden by `application.properties`) |
| `frontend/.env` | `REACT_APP_API_URL` | API base URL (only used in production builds) |

> In development, the frontend proxies all `/api/*` requests to `http://localhost:8080` via the `proxy` field in `package.json`.