const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

async function transcribeAudio(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const data = await response.json();

  if (data.error) {
    console.error("❌ OpenAI Whisper error:", data.error);
    throw new Error(data.error.message);
  }

  return data.text || 'No speech detected.';
}

module.exports = {
  transcribeAudio
};