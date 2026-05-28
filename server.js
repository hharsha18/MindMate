const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("KEY EXISTS:", !!process.env.GROQ_API_KEY);

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        // SAFETY FILTER

        const blockedTopics = [
            "poison",
            "kill",
            "suicide",
            "bomb",
            "hack",
            "drugs",
            "weapon",
            "murder",
            "self harm",
            "terrorist"
        ];

        const lowerMessage =
            userMessage.toLowerCase();

        const isBlocked =
            blockedTopics.some(word =>
                lowerMessage.includes(word)
            );

        if (isBlocked) {

            return res.json({
                reply:
                "⚠️ I can't help with harmful or dangerous requests. I can help with wellness, stress management, and positive support instead."
            });
        }

        console.log("MESSAGE:", userMessage);

        // AI RESPONSE

        const completion =
            await client.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages: [

                {
                    role: "system",

                    content: `
You are MindMate, a friendly mental wellness AI assistant.

Rules:
- Never provide harmful, illegal, violent, suicidal, hacking, poisoning, or dangerous instructions.
- Politely refuse unsafe requests.
- Encourage positive and healthy behavior.
- Be supportive and conversational.
- Keep replies friendly and helpful.
`
                },

                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        let reply =
            completion.choices[0].message.content;

        // MUSIC SUGGESTIONS

        const musicSuggestions = {

            stressed: {
                english: [
                    "Weightless",
                    "Perfect"
                ],

                hindi: [
                    "Kun Faya Kun",
                    "Iktara"
                ],

                kannada: [
                    "Anisuthide",
                    "Ninnindale"
                ]
            },

            happy: {
                english: [
                    "Happy - Pharrell Williams"
                ],

                hindi: [
                    "Ilahi"
                ],

                kannada: [
                    "Belageddu"
                ]
            }
        };

        let mood = null;

        if (
            lowerMessage.includes("stress") ||
            lowerMessage.includes("sad") ||
            lowerMessage.includes("tired")
        ) {
            mood = "stressed";
        }

        if (
            lowerMessage.includes("happy") ||
            lowerMessage.includes("excited")
        ) {
            mood = "happy";
        }

        if (mood && musicSuggestions[mood]) {

            reply += `

🎵 Suggested songs:
- ${musicSuggestions[mood].english.join("\n- ")}
`;
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.log("ERROR:");
        console.log(error);

        res.json({
            reply: "⚠️ Backend crashed"
        });
    }
});

app.listen(3000, () => {

    console.log(
        "Running on http://localhost:3000"
    );
});