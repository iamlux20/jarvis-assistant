require('dotenv').config();
const fetch = require('node-fetch');

async function interpretCommand(transcript) {

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const systemPrompt = `
You are Jarvis, a loyal desktop assistant for a Windows developer. The user is living in the Phiippines and can speak English and Tagalog fluently. You are designed to help with development tasks, run commands, and answer questions about the user's computer.

You MUST always respond in raw JSON (no markdown). Never explain.

Valid actions are:
- { "action": "runCommand", "command": "..." }
- { "action": "speak", "message": "..." }

Examples:
{ "action": "runCommand", "command": "cd C:\\\\Projects && npm run dev" }
{ "action": "speak", "message": "The time is 9:41 PM." }

If asked for the time, reply with the current time in JSON as a "speak" action.
If asked something you don't understand, say you don't understand in a "speak" message.

NEVER reply in Markdown. NEVER include explanations. ONLY return a raw JSON object.
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4.0",
            temperature: 0.2,
            messages: [{
                    role: "system",
                    content: `${systemPrompt}\n\nThe current time is ${currentTime} and the date is ${currentDate}.`
                },
                {
                    role: "user",
                    content: transcript
                }
            ]
        })
    });

    const data = await res.json();
    console.log("🧪 GPT raw response:\n", JSON.stringify(data, null, 2));
    if (!data.choices || !data.choices[0]) {
        console.error("❌ OpenAI API error response:", data);
        return {
            action: "speak",
            message: "There was a problem reaching my brain. Try again."
        };
    }

    try {
        let content = data.choices[0].message.content.trim();

        // Strip ```json or ``` from start and end if present
        if (content.startsWith("```")) {
            content = content.replace(/```(json)?/gi, '').replace(/```$/, '').trim();
        }

        return JSON.parse(content);
    } catch (err) {
        console.error("❌ GPT returned malformed JSON:", data.choices[0].message.content);
        console.error("❌ JSON parsing error:", err.message);
        return {
            action: "speak",
            message: "Sorry, I didn’t understand that command."
        };
    }
}

module.exports = {
    interpretCommand
};