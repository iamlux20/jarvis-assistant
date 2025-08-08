function startWakeWordDetection(win) {
    setInterval(() => {
        const fakeDetected = "jarvis"; // Simulate hearing "Jarvis"
        win.webContents.send('wake-word', fakeDetected);
    }, 30000);
}

module.exports = {
    startWakeWordDetection
};