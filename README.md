# LifeOS

A personal desktop application for managing, tracking, and understanding different aspects of my life.

LifeOS is designed to grow over time as I discover new things I want to track or manage. The current focus is a **local Windows desktop application** for productivity, personal information, health, goals, and daily activity tracking.

---

## Tech Stack

- **Electron** — Desktop application
- **React** — User interface
- **TypeScript** — Application language
- **Vite** — Development and build tooling
- **Node.js** — Application/backend logic
- **SQLite** — Local database
- **Tailwind CSS** — UI styling

### Architecture

```text
LifeOS
│
├── Electron
│   └── Desktop application
│
├── React + TypeScript
│   └── User interface
│
├── Node.js
│   └── Application/backend logic
│
└── SQLite
    └── Local database
```

---

# Features

The feature list is a roadmap and will change as the application develops.

## Productivity

### Tasks

- [ ] Create and manage tasks
- [ ] Complete tasks
- [ ] Task priorities
- [ ] Due dates
- [ ] Task categories
- [ ] Recurring tasks
- [ ] Task history

### Pomodoro / Focus

- [ ] Pomodoro timer
- [ ] Custom focus duration
- [ ] Custom break duration
- [ ] Pause / resume
- [ ] Focus session history
- [ ] Associate focus sessions with tasks
- [ ] Focus statistics
- [ ] Desktop notifications

### Water Reminder

- [ ] Water reminders
- [ ] Record water intake
- [ ] Daily water target
- [ ] Water history
- [ ] Water statistics

### Habits

- [ ] Create habits
- [ ] Track daily habits
- [ ] Habit streaks
- [ ] Habit history
- [ ] Habit statistics

---

## Goals

- [ ] Create goals
- [ ] Short-term goals
- [ ] Long-term goals
- [ ] Goal deadlines
- [ ] Goal milestones
- [ ] Progress tracking
- [ ] Goal status
- [ ] Link tasks to goals
- [ ] Goal history

---

## Health & Fitness

### Diet

- [ ] Record meals
- [ ] Track calories
- [ ] Track protein
- [ ] Track carbohydrates
- [ ] Track fat
- [ ] Daily nutrition summary
- [ ] Nutrition history

### Weight

- [ ] Record weight
- [ ] Weight history
- [ ] Weight progress chart
- [ ] Weight goals

### Workout

- [ ] Record workouts
- [ ] Exercise tracking
- [ ] Sets and repetitions
- [ ] Weight used
- [ ] Workout history
- [ ] Workout statistics

---

## Life

### Timeline

- [ ] Daily activity timeline
- [ ] Activity history
- [ ] Search activities
- [ ] Filter activities
- [ ] Timeline by date

### Achievements

- [ ] Record achievements
- [ ] Achievement date
- [ ] Achievement description
- [ ] Achievement categories
- [ ] Achievement history

### Experiences

- [ ] Record experiences
- [ ] Experience date
- [ ] Experience description
- [ ] Experience categories
- [ ] Experience history

### Education & Skills

- [ ] Education history
- [ ] Courses
- [ ] Certifications
- [ ] Skills
- [ ] Skill progress
- [ ] Academic achievements

### Projects

- [ ] Record projects
- [ ] Project descriptions
- [ ] Project status
- [ ] Project milestones
- [ ] Technologies used
- [ ] Project history

---

## Dashboard

- [ ] Daily overview
- [ ] Today's tasks
- [ ] Focus time
- [ ] Habit progress
- [ ] Goal progress
- [ ] Health summary
- [ ] Recent activities
- [ ] Quick actions

---

## Analytics

- [ ] Productivity statistics
- [ ] Focus time statistics
- [ ] Task completion statistics
- [ ] Habit statistics
- [ ] Goal statistics
- [ ] Health statistics
- [ ] Activity statistics
- [ ] Daily statistics
- [ ] Weekly statistics
- [ ] Monthly statistics

---

## Notifications

- [ ] Water reminders
- [ ] Task reminders
- [ ] Habit reminders
- [ ] Pomodoro notifications
- [ ] Configurable notifications

---

# Development Roadmap

## Phase 1 — Foundation

- [x] Electron
- [x] React
- [x] TypeScript
- [x] Vite
- [x] Tailwind CSS
- [ ] Project structure
- [ ] SQLite
- [ ] Electron IPC
- [ ] Database layer
- [ ] Application navigation

## Phase 2 — Productivity

- [ ] Dashboard
- [ ] Tasks
- [ ] Pomodoro
- [ ] Water reminder
- [ ] Notifications

## Phase 3 — Goals & Habits

- [ ] Goals
- [ ] Habits
- [ ] Progress tracking

## Phase 4 — Health

- [ ] Diet
- [ ] Weight
- [ ] Workout
- [ ] Fitness goals

## Phase 5 — Life Tracking

- [ ] Timeline
- [ ] Achievements
- [ ] Experiences
- [ ] Education
- [ ] Skills
- [ ] Projects

## Phase 6 — Analytics

- [ ] Productivity analytics
- [ ] Health analytics
- [ ] Goal analytics
- [ ] Activity analytics

---

# Development

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build for Windows

```bash
npm run build:win
```

---

## Project Principles

- **Local first** — Personal data is stored locally.
- **Private** — Personal information should remain under the user's control.
- **Extensible** — New features should be easy to add.
- **Useful over complex** — Build features because they solve real problems.
- **Data ownership** — Personal data should be exportable and backed up.

---

## Status

**Early Development**

LifeOS is currently a personal desktop application under active development. Features and architecture may change as the project evolves.
