# Meal Spotter

A platform connecting students with local mess options. Students can browse menus, view subscription plans, and find their perfect food match.

## Features

### Student Features

- Browse mess listings
- View today's and weekly menus
- View mess details and subscription plans

### Mess Owner Features

- Update mess profile and details
- Add and manage daily menus
- Set subscription plans

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Styling**: TailwindCSS + Shadcn/ui
- **Database**: MongoDB
- **Authentication**: Next Auth / Custom JWT

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/meal-spotter.git
cd meal-spotter
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your own values.

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
meal-spotter/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── models/              # MongoDB models
├── public/                  # Static assets
└── ...
```

## License

This project is MIT licensed.
