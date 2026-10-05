# CodeDNA — Temporal Engineering Decision Graph & Grounded Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_API-3.8--flash-orange.svg)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)

**CodeDNA** is a Temporal Engineering Decision Graph and Grounded Intelligence Platform designed to answer the fundamental software engineering question:

> **"Why is the code like this?"**

Rather than treating source code as static text, CodeDNA connects repository files, configuration constants, commits, pull requests, incident reports, and architecture design records into a temporal, directed knowledge graph.

---

## 🌟 Key Features

### 1. Project Engineering Dashboard (`/dashboard`)
* **Real-Time GitHub Sync Badges**: Displays live status indicators (`SYNC SUCCESSFUL`, `SYNCING GITHUB...`, `SYNC FAILED`) with relative timestamps (`2m ago`, `Just now`).
* **Key Milestones & Task Tracking**: Visual progress bars for milestones and associated tasks with priority badges (`P0`, `P1`, `P2`) and assignee allocation.
* **Filtering & Sorting**: Filter projects by status or language, and sort by star count, active decisions, or last synced date.

### 2. Grounded AI Chat & Evidence Drawer
* **Strict Grounding Shield**: Powered by `@google/genai` TypeScript SDK on the server side (`gemini-3.8-flash`). Answers are strictly backed by repository evidence (commits, PRs, issues, incident reports).
* **Evidence Refusal Guard**: Refuses to invent unsupported explanations when repository evidence is missing (returns `INSUFFICIENT` confidence with missing evidence breakdown).
* **Interactive Side Panel**: Real-time citation cards with direct links to GitHub commits, pull requests, and author credentials.

### 3. Code Explainer & Full Project Exporter (`/explainer`)
* **Why It Was Used**: Executive motivation summary, primary driving factors, supporting artifacts, and decision supersession history.
* **How It Works**: High-level execution flow, key AST code lines breakdown, dependencies, and performance considerations.
* **Full Source Code Exporter**: Tabbed file tree browser with single-click copy buttons for complete, runnable project source code files (`src/config.py`, `src/payment_service.py`, `main.py`, `requirements.txt`).

### 4. Interactive Temporal Decision Graph & Timeline
* **Interactive Canvas Graph**: Node-link visualization with type-based entity filters (`File`, `Function`, `Configuration`, `Commit`, `PullRequest`, `Incident`, `Decision`).
* **Chronological Timeline**: Event stream tracing architectural evolution, incident responses, and decision supersession over time.
* **Decision Ledger**: Active vs Superseded decision status manager.

### 5. Secure User Authentication System
* **Server-Side Hashing**: Node `crypto` PBKDF2 / SHA-512 password hashing with random cryptographic salts and session token authorization.
* **Role-Based Access Control**: Supports roles (`Architect`, `Senior Engineer`, `Lead Maintainer`, `Contributor`).
* **Quick Demo Account Presets**: One-click fill buttons for instant testing.

### 6. Automated Evaluation Suite
* **Live Benchmark Suite**: Live runner executing benchmark cases to measure **Grounded Rate**, **Evidence Precision**, and **Refusal Accuracy**.

---

## 🏗️ Architecture & Knowledge Graph Schema

### Entity Types
* `File`, `Directory`, `Function`, `Configuration`
* `Commit`, `PullRequest`, `Issue`, `Incident`
* `Decision`, `Developer`, `Reviewer`

### Relation Types
* `CONTAINS`, `DEPENDS_ON`, `CALLS`
* `MOTIVATED_BY`, `AFFECTS`, `INTRODUCED`, `CHANGED`
* `SUPERSEDES`, `SUPERSEDED_BY`, `AUTHORED_BY`, `REVIEWED_BY`

---

## 🔑 Demo Credentials

To test the application immediately without registration:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@codedna.io` | `Password123!` | Architect |
| **Senior Engineer** | `marcus@codedna.io` | `Password123!` | Senior Engineer |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/code-dna/codedna.git
   cd codedna
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your Gemini API key (optional for local fallback engine):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Repository Structure

```text
├── server/
│   ├── ai/
│   │   └── orchestrator.ts       # Gemini AI Grounded Orchestrator (@google/genai)
│   ├── db/
│   │   ├── knowledge_graph.ts    # Temporal Graph Store (Nodes & Edges)
│   │   ├── repository_store.ts   # Repository metadata store
│   │   └── user_store.ts         # PBKDF2 password hashing & user profiles
│   ├── ingestion/
│   │   └── github_ingestor.ts    # GitHub repository ingester
│   └── routes/
│       ├── api.ts                # Primary REST API routes
│       └── auth.ts               # Signup, Login, Me, Logout routes
├── src/
│   ├── api/
│   │   └── client.ts             # Typed API client with safe error parsing
│   ├── components/
│   │   ├── auth/                 # AuthModal login & signup component
│   │   ├── chat/                 # Chat interface & evidence drawer
│   │   ├── dashboard/            # ProjectDashboard with real-time sync badges
│   │   ├── decisions/            # Decision Explorer & Ledger
│   │   ├── eval/                 # Automated Evaluation Suite
│   │   ├── explainer/            # Code Explainer & Full Source Exporter
│   │   ├── graph/                # Canvas Decision Graph Visualizer
│   │   └── timeline/             # Temporal Timeline Event Stream
│   ├── context/
│   │   └── AuthContext.tsx       # React Auth Provider
│   ├── types/
│   │   └── index.ts              # Shared TypeScript Interfaces
│   ├── App.tsx                   # Main App container
│   └── main.tsx                  # Client entry point
├── server.ts                     # Express + Vite integration server
├── index.html                    # HTML entry point
└── package.json                  # Dependencies and scripts
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
