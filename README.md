# Urban Digital Twin - Frontend

![Cyberpunk Aesthetic](https://img.shields.io/badge/Style-Cyberpunk%2FWeb3-d90282)
![Next.js](https://img.shields.io/badge/Framework-Next.js_14-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-38bdf8)

A futuristic, high-fidelity Urban Digital Twin dashboard for simulating and visualizing city-wide environmental policies. Built with a premium "Glass & Neon" aesthetic, this interface allows users to monitor live AQI, simulate policy interventions, and analyze health impacts in real-time.

## ✨ Features

- **Cyberpunk / Web3 Aesthetic**: Deep purple backgrounds, neon accents, glassmorphism cards, and interactive glow effects.
- **Real-time Dashboard**: Live visualization of AQI (Air Quality Index) with dynamic color coding and trend analysis.
- **Causal Policy Simulation**: Interactive graph-based policy generator (`CausalGraph`) to test interventions like "EV Subsidies" or "Green Corridors."
- **Emission Forecasting**: Predictive charts comparing historical data vs. AI-generated forecasts using Random Forest models.
- **Solutions Marketplace**: An "NFT-style" catalog of futuristic urban solutions (e.g., Algae Curtains, Cloud Seeding) with simulated impact markers.
- **Health Impact Analysis**: AI-driven health insights (`HealthChat`) and vulnerable group risk assessments based on current environmental data.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom glassmorphism utilities)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks & Context

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Python backend running (see [Backend README](../digital-twin-backend/README.md))

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables (if needed):
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

### Running Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
frontend/
├── app/                  # Next.js App Router pages
│   ├── globals.css       # Global styles (Cyberpunk theme variables)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navigation.tsx    # Main nav bar
│   │   ├── LiveAQI.tsx       # Real-time AQI widget
│   │   ├── CausalGraph.tsx   # Policy simulation engine
│   │   ├── SolutionsCatalog.tsx # Solution cards
│   │   └── ...
│   ├── config/           # App configuration
│   └── data/             # Static data & types
└── public/               # Static assets
```

## 🎨 Design System

The application uses a custom design system defined in `globals.css`:

- **Primary Colors**: Neon Pink (`#d90282`), Deep Purple (`#5b21b6`), Cyan (`#00f0ff`).
- **Glassmorphism**: Utility class `.glass-panel` provides the signature semi-transparent blurred look.
- **Fonts**: Inter (Google Fonts) for clean, modern typography.

## 🤝 Integration

This frontend connects to a Flask-based backend (`digital-twin-backend`) for:
- Retrieving live AQI data
- Running causal inference models
- Generating AI health recommendations
- Forecasting emissions
