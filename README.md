## Task-Tracker
A CLI (command line interface) task management application.

This project is a solution for: https://roadmap.sh/projects/task-tracker

## Features
- Dynamic task viewing filters (view all, completed, in progress, to do, or ordered by date)
- Double timestamp tracking (saves both date and time for when tasks are created and updated)
- SQL database usage - this application saves the data to task-tracker.db and uses relational tables
- Nice terminal grids - outputs all data in clean tables with automatic text clipping
- Loop states for adding, updating, and deleting to allow multiple actions without leaving the menu
- Fail safe constraints - validation to catch empty descriptions or invalid options

## Prerequisites
Ensure you have Node.js installed on your machine (v18+ recommended). If you are on Fedora, you can install it via:

```Bash
sudo dnf install nodejs
```

## How to install dependencies:

The project relies on three dependencies:

sqlite3 - The core binary engine database driver for SQLite.

sqlite - The promise-based API wrapper that enables clean async/await syntax.

cli-table3 - The layout utility to render tables in the terminal.

Install them all at once using:

```Bash
npm install sqlite sqlite3 cli-table3
How to Run:
```

```Bash
node index.js
```