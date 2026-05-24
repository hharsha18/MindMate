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

        console.log("MESSAGE:", req.body.message);

        const completion =
            await client.chat.completions.create({

            messages: [
                {
                    role: "user",
                    content: req.body.message
                }
            ],

            model: "llama-3.3-70b-versatile"
        });

        const reply =
            completion.choices[0].message.content;

        res.json({
            reply: reply
        });

    } catch (error) {

        console.log("ERROR:");
        console.log(error);

        res.json({
            reply: "Backend crashed"
        });
    }
});

app.listen(3000, () => {

    console.log(
        "Running on http://localhost:3000"
    );
});