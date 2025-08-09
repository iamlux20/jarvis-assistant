const {
    spawn,
    exec
} = require('child_process');
const {
    Porcupine
} = require('@picovoice/porcupine-node');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const {
    transcribeAudio
} = require('./whisper'); // adjust path if needed
const {

    runCommand,

} = require('./executor'); // your other helpers
const {
    interpretCommand
} = require('./gpt');
const {
    speak
} = require('./tts');
const {
    getFirstYoutubeVideoId
} = require('./youtube');

function startWakeWordDetection(win, accessKey) {
    const keywordPath = path.join(__dirname, 'assets', 'wake-words', 'Jarvis.ppn');
    console.log("Using keyword path:", keywordPath);

    if (!fs.existsSync(keywordPath)) {
        console.error("Keyword file missing at", keywordPath);
        return;
    }

    let porcupine;
    try {
        porcupine = new Porcupine(
            process.env.PICOVOICE_ACCESS_KEY,
            [keywordPath],
            [0.5]
        );
    } catch (err) {
        console.error("Failed to create Porcupine instance:", err);
        return;
    }

    const frameLength = porcupine.frameLength;
    const bytesPerSample = 2;

    // Spawn sox to get raw PCM mic input continuously
    const sox = spawn('sox', [
        '-t', 'waveaudio', 'default',
        '-r', '16000',
        '-c', '1',
        '-b', '16',
        '-e', 'signed-integer',
        '-t', 'raw', '-'
    ]);

    sox.stderr.on('data', (data) => {
        console.error('sox stderr:', data.toString());
    });

    sox.on('error', (err) => {
        console.error('sox error:', err);
    });

    sox.on('close', (code) => {
        console.log(`sox exited with code ${code}`);
    });

    let audioBuffer = Buffer.alloc(0);

    sox.stdout.on('data', (chunk) => {
        audioBuffer = Buffer.concat([audioBuffer, chunk]);

        while (audioBuffer.length >= frameLength * bytesPerSample) {
            const frameBuffer = audioBuffer.slice(0, frameLength * bytesPerSample);
            audioBuffer = audioBuffer.slice(frameLength * bytesPerSample);

            const pcm = new Int16Array(frameLength);
            for (let i = 0; i < frameLength; i++) {
                pcm[i] = frameBuffer.readInt16LE(i * 2);
            }

            const keywordIndex = porcupine.process(pcm);
            if (keywordIndex !== -1) {
                console.log("Wake word detected!");
                win.webContents.send('wake-word');

                // Start recording voice command AFTER wake word
                recordVoiceCommand(win);
            }
        }
    });
}

function recordVoiceCommand(win) {
    console.log("Starting voice command recording...");

    const filePath = path.join(__dirname, 'temp.wav');
    const fileStream = fs.createWriteStream(filePath);

    const soxRecord = spawn('sox', [
        '-t', 'waveaudio', 'default',
        '-r', '16000',
        '-c', '1',
        '-b', '16',
        '-e', 'signed-integer',
        '-t', 'wav', '-'
    ]);

    soxRecord.stdout.pipe(fileStream);

    soxRecord.stderr.on('data', (data) => {
        console.error(`sox record stderr: ${data}`);
    });

    soxRecord.on('error', (err) => {
        console.error("sox record error:", err);
    });

    // Stop recording after 5 seconds
    setTimeout(() => {
        soxRecord.kill();
    }, 5000);

    soxRecord.on('close', async code => {
        console.log(`🛑 Recording stopped (code ${code})`);
        fileStream.end();

        try {
            const transcript = await transcribeAudio(filePath);
            console.log("🎙️ Transcript:", transcript);
            console.log("🔄 Calling interpretCommand...");

            const gptResponse = await interpretCommand(transcript).then(async (gptResponse) => {
                console.log("🤖 GPT Response:", gptResponse);

                if (gptResponse.action === "runCommand" && gptResponse.command) {
                    if (gptResponse.command.startsWith('start https://www.youtube.com/results?search_query=')) {
                        const query = decodeURIComponent(
                            gptResponse.command.replace('start https://www.youtube.com/results?search_query=', '')
                        ).replace(/\+/g, ' ');
                        console.log("🔍 YouTube search query:", query);

                        try {
                            const videoId = await getFirstYoutubeVideoId(query);
                            console.log("🎥 First videoId:", videoId);

                            if (videoId) {
                                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                                console.log("🚀 Opening video URL:", videoUrl);

                                exec(`start "" "${videoUrl}"`, (error) => {
                                    if (error) {
                                        console.error('❌ Failed to open YouTube video:', error);
                                    }
                                });

                                await speak(`Playing the first YouTube result for ${query}`);
                            } else {
                                await speak("Sorry, I couldn't find any videos for that.");
                            }
                        } catch (err) {
                            console.error('❌ Error fetching YouTube video:', err);
                            await speak("Sorry, there was a problem searching YouTube.");
                        }
                    } else {
                        // Normal command execution
                        const result = runCommand(gptResponse.command);
                        await speak(result.message);
                    }
                } else if (gptResponse.action === "speak") {
                    await speak(gptResponse.message);
                } else {
                    await speak("Sorry, I didn’t quite understand the command.");
                }

            });
            console.log("🤖 GPT Response:", gptResponse);
        } catch (err) {
            console.error("❌ Error during transcription or command handling:", err);
            await speak("There was an error processing your voice.");
        }

    });
}

module.exports = {
    startWakeWordDetection
};