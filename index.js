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
 console.log("1. View Tasks ");
 console.log("2. Add a task ");
 console.log("3. Update task status ");
 console.log("4. Delete Tasks ");
 console.log("5. Exit ");
};


async function addTask() {
    const description = await rl.question("\nEnter Task description: ");
    
    if(!description.trim()) {
        console.log("Description cannot be empty!");
        return;
    }

    console.log("What is the current status of this task? ");
    console.log("1. To Do ");
    console.log("2. In progress ");
    console.log("3. Complete ");

    const statusOption = await rl.question("Option (1-3): ");

    let status = 'todo';

    if (statusOption === '2'){
        status = 'in-progess;';
    } else if (statusOption === '3') {
        status = 'done'
    }

    await db.run(
        `INSERT INTO tasks (description, status) VALUES (?,?)`,
        [description, status]
    );
    
    console.log("Task added sucessfully!");
}


async function viewTasks() {

    console.log("\nWelcome to the task viewer: ");
    console.log("1. View all");
    console.log("2. View Completed");
    console.log("3. View In Progress");
    console.log("4. View To Do");
    console.log("5. Order by Date (Newest First)");

    const choice = await rl.question("Option (1-5)");

    let sql = `SELECT * FROM tasks`;
    const parsedChoice = parseInt(choice, 10);

    switch (parsedChoice) {
        case 1:
            console.log("\n--- All Tasks ---");
            sql
            break;
        case 2:
            console.log("\n--- Completed Tasks ---");
            sql = "SELECT * FROM tasks WHERE status = 'done'";
            break;
        case 3:
            console.log("\n--- In-Progress Tasks ---");
            sql = "SELECT * FROM tasks WHERE status = 'in-progress'";
            break;
        case 4:
            console.log("\n--- To-Do Tasks ---");
            sql = "SELECT * FROM tasks WHERE status = 'todo'";
            break;
        case 5:
            console.log("\n--- Tasks (Newest First) ---");
            sql = "SELECT * FROM tasks ORDER BY updatedAt DESC";
            break;
        default:
            console.log("Invalid option!");
            return; 
    }

    const rows = await db.all(sql);

    if (rows.length === 0) {
        console.log("No tasks found matching this filter!");
        return; 
    }

    console.log("=====================================");
    rows.forEach(task => {
        console.log(`ID: ${task.id} | [${task.status.toUpperCase()}] | ${task.description}`);
    });
    console.log("=====================================");

}


async function taskTracker() {
    welcomePage();

    let option = await  rl.question("");

    const parsedOption = parseInt(option, 10);

    switch (parsedOption){
        case 1:
            await viewTasks();
            break;
        case 2:
            await addTask();
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        default:
            break;
    }
    rl.close();
}

taskTracker();
