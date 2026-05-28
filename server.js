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

/* USER MEMORY STORAGE */

const userChats = {};

/* SYSTEM PROMPT */

const systemPrompt = {
    role: "system",

    content: `
You are MindMate,
a supportive AI chatbot.

Prioritize:
- mental wellness
- empathy
- emotional support
- motivation
- calm communication

Never provide:
- harmful instructions
- poisoning advice
- self-harm guidance
- illegal activities
- dangerous weapon instructions

Keep responses warm,
modern,
human-like,
and supportive.
`
};

/* CHAT API */

app.post("/chat", async (req, res) => {

    try {

        const { userId, message } =
            req.body;

        if (!message) {

            return res.status(400).json({
                reply:
                "Message is required"
            });
        }

        const currentUserId =
            userId || "anonymous";

        // Create memory for each user

        if (
            !userChats[currentUserId]
        ) {

            userChats[currentUserId] = [
                { ...systemPrompt }
            ];
        }

        const chatHistory =
            userChats[currentUserId];

        console.log(
            "USER:",
            currentUserId
        );

        console.log(
            "MESSAGE:",
            message
        );

        /* SAFETY FILTER */

        const blockedTopics = [
            "poison",
            "kill",
            "suicide",
            "bomb",
            "hack",
            "drugs",
            "weapon"
        ];

        const lowerMessage =
            message.toLowerCase();

        const isBlocked =
            blockedTopics.some(word =>
                lowerMessage.includes(word)
            );

        if (isBlocked) {

            return res.json({

                reply:
                "I can't help with harmful or dangerous requests. If you need help with safety, emotional support, or learning responsibly, I can help with that instead 💙"
            });
        }

        /* STORE USER MESSAGE */

        chatHistory.push({

            role: "user",

            content: message
        });

        /* LIMIT MEMORY */

        if (
            chatHistory.length > 20
        ) {

            userChats[currentUserId] = [

                chatHistory[0],

                ...chatHistory.slice(-19)
            ];
        }

        /* AI RESPONSE */

        const completion =
            await client.chat.completions.create({

                messages:
                userChats[currentUserId],

                model:
                "llama-3.3-70b-versatile"
            });

        const reply =
            completion
            .choices[0]
            .message
            .content;

        /* STORE BOT MESSAGE */

        userChats[currentUserId].push({

            role: "assistant",

            content: reply
        });

        res.json({
            reply: reply
        });

    } catch (error) {

        console.log("ERROR:");
        console.log(error);

        res.status(500).json({

            reply:
            "⚠️ Something went wrong. Please try again."
        });
    }
});

/* START SERVER */

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Running on http://localhost:${PORT}`
    );
});