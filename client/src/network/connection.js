const io = require("socket.io-client");

export const connection = io(":1337");

connection.on("connect", () => {
    console.log("connected as: " + connection.id);
});