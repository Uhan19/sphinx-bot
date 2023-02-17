require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");

const maxAttempts = 3;
const quoteApiEndpoint = "https://zenquotes.io/api/random";
const riddlesApiEndpoint = "https://api.api-ninjas.com/v1/riddles";
// the jokes API allows the limit to be changed dynamically
const jokesApiEndpoint = "https://api.api-ninjas.com/v1/jokes?limit=1";
// the facts API allows the limit to be changed dynamically
const factsApiEndpoint = "https://api.api-ninjas.com/v1/facts?limit=1";
const ninjaApiToken = process.env.NINJA_API_TOKEN;
const botToken = process.env.TOKEN;

const getQuote = async () => {
	return await fetch(quoteApiEndpoint)
		.then(res => {
			return res.json();
		})
		.then(data => {
			return data[0]["q"] + " -" + data[0]["a"];
		});
};

const getRiddle = (message) => {
	return fetch(riddlesApiEndpoint, {
		headers: { "x-api-key": ninjaApiToken },
	})
		.then(response => response.json())
		.then(data => {
			const riddle = data[0];
			const question = riddle.question;
			const answer = riddle.answer.replace(/[^\w\s]|_+$/, "");
			let attempts = 0;
			let solved = false;
			message.channel.send(`Question: ${question}`);
			console.log("answer: ", answer);
			const filter = m => m.author.id === message.author.id;
			const collector = message.channel.createMessageCollector({ filter, time: 300000 });
			collector.on("collect", m => {
				if (m.content.toLowerCase() === riddle.answer.toLowerCase()) {
					solved = true;
					collector.stop();
					message.channel.send(`${message.author} got it! The answer is "${answer}"!`);
				}
				else if (m.content.toLowerCase() === "I give up") {
					solved = true;
					collector.stop();
					message.channel.send(`Aww better luck next time! The answer is "${answer}"!`);
				}
				else {
					attempts++;
					if (attempts >= maxAttempts) {
						solved = true;
						collector.stop();
						message.channel.send(`You ran out of attempts! The answer is "${answer}!"`);
					}
					else {
						message.channel.send("That's not it. Try again!");
					}
				}
			});
			collector.on("end", () => {
				if (!solved) {
					message.channel.send(`You ran out of time! The answer is "${answer}"`);
				}
			});
		})
		.catch(error => {
			console.error(error);
		});
};

const getJoke = (message) => {
	return fetch(jokesApiEndpoint, {
		headers: { "x-api-key": ninjaApiToken },
	})
		.then(res => res.json())
		.then(data => {
			const joke = data[0].joke;
			message.channel.send(joke);
		});
};

const getFact = (message) => {
	return fetch(factsApiEndpoint, {
		headers: { "x-api-key": ninjaApiToken },
	})
		.then(res => res.json())
		.then(data => {
			const fact = data[0].fact;
			message.channel.send(`here is a FACT: ${fact}`);
		});
};

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
	if (msg.author.bot) return;
	if (msg.content === "inspire") {
		getQuote().then(quote => msg.channel.send(quote));
	}

	if (msg.content === "riddle me this") {
		getRiddle(msg);
	}

	if (msg.content === "tell me a fact") {
		getFact(msg);
	}

	if (msg.content === "make me laugh") {
		getJoke(msg);
	}
});

client.login(botToken);