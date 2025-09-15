# Exp10 Blog

A simple blog built with Node.js, Express, EJS, and MongoDB. Admins can add posts; users can view a list and click titles to read full posts.

## Features
- Server-rendered pages with EJS
- MongoDB persistence via Mongoose
- Admin panel protected by basic auth
- Slugged URLs for posts

## Requirements
- Node.js 18+
- MongoDB running locally (or provide a connection string in `.env`)

## Setup (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Configure environment (defaults already in `.env`):
- `PORT=3000`
- `MONGODB_URI=mongodb://localhost:27017/exp10blog`
- `ADMIN_USER=admin`
- `ADMIN_PASS=admin123`

3. Start MongoDB if not already running.

4. Run the app in dev mode (loads `.env`):

```powershell
npm run dev
```

Then open http://localhost:3000

## Usage
- Home lists post titles. Click to view full post.
- Admin at `/admin` requires credentials from `.env`. Create new posts via the form.

## Switching to MySQL (optional)
This project uses MongoDB. To use MySQL instead, replace Mongoose with an ORM like Prisma or Sequelize, create a `Post` model with `title`, `content`, `slug`, and `createdAt`, and update the routes to use the ORM queries. If you want, I can implement a MySQL variant.
