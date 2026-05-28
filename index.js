import { open } from "sqlite";
import sqlite3 from "sqlite3";
import readline from 'readline/promises';
import Table from 'cli-table3';

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
 console.log("\n====================================");
 console.log("========== TASK TRACKER ============");
 console.log("====================================");
 console.log("Options: ");
 console.log("1. View Tasks ");
 console.log("2. Add a task ");
 console.log("3. Update task status ");
 console.log("4. Delete Tasks ");
 console.log("5. Exit ");
}

async function addTask() {
    let adding = true;

    while (adding) {
        const description = await rl.question("\nEnter Task description: ");
        
        if (!description.trim()) {
            console.log("Description cannot be empty!");
            return;
        }

        console.log("\nWhat is the current status of this task? ");
        console.log("1. To Do ");
        console.log("2. In progress ");
        console.log("3. Complete ");

        const statusOption = await rl.question("Option (1-3): ");

        let status = 'todo';
        if (statusOption === '2') {
            status = 'in-progress';
        } else if (statusOption === '3') {
            status = 'done';
        }

        await db.run(
            `INSERT INTO tasks (description, status) VALUES (?, ?)`,
            [description, status]
        );
        
        console.log("\nTask added successfully!");

        const answer = await rl.question("\nWould you like to add another task? (y/n): ");
        if (answer.toLowerCase().trim() !== 'y') {
            adding = false;
        }
    }
}

function renderTable(rows) {
    if (rows.length === 0) {
        console.log("No tasks found!");
        return false; 
    }

    const table = new Table({
        head: ['ID', 'STATUS', 'DESCRIPTION', 'DATE CREATED', 'TIME CREATED', 'DATE UPDATED', 'TIME UPDATED'],
        colWidths: [6, 13, 25, 14, 14, 14, 14], 
        style: {
            head: ['cyan', 'bold'],
            border: ['gray']
        }
    });

    rows.forEach(task => {
        const createdSplit = task.createdAt.split(' ');
        const updatedSplit = task.updatedAt.split(' ');

        table.push([
            task.id,
            task.status.toUpperCase(),
            task.description,
            createdSplit[0],
            createdSplit[1],
            updatedSplit[0],
            updatedSplit[1]
        ]);
    });

    console.log(table.toString());
    return true; 
}

async function viewTasks() {
    let viewing = true;

    while (viewing) {
        console.log("\nWelcome to the task viewer: ");
        console.log("1. View all");
        console.log("2. View Completed");
        console.log("3. View In Progress");
        console.log("4. View To Do");
        console.log("5. Order by Date (Newest First)");
        console.log("6. Back to Main Menu");

        const choice = await rl.question("Option (1-6): ");

        let sql = `SELECT * FROM tasks`;
        const parsedChoice = parseInt(choice, 10);

        switch (parsedChoice) {
            case 1:
                console.log("\n--- All Tasks ---");
                sql = `SELECT * FROM tasks`;
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
            case 6:
                viewing = false;
                continue; 
            default:
                console.log("Invalid option!");
                continue; 
        }
    
        const rows = await db.all(sql);
        const didPrint = renderTable(rows);
        
        if (!didPrint) {
            continue;
        }
    
        await rl.question("\nPress Enter to return to the task viewer menu...");
    }
}

async function deleteTask() {
    let deleting = true;

    while (deleting) {
        console.log("\n--- TASKS BEFORE DELETION ---");
        const rowsBefore = await db.all('SELECT * FROM tasks');
        
        const hasTasks = renderTable(rowsBefore);
        if (!hasTasks) {
            await rl.question("\nPress Enter to return to the main menu...");
            break; 
        }

        const idInput = await rl.question("\nEnter the ID of the task you want to delete (or press Enter to cancel): ");
        
        if (!idInput.trim()) {
            console.log("Deletion cancelled.");
            break;
        }

        const targetId = parseInt(idInput, 10);
        if (isNaN(targetId)) {
            console.log("Invalid ID! Action cancelled.");
            break;
        }

        const result = await db.run('DELETE FROM tasks WHERE id = ?', [targetId]);

        if (result.changes === 0) {
            console.log(`No task found with ID: ${targetId}`);
        } else {
            console.log(`Task ID ${targetId} has been successfully deleted!`);
            
            console.log("\n--- TASKS AFTER DELETION ---");
            const rowsAfter = await db.all('SELECT * FROM tasks');
            renderTable(rowsAfter);
        }

        const answer = await rl.question("\nWould you like to delete another task? (y/n): ");
        if (answer.toLowerCase().trim() !== 'y') {
            deleting = false;
        }
    }
}

async function updateTaskStatus() {
    let updating = true;

    while (updating) {
        console.log("\n--- CURRENT TASKS ---");
        const rowsBefore = await db.all('SELECT * FROM tasks');
        
        const hasTasks = renderTable(rowsBefore);
        if (!hasTasks) {
            await rl.question("\nPress Enter to return to the main menu...");
            break; 
        }

        const idInput = await rl.question("\nEnter the ID of the task you want to update (or press Enter to cancel): ");
        
        if (!idInput.trim()) {
            console.log("Update cancelled.");
            break;
        }

        const targetId = parseInt(idInput, 10);
        if (isNaN(targetId)) {
            console.log("Invalid ID! Action cancelled.");
            break;
        }

        const taskCheck = await db.get('SELECT * FROM tasks WHERE id = ?', [targetId]);
        if (!taskCheck) {
            console.log(`No task found with ID: ${targetId}`);
            continue;
        }

        console.log(`\nUpdating status for Task ID ${targetId}: "${taskCheck.description}"`);
        console.log("1. To Do");
        console.log("2. In Progress");
        console.log("3. Complete");
        
        const statusOption = await rl.question("Choose new status (1-3): ");
        
        let newStatus = '';
        if (statusOption === '1') {
            newStatus = 'todo';
        } else if (statusOption === '2') {
            newStatus = 'in-progress';
        } else if (statusOption === '3') {
            newStatus = 'done';
        } else {
            console.log("Invalid status option! Update failed.");
            continue;
        }

        await db.run(
            `UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [newStatus, targetId]
        );

        console.log(`\nTask ID ${targetId} updated to [${newStatus.toUpperCase()}]!`);
        
        console.log("\n--- TASKS AFTER UPDATE ---");
        const rowsAfter = await db.all('SELECT * FROM tasks');
        renderTable(rowsAfter);

        const answer = await rl.question("\nWould you like to update another task? (y/n): ");
        if (answer.toLowerCase().trim() !== 'y') {
            updating = false;
        }
    }
}

async function taskTracker() {
    let running = true;

    while (running) {
        welcomePage();

        const option = await rl.question("\nChoose an option (1-5): ");
        const parsedOption = parseInt(option, 10);

        switch (parsedOption) {
            case 1:
                await viewTasks();
                break;
            case 2:
                await addTask();
                break;
            case 3:
                await updateTaskStatus();
                break;
            case 4:
                await deleteTask();
                break;
            case 5:
                console.log("\nGoodbye!");
                running = false;
                rl.close();
                break;
            default:
                console.log("\n Invalid choice! Please try again.");
                break;
        }
    }
}

taskTracker();