const express = require("express");

const server = express();

server.all("/", (req, res) => {
	res.send("Bot is running!");
});

const keepAlive = () => {
	server.listen(3000, () => {
		console.log("server is ready!");
	});
};

module.exports = keepAlive;
