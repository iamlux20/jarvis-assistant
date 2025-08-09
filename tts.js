require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const {
    exec
} = require('child_process');

async function speak(text) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
        method: "POST",
        headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text,
            voice_settings: {
                stability: 0.7,
                similarity_boost: 0.75
            }
        })
    });

    if (!res.ok) {
        const error = await res.text();
        console.error("ElevenLabs API error:", error);
        return;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(__dirname, 'response.mp3');
    fs.writeFileSync(filePath, buffer);

    exec(`start "" "${filePath}"`);
}

module.exports = {
    speak
};