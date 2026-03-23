const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInNlc3Npb25JZCI6ImE1ZGNlOTU4LWRlZmEtNGY5MC1hM2EyLTAwMmQxYzcwMGMzZiIsImlhdCI6MTc3NDMwMDYxMiwiZXhwIjoxNzc0MzAxNTEyfQ.vEvFZz9XsIdMuRcEHszOm_-bCzAgxu7dE8hy4nvGLOo" }
});


socket.on("connect", () => console.log("Connected"));
socket.on("connect_error", (err) => {
    // err — это объект, который ты передавал через next(err)
    console.log("Connect error:", JSON.parse(err.message));
});

socket.emit("fhsahfkaf")

socket.emit("ping");
socket.on("pong", (msg) => console.log("Received:", msg));
