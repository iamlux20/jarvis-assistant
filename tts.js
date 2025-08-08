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

    const buffer = await res.buffer();
    const filePath = path.join(__dirname, 'response.mp3');
    fs.writeFileSync(filePath, buffer);

    // Play audio using Windows default player
    exec(`start ${filePath}`);
}

module.exports = {
    speak
};