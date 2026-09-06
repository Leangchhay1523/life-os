# Life OS (v1.0.0 - "The Foundation")

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](https://github.com/Leangchhay1523/life-os)

Welcome to **Life OS**, a centralized, elegantly designed Electron application built to systematically orchestrate your daily performance, track your physiological baseline, and plan your long-term life trajectory.

---

## What is V1.0.0?

Version 1.0.0 establishes the core foundation of a truly unified operating system for your life. The philosophy behind Life OS is that productivity, health, and macro-level identity are deeply interconnected. To achieve high output, your physical foundation must be solid, your daily tasks strictly blocked, and your trajectory pointed in a direction that aligns with your core values.

V1.0.0 provides the standalone tools across all three pillars, unified under a beautiful, standard user interface, all backed completely by a local-offline JSON database for absolute privacy.

For a deeper dive into the origin philosophy and how these modules connect conceptually, read the [V1.0.0 Story](docs/v1.0.0-story.md).

---

## Core Features

- 📅 **Daily Planner**: A time-blocking timeline featuring Drag-and-Drop capability. Block out spans of hours natively and protect against schedule collisions.
- ⏱️ **Pomodoro Timer**: A completely configurable deep-work sprint system.
- 💧 **Water Reminder**: An aggressive screen-takeover mechanic that ensures hydration tracking while deeply focused.
- 📈 **Health Dashboard**: Log and visualize your Sleep, Hydration, Calories, and Weight across interactive charts to track progress.
- 🧠 **Self-Awareness Hub**: A tabbed journaling utility for identifying your Vision, Mission, Values, Strengths, and Weaknesses.
- 🚩 **Milestones Tracker**: A timeline interface to document and celebrate massive life achievements and project launches.
- 📄 **Resume Builder**: An integrated LaTeX engine to systematically compile your experiences and skills into formatted PDF resumes automatically.
- 💾 **Data Management**: Complete privacy and portability via local `.db` file database compilation.

_Want to know exactly how to integrate these modules into a cohesive daily workflow? Read our complete [Official User Guide](docs/user-guide.md)!_

---

## Technology Stack

Life OS is built on modern, lightning-fast web technologies wrapped for desktop:

- **Core Engine:** [Electron](https://www.electronjs.org/) (Main & Renderer process)
- **Frontend Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** CSS + [Tailwind CSS](https://tailwindcss.com/)
- **Datastore:** `electron-store` (Local filesystem JSON)
- **Charting & Utilities:** `recharts`, `@hello-pangea/dnd`

---

## Contributing

This project is actively maintained by [@Leangchhay1523](https://github.com/Leangchhay1523) and is completely **open for contributions**!

Whether you want to implement deep module interconnectivity, refine the CSS gradient animations, or squash bugs, we would love to see your pulls.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
