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

    userDiv.classList.add(
        "message",
        "user-message"
    );

    userDiv.innerText = message;

    chatBox.appendChild(userDiv);

    input.value = "";

    // AUTO SCROLL

    chatBox.scrollTop =
        chatBox.scrollHeight;

    // BOT TYPING

    const botDiv =
        document.createElement("div");

    botDiv.classList.add(
        "message",
        "bot-message"
    );

    botDiv.innerText = "Typing...";

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
            "⚠️ Failed to connect.";
    }

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// ENTER KEY SUPPORT

document
    .getElementById("user-input")
    .addEventListener("keypress", function(event) {

    if (event.key === "Enter") {

        sendMessage();
    }
});