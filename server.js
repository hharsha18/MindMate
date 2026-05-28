const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log(
    "KEY EXISTS:",
    !!process.env.GROQ_API_KEY
);

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.post("/chat", async (req, res) => {

    try {

        const userMessage =
            req.body.message;

        const lowerMessage =
            userMessage.toLowerCase();

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
            "terrorist",
            "self harm"
        ];

        const isBlocked =
            blockedTopics.some(word =>
                lowerMessage.includes(word)
            );

        if (isBlocked) {

            return res.json({
                reply:
                "⚠️ I can't help with harmful or dangerous requests. I can support you with mental wellness, stress management, and positive guidance instead."
            });
        }

        console.log(
            "MESSAGE:",
            userMessage
        );

        // AI RESPONSE

        const completion =
            await client.chat.completions.create({

            model:
            "llama-3.3-70b-versatile",

            messages: [

                {
                    role: "system",

                    content: `
You are MindMate,
an emotionally supportive AI mental wellness companion.

Your goals:
- Support emotional wellbeing.
- Respond with empathy, kindness, patience, and emotional understanding.
- Comfort stressed, anxious, lonely, sad, or overwhelmed users.
- Encourage healthy coping strategies.
- Suggest calming activities, journaling, breathing exercises, meditation, hydration, healthy sleep, and self-care habits.
- Recommend relaxing music when appropriate.

Important safety rules:
- Never provide harmful, violent, illegal, suicidal, poisoning, hacking, or dangerous instructions.
- Never encourage self-harm or unsafe behavior.
- Politely refuse unsafe requests.
- Encourage positive and healthy behavior.

Response style:
- Sound warm, calm, supportive, and human-like.
- Keep replies emotionally intelligent.
- Use comforting and gentle language.
`
                },

                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        let reply =
            completion.choices[0]
            .message.content;

        // MOOD DETECTION

        let mood = null;

        if (
            lowerMessage.includes("stress") ||
            lowerMessage.includes("sad") ||
            lowerMessage.includes("tired") ||
            lowerMessage.includes("anxiety") ||
            lowerMessage.includes("panic") ||
            lowerMessage.includes("lonely") ||
            lowerMessage.includes("depressed") ||
            lowerMessage.includes("overwhelmed")
        ) {
            mood = "stressed";
        }

        if (
            lowerMessage.includes("happy") ||
            lowerMessage.includes("excited") ||
            lowerMessage.includes("great")
        ) {
            mood = "happy";
        }

        // WELLNESS SUPPORT

        if (
            lowerMessage.includes("anxiety") ||
            lowerMessage.includes("panic")
        ) {

            reply += `

🌿 Breathing Exercise:
Inhale for 4 seconds,
hold for 4 seconds,
exhale slowly for 6 seconds.
Repeat this a few times slowly.
`;
        }

        if (
            lowerMessage.includes("sad") ||
            lowerMessage.includes("lonely")
        ) {

            reply += `

💙 Remember:
You do not have to handle everything alone.
Small steps still matter.
Take care of yourself today.
`;
        }

        // MUSIC SUGGESTIONS

        const musicSuggestions = {

            stressed: {

                english: [
                    "Weightless",
                    "Perfect",
                    "Until I Found You"
                ],

                hindi: [
                    "Kun Faya Kun",
                    "Iktara",
                    "Kho Gaye Hum Kahan"
                ],

                kannada: [
                    "Anisuthide",
                    "Ninnindale",
                    "Belageddu"
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

        if (
            mood &&
            musicSuggestions[mood]
        ) {

            reply += `

🎵 Suggested Songs

English:
- ${musicSuggestions[mood]
.english.join("\n- ")}

Hindi:
- ${musicSuggestions[mood]
.hindi.join("\n- ")}

Kannada:
- ${musicSuggestions[mood]
.kannada.join("\n- ")}
`;
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.log("ERROR:");
        console.log(error);

        res.json({
            reply:
            "⚠️ Backend crashed"
        });
    }
});

app.listen(3000, () => {

    console.log(
        "Running on http://localhost:3000"
    );
});