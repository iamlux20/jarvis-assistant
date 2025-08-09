const {
    exec
} = require('child_process');

function getAvailableDrives() {
    return new Promise((resolve, reject) => {
        exec('wmic logicaldisk get name', (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }

            // Parse output, ignore header line and empty lines
            const drives = stdout
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^[A-Z]:$/.test(line));

            resolve(drives); // e.g. ["C:", "D:", "E:"]
        });
    });
}

// Example usage:
(async () => {
    try {
        const drives = await getAvailableDrives();
        console.log("Available drives:", drives);
    } catch (e) {
        console.error("Error getting drives:", e);
    }
})();