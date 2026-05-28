import {open} from "sqlite";
import sqlite3 from "sqlite3";
import readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = await open({
    filename: './task-tracker.db',
    driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);


function welcomePage() {
 console.log("====================================");
 console.log("==========TASK TRACKER ============");
 console.log("====================================");
 
 console.log("Options: ");
 console.log("1. View all tasks ");
 console.log("2. Add a task ");
 console.log("3. Update task status ");
 console.log("4. Exit ");
};


async function taskTracker() {
    welcomePage();

    let option = await  rl.question("");

    const parsedOption = parseInt(option, 10);

    switch (parsedOption){
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        default:
            break;
    }
    rl.close();
}

taskTracker();
