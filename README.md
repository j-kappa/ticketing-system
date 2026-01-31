# Tech Support Ticketing System

A simple, clean ticketing system for logging and tracking tech support jobs. Built with React, Node.js/Express, and SQLite.

## Features

- **Dashboard** - Overview of ticket stats, priority breakdown, category distribution, and team workload
- **Ticket Management** - Create, edit, and track tickets with status, priority, and category
- **Notes** - Add timestamped updates and notes to tickets
- **File Attachments** - Upload screenshots, logs, and documents (max 10MB)
- **Search & Filter** - Find tickets by text search or filter by status, priority, category, assignee
- **Team Management** - Manage team members for ticket assignment

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: SQLite (via better-sqlite3)
- **File Uploads**: Multer

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3001`

2. In a new terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
tyrone-demo/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   ├── database.js       # SQLite setup & migrations
│   │   └── routes/
│   │       ├── tickets.js    # Ticket CRUD + search/filter
│   │       ├── notes.js      # Note management
│   │       ├── attachments.js # File upload/download
│   │       ├── team.js       # Team member management
│   │       └── stats.js      # Dashboard statistics
│   ├── uploads/              # Uploaded files storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with routing
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   └── TeamManagement.jsx
│   │   ├── api/client.js     # API helper functions
│   │   └── lib/utils.js      # Utilities and config
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/tickets`                 | List tickets (with filters) |
| POST   | `/api/tickets`                 | Create ticket               |
| GET    | `/api/tickets/:id`             | Get ticket details          |
| PUT    | `/api/tickets/:id`             | Update ticket               |
| DELETE | `/api/tickets/:id`             | Delete ticket               |
| POST   | `/api/tickets/:id/notes`       | Add note                    |
| POST   | `/api/tickets/:id/attachments` | Upload file                 |
| GET    | `/api/attachments/:id`         | Download file               |
| GET    | `/api/team`                    | List team members           |
| POST   | `/api/team`                    | Add team member             |
| GET    | `/api/stats`                   | Dashboard statistics        |

## Ticket Properties

- **Status**: New, In Progress, Resolved, Closed
- **Priority**: Low, Medium, High, Urgent
- **Category**: Hardware, Software, Network, Access

## License

MIT
