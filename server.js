const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const chatSessions = {};

const systemPrompt = {
  role: "system",
  content: `
You are MindMate, a supportive AI chatbot.

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

Keep responses warm, modern, human-like, and supportive.
`,
};

app.post("/chat", async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message || !chatId) {
      return res.status(400).json({
        reply: "message and chatId are required",
      });
    }

    if (!chatSessions[chatId]) {
      chatSessions[chatId] = [systemPrompt];
    }

    const chatHistory = chatSessions[chatId];

    const blockedTopics = [
      "poison",
      "kill",
      "suicide",
      "bomb",
      "hack",
      "drugs",
      "weapon",
    ];

    const isBlocked = blockedTopics.some((word) =>
      message.toLowerCase().includes(word)
    );

    if (isBlocked) {
      return res.json({
        reply:
          "I can't help with harmful or dangerous requests.",
      });
    }

    chatHistory.push({
      role: "user",
      content: message,
    });

    if (chatHistory.length > 20) {
      chatSessions[chatId] = [
        chatHistory[0],
        ...chatHistory.slice(-19),
      ];
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatSessions[chatId],
    });

    const reply =
      completion.choices[0].message.content;

    chatSessions[chatId].push({
      role: "assistant",
      content: reply,
    });

    res.json({
      reply,
    });
  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      reply: "Something went wrong.",
    });
  }
});

app.get("/chat/:chatId", (req, res) => {
  const { chatId } = req.params;

  res.json({
    messages: chatSessions[chatId] || [],
  });
});

app.delete("/chat/:chatId", (req, res) => {
  const { chatId } = req.params;

  delete chatSessions[chatId];

  res.json({
    success: true,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});