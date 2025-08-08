const {
    exec
} = require('child_process');

function runCommand(command) {
    const blocked = ["rm", "del", "shutdown", "format", "rd", "rmdir"];
    if (blocked.some(word => command.toLowerCase().includes(word))) {
        return {
            success: false,
            message: "Blocked potentially dangerous command."
        };
    }

    // ✅ Wrap "start" commands in cmd /c properly
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