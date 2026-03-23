const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInNlc3Npb25JZCI6IjU0NWQwYjE1LWNmODAtNDUyMS05ZDBjLWQ0YmY2MmQ4OWYzZSIsImlhdCI6MTc3NDI5NTE3gCwiZXhwIjoxNzc0Mjk2MDc4fQ.Fc9vHiPMA5EpAR7zIOair2b3UAyAZX4ObNLmQXnOCdY" }
});


socket.on("connect", () => console.log("Connected"));
socket.on("connect_error", (err) => {
    // err — это объект, который ты передавал через next(err)
    console.log("Connect error:", JSON.parse(err.message));
});

socket.emit("ping");
socket.on("pong", (msg) => console.log("Received:", msg));
