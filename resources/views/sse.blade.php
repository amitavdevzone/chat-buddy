<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSE Example</title>
</head>

<body>
    <h1>Server-Sent Events (SSE) Example</h1>

    <div id="messages"></div>

    <button id="startSSE">Start SSE Connection</button>

    <script>
        let eventSource;

        // Function to start the SSE connection
        function startSSE() {
            if (eventSource) {
                eventSource.close();
            }

            eventSource = new EventSource("/sse");

            eventSource.onmessage = function (event) {
                console.log("Received message:", event);

                const message = event.data;

                const messagesDiv = document.getElementById("messages");
                const newMessage = document.createElement("p");
                newMessage.textContent = message;
                messagesDiv.appendChild(newMessage);
            };

            // Error handling
            eventSource.onerror = function () {
                console.log('Closing');
                eventSource.close();  // Close the connection if there's an error
            };
        }

        document.getElementById("startSSE").addEventListener("click", startSSE);
    </script>
</body>

</html>
