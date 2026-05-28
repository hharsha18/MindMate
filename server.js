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

/* MEMORY STORAGE */

let chatHistory = [

    {
        role: "system",

        content:
        `
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
    }
];

/* CHAT API */

app.post("/chat", async (req, res) => {

    try {

        const userMessage =
            req.body.message;

        console.log(
            "MESSAGE:",
            userMessage
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
            userMessage.toLowerCase();

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

            content: userMessage
        });

        /* LIMIT MEMORY */

        if (chatHistory.length > 20) {

            chatHistory =
                chatHistory.slice(-20);
        }

        /* AI RESPONSE */

        const completion =
            await client.chat.completions.create({

            messages: chatHistory,

            model:
            "llama-3.3-70b-versatile"
        });

        const reply =
            completion
            .choices[0]
            .message
            .content;

        /* STORE BOT MESSAGE */

        chatHistory.push({

            role: "assistant",

            content: reply
        });

        res.json({
            reply: reply
        });

    } catch (error) {

        console.log("ERROR:");
        console.log(error);

        res.json({

            reply:
            "⚠️ Something went wrong. Please try again."
        });
    }
});

/* START SERVER */

app.listen(3000, () => {

    console.log(
        "Running on http://localhost:3000"
    );
});