// Create a unique ID for each browser

let userId = localStorage.getItem("userId");

if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
}

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

    userDiv.innerText =
        message;

    chatBox.appendChild(userDiv);

    input.value = "";

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
                    userId: userId,
                    message: message
                })
            });

        const data =
            await response.json();

        botDiv.innerText =
            data.reply;

    } catch (error) {

        console.error(error);

        botDiv.innerText =
            "⚠️ Connection failed.";
    }

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

// ENTER KEY

document
    .getElementById("user-input")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                sendMessage();
            }
        }
    );

// THEME BUTTON

const themeButton =
    document.getElementById(
        "theme-toggle"
    );

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            themeButton.innerText =
                "☀️";

        } else {

            themeButton.innerText =
                "🌙";
        }
    }
);