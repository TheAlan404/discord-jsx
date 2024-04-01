# @alan404/discordjsx

Allows you to use React/JSX in your discord.js projects

Examples in [examples folder](./examples)

Normal react hooks DO work, such as useState and useEffect.

## Installation

```
pnpm add @alan404/discordjsx
```

or if you are old:

```
npm i @alan404/discordjsx
```

## Usage

```js
import { createJSXRenderer } from "@alan404/discordjsx"; 

createJSXRenderer(client, <Test />, async (msg) => {
    // send msg by either of these methods:
    await interaction.editReply(msg);
    await message.channel.send(msg);
    // etc.
});
```

### createJSXRenderer

```ts
createJSXRenderer(
    discordClient: Discord.Client,
    component: React.ReactNode,
    updateMessage: (message) => void,
)
```

### Elements

- `<msg>`: Message
- `<embed title="" color="">`: An embed
- `<row>`: Action Row

### Buttons!

Define a button:

```jsx
<button id="a">
    Hi
</button>
```

You can also add a callback!

```jsx
<button onClick={...}>
    Hi
</button>
```

### Notes

please dont use this abomination in prod

todo: select menus
