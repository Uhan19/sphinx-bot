require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, c => {
	console.log(`logged in as ${c.user.tag}`);
});

client.on("messageCreate", msg => {
	if (msg.content === "ping") {
		msg.reply("pong");
	}
});

client.login(process.env.TOKEN);