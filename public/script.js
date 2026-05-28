async function sendMessage() {

    const input =
        document.getElementById("user-input");

    const message =
        input.value.trim();

    if (!message) return;

    const chatBox =
        document.getElementById("chat-box");

    // USER MESSAGE

    const userDiv =
        document.createElement("div");

    userDiv.className =
        "message user-message";

    userDiv.innerText = message;

    chatBox.appendChild(userDiv);

    input.value = "";

    // AUTO SCROLL

    chatBox.scrollTop =
        chatBox.scrollHeight;

    // BOT MESSAGE

    const botDiv =
        document.createElement("div");

    botDiv.className =
        "message bot-message";

    botDiv.innerText =
        "Typing...";

    chatBox.appendChild(botDiv);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    try {

        const response =
            await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });

        const data =
            await response.json();

        botDiv.innerText =
            data.reply;

    } catch (error) {

        botDiv.innerText =
            "⚠️ Connection failed.";
    }

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// ENTER KEY SUPPORT

document
.getElementById("user-input")
.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendMessage();
    }
});

// THEME TOGGLE

function toggleTheme() {

    document.body.classList.toggle("light");

    const themeButton =
        document.querySelector(".theme-btn");

    if (
        document.body.classList.contains("light")
    ) {

        themeButton.innerText = "☀️";

    } else {

        themeButton.innerText = "🌙";
    }
}