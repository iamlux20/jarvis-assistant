const fs = require('fs');
const path = require('path');
const {
    spawn
} = require('child_process');
const {
    transcribeAudio
} = require('./whisper');

const filePath = path.join(__dirname, 'temp.wav');
const fileStream = fs.createWriteStream(filePath);

console.log("🎙️ Recording...");

// ✅ This is the SoX command that works for your machine
const sox = spawn('sox', [
    '-t', 'waveaudio', 'default',
    '-r', '16000',
    '-c', '1',
    '-b', '16',
    '-e', 'signed-integer',
    '-t', 'wav', '-'
]);

sox.stdout.pipe(fileStream);

sox.stderr.on('data', data => {
    console.error(`❌ STDERR: ${data}`);
});

sox.on('exit', code => {
    console.log(`🛑 Recording stopped (code ${code})`);

    fileStream.end();

    setTimeout(() => {
        transcribeAudio(filePath)
            .then(transcript => {
                console.log("🧠 Transcript:", transcript);
            })
            .catch(err => {
                console.error("❌ Transcription error:", err.message || err);
            });
    }, 500); // wait for file to flush
});

// Stop after 5 seconds
setTimeout(() => {
    sox.kill(); // ⛔ Force-stop recording
}, 5000);