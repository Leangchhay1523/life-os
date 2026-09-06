# LifeOS

A personal desktop application for managing, tracking, and understanding different aspects of your life.

LifeOS is designed to grow over time as you discover new things you want to track or manage. The current focus is a **local Windows desktop application** featuring offline productivity tools, goal tracking, and an integrated algorithmic Resume Builder with native LaTeX PDF compilation.

---

## 🌟 Current Features

- **Pomodoro Timer:** A customizable focus/break timer for deep work sessions.
- **Water Reminder:** An OS-level overlay prompt that nudges you to hydrate at regular intervals.
- **Milestones (Big Goals):** An interactive visual timeline to capture and review your life's greatest achievements.
- **Resume Builder:** A full algorithmic LaTeX compiler suite that manages your professional records (Experience, Projects, Education) and beautifully compiles them directly into a PDF offline.

> **Note:** We have massive plans for LifeOS! To see upcoming features (like Task tracking, Habit streaks, and Health logs), check out our full [Development Roadmap](docs/ROADMAP.md).

---

## 🛠️ Tech Stack

- **Electron** — Desktop runtime wrapping
- **React** — User interface components
- **TypeScript** — Core application language and type safety
- **Vite** — Fast development and module bundling
- **Node.js** — Backend IPC logic and local file interactions
- **Tailwind CSS** — Utility-first styling
- **electron-store** — Persistent local database JSON storage

### Architecture Overview

```text
LifeOS
│
├── Electron Main Process (Node.js)
│   └── System interactions, local file writes, LaTeX execution
│
└── Electron Renderer (React + TypeScript)
    └── UI Dashboard, state management, drag-and-drop
```

---

## 🚀 Getting Started

To run LifeOS locally on your machine, follow these steps:

### Prerequisites

You will need Node.js installed on your machine. If you want to use the automated **Resume to PDF** compiler, you must also have `pdflatex` (MiKTeX or TeX Live) installed and registered in your system `PATH`.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

### Build for Windows

To compile LifeOS into a distributable `.exe` file:

```bash
npm run build:win
```

---

## 💡 Project Principles

- **Local First** — Your personal data is stored directly on your hard drive, never in the cloud.
- **Completely Private** — All personal information remains strictly under your control.
- **Extensible** — New life-tracking modules are easy to plug into the React Sidebar router.
- **Useful Over Complex** — We build features because they solve real, tangible life problems.
- **Data Ownership** — Personal data should be easily exportable and perpetually accessible.

---

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome!
Since LifeOS is built on a modular "App" structure within the sidebar, creating a completely new productivity tool or calendar tracker is incredibly easy. Feel free to clone the repo, build a cool widget, and open a Pull Request.

---

## 📄 License

This project is open-source and available under the standard MIT License.
