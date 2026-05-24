async function sendMessage() {

    const input =
        document.getElementById("user-input");

    const message = input.value;

    if (!message) return;

    const chatBox =
        document.getElementById("chat-box");

    const userDiv =
        document.createElement("div");

    userDiv.className = "user";
    userDiv.innerText = message;

    chatBox.appendChild(userDiv);

    const botDiv =
        document.createElement("div");

    botDiv.className = "bot";
    botDiv.innerText = "Typing...";

    chatBox.appendChild(botDiv);

    input.value = "";

    try {

        const response =
            await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        botDiv.innerText = data.reply;

    } catch (error) {

        console.log(error);

        botDiv.innerText =
            "Frontend error";
    }
}