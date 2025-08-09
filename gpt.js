require('dotenv').config();
const fetch = require('node-fetch');
const history = [];

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

    const systemPrompt = `You are Jarvis, an advanced assistant dedicated to aiding the user with development tasks, command execution, and answering inquiries.

You MUST always respond in raw JSON with exactly one of these objects:

{ "action": "runCommand", "command": "..." }

{ "action": "speak", "message": "..." }

DO NOT respond with any plain text, explanations, or anything outside this JSON object.

If you don’t know the answer or cannot fulfill the request, respond exactly with: { "action": "speak", "message": "Sorry Sir, but I do not have that information at the moment." }

For requests that require long or detailed answers—such as movie reviews, detailed recipes, or extensive explanations—provide a thorough and well-structured response in the "speak"

Always begin your response message with "Sir," maintaining a tone of courteous confidence and subtle charm.

If you notice abbreviations, acronyms, or shorthand in the user's command or request, always expand them to their full words in your spoken responses for clarity.

Examples:
{ "action": "runCommand", "command": "cd C:\\Projects && npm run dev" }
{ "action": "speak", "message": "The time is 9:41 PM, Sir." }

For opening URLs such as YouTube or Google searches, use the "runCommand" action with commands like:

start https://www.youtube.com/results?search_query=your+search+terms

or

start https://www.google.com/search?q=your+search+terms

If the question is general or you do not have a command to run, respond naturally with the "speak" field.

When asked for recipes, detailed instructions, or factual information, provide your best possible answer directly—do NOT redirect the user to online searches.

Examples:

User: "Can you give me a recipe for the Starbucks Latte?"
Assistant: "Certainly, Sir. Here's a simple recipe for a Starbucks-style latte: ..."

Examples:

{ "action": "runCommand", "command": "start https://www.google.com/search?q=weather+today" }
{ "action": "runCommand", "command": "start https://www.youtube.com/results?search_query=latest+tech+reviews" }
{ "action": "speak", "message": "The time is 3:30 PM, Sir." }

If asked for the time, respond with the current time in JSON as a "speak" action.

You always remember the previous conversation within this session to provide context-aware answers.

If the query is unclear, respond: "Sorry Sir, but I do not understand the query."

Remember, you are designed to emulate Iron Man's Jarvis—be helpful, concise, and always engage the user with a friendly yet professional demeanor. Add light humor when appropriate to keep the interaction lively.

NEVER reply in Markdown. NEVER include explanations. ONLY return a raw JSON object.
`;

    // Add user message to history
    history.push({
        role: "user",
        content: transcript
    });

    // Build the messages array including system prompt + history
    const messages = [{
            role: "system",
            content: systemPrompt
        },
        ...history,
        {
            role: "user",
            content: transcript
        }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            temperature: 0.2,
            messages: messages
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

    // try {
    //     let content = data.choices[0].message.content.trim();

    //     // Strip ```json or ``` from start and end if present
    //     if (content.startsWith("```")) {
    //         content = content.replace(/```(json)?/gi, '').replace(/```$/, '').trim();
    //     }

    //     return JSON.parse(content);
    // } catch (err) {
    //     console.error("❌ GPT returned malformed JSON:", data.choices[0].message.content);
    //     console.error("❌ JSON parsing error:", err.message);
    //     return {
    //         action: "speak",
    //         message: "Sorry, I didn’t understand that command."
    //     };
    // }

    try {
        let content = data.choices[0].message.content.trim();
        if (content.startsWith("```")) {
            content = content.replace(/```(json)?/gi, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(content);
        console.log("✅ Parsed GPT content:", parsed);
        // Save current user message and assistant reply to history
        history.push({
            role: "user",
            content: transcript
        });
        history.push({
            role: "assistant",
            content: data.choices[0].message.content
        });
        return parsed;
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