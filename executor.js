const os = require('os');
const {
    exec
} = require('child_process');
const fs = require('fs');
const path = require('path');

// getAvailableDrives function (using wmic)
function getAvailableDrives() {
    return new Promise((resolve, reject) => {
        exec('wmic logicaldisk get name', (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            const drives = stdout
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^[A-Z]:$/.test(line));
            resolve(drives);
        });
    });
}

// Example recursive search (simple, synchronous for demo)
function searchDirectory(dir, searchTerm, results = []) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                searchDirectory(fullPath, searchTerm, results);
            } else if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push(fullPath);
            }
        }
    } catch (e) {
        // Permission errors or inaccessible folders are normal
    }
    return results;
}

// Asynchronous wrapper to search all drives
async function searchAllDrives(searchTerm) {
    const drives = await getAvailableDrives();
    let allResults = [];

    for (const drive of drives) {
        const rootPath = drive + '\\';
        console.log(`Searching ${rootPath} for ${searchTerm}...`);
        const results = searchDirectory(rootPath, searchTerm);
        allResults = allResults.concat(results);
    }
    return allResults;
}

function runCommand(command) {
    // Detect if it's a special search command, e.g.:
    // searchDir:myfile.txt
    if (command.startsWith('searchDir:')) {
        const searchTerm = command.replace('searchDir:', '').trim();

        return searchAllDrives(searchTerm)
            .then(results => {
                if (results.length === 0) {
                    return {
                        success: true,
                        message: `No files found matching "${searchTerm}".`
                    };
                } else {
                    // Return first 5 results for brevity
                    const displayResults = results.slice(0, 5).join('\n');
                    return {
                        success: true,
                        message: `Found files:\n${displayResults}`
                    };
                }
            })
            .catch(err => ({
                success: false,
                message: `Error during search: ${err.message}`
            }));
    }

    // Existing blocked commands check and exec logic here
    const blocked = ["rm", "del", "shutdown", "format", "rd", "rmdir"];
    if (blocked.some(word => command.toLowerCase().includes(word))) {
        return {
            success: false,
            message: "Blocked potentially dangerous command."
        };
    }

    // Wrap "start" commands properly
    if (command.trim().toLowerCase().startsWith('start')) {
        command = `cmd /c ${command}`;
    }

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ Execution error:", err);
        }
        if (stdout) console.log("📤 Output:", stdout);
        if (stderr) console.error("⚠️ Stderr:", stderr);
    });

    return {
        success: true,
        message: `Executing: ${command}`
    };
}

module.exports = {
    runCommand
};