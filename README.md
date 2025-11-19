# User Management (React) — Assignment

This is a simple **React** CRUD demo for managing users.  
It uses **JSONPlaceholder** as a fake backend (assignment requirement) and stores newly created users locally in `localStorage` so they show up in the UI.

## Features
- Fetch users (JSONPlaceholder) and list them.
- Create user (POST to JSONPlaceholder) — stored also in `localStorage`.
- Update user (PUT to JSONPlaceholder) — local copy updated if present.
- Delete user (DELETE to JSONPlaceholder) — local copy removed if present.
- React functional components + hooks, react-router.
- Basic validation, loading states, and error handling.

## Setup (local)
```bash
# install deps
npm install

# run dev
npm start
