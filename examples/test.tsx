import { Client, Events, REST, Routes, SlashCommandBuilder } from "discord.js"
import { createJSXRenderer } from "../src/index.js";
import { useEffect, useState } from "react";
import { config } from "dotenv";
config();

let client = new Client({
    intents: [
        "Guilds",
    ],
});

const Test = () => {
    const [counter, setCounter] = useState(0);

    return (
        <msg>
            <embed
                color="Purple"
                title="owo"
            >
                Hello world!

                Counter: {counter}
            </embed>

            <row>
                <button onClick={() => setCounter(c => c-1)}>
                    -1
                </button>
                <button onClick={() => setCounter(c => c+1)}>
                    +1
                </button>
            </row>
        </msg>
    )
}

client.on(Events.ClientReady, () => {
    console.log("Bot ready");
});

process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);

client.on(Events.InteractionCreate, async (int) => {
    if (!int.isChatInputCommand()) return;

    await int.deferReply();

    createJSXRenderer(client, <Test />, async (msg) => {
        await int.editReply(msg);
    });
});

client.login(process.env.TOKEN);

const rest = new REST().setToken(process.env.TOKEN || "");

await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID || "", process.env.GUILD_ID || ""),
    {
        body: [
            new SlashCommandBuilder()
                .setName("test")
                .setDescription("test")
                .toJSON()
        ],
    }
)
