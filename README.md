# 🤖 Discord Bot Boilerplate - TypeScript, MongoDB & Slash Commands

A modular Discord bot template built with **TypeScript**, **discord.js v14**, and **MongoDB**. This boilerplate provides a solid foundation for building scalable Discord bots without starting from scratch every time.

---

## ✨ Features

- ⚡ **Dynamic loading** of commands and events
- 🗄️ **MongoDB integration** via Mongoose for persistent data
- 🔄 **Graceful shutdown** handling (`SIGINT`, `SIGTERM`)
- 🔐 **Secure configuration** using environment variables
- 📘 **Type-safe** with TypeScript
- 📋 **Structured logging** with custom logger
- 🛡️ **Global error handling** for exceptions and promise rejections
- 🎯 **Production-ready** structure

---

## 🚀 Quick Start

### 1️⃣ Clone the repository

```bash
git clone https://github.com/P4ciuf/discord-bot-boilerplate)](https://github.com/P4ciuf/discord-bot-boilerplate
cd discord-bot-boilerplate
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env.local` file in the root directory:

```env
TOKEN=your-discord-bot-token
CLIENT_ID=your-application-id
MONGODB_URI=mongodb://localhost:27017/discord-bot
```

> **Note:** You can also use `.env` instead of `.env.local`

### 4️⃣ Build the project

```bash
npm run build
```

### 5️⃣ Start the bot

```bash
npm run prod
```

For development:

```bash
npm test
```

---

## 🔧 Creating Commands

Commands should be created in the `src/commands/` folder following this structure:

```typescript
import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types/Command";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency"),
  
  execute: (interaction: ChatInputCommandInteraction): Promise<void> => {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`🏓 Pong! Latency: ${latency}ms`);
  },
};

export default command;
```

**Best practices:**
- Organize commands in subfolders by category (e.g., `general/`, `moderation/`)
- Use descriptive file names (e.g., `kick.ts`, `userinfo.ts`)
- Always handle errors with try-catch in the `execute` function
- Keep command logic focused and modular

---

## 🎧 Creating Events

Events should be created in the `src/events/` folder:

```typescript
import { Event } from "../types/Event";
import { Client } from "discord.js";

const event: Event = {
  name: "ready",
  once: true,
  
  execute(client: Client) {
    console.log(`✅ Bot is online as ${client.user?.tag}`);
    client.user?.setActivity("with slash commands", { type: "PLAYING" });
  },
};

export default event;
```

**Common events:**
- `ready` - When the bot connects to Discord
- `interactionCreate` - Handle commands and interactions
- `messageCreate` - For text messages (if needed)
- `guildMemberAdd` - When a user joins a server
- And many more discord.js events

---

## 📜 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Start in development mode with ts-node |
| `npm run prod` | Start the compiled bot from `dist/` |

---

## 🛡️ Error Handling

The boilerplate includes comprehensive error handling:

### Graceful Shutdown
- Intercepts `SIGINT` (Ctrl+C) and `SIGTERM`
- Properly closes MongoDB connection
- Logs out Discord client cleanly

### Global Error Handlers
```typescript
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});
```

### Logging
All command/event loading errors are logged with:
- File path of the problematic module
- Complete stack trace
- Error timestamp

---

## 🔐 Environment Variables

| Variable | Description | Example |
|-----------|-------------|---------|
| `TOKEN` | Discord bot token | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ...` |
| `CLIENT_ID` | Bot application ID | `1234567890123456789` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/botdb` |

> ⚠️ **Important:** Never commit `.env.local` or `.env` files to your repository!

---

## 📋 Requirements

- **Node.js** v18.0.0 or higher
- **npm** or **yarn** for package management
- **MongoDB** v5.0+ (local or cloud like MongoDB Atlas)
- **Discord Bot** registered on the [Discord Developer Portal](https://discord.com/developers/applications)

### Required Bot Permissions
When inviting your bot, make sure to enable:
- ✅ `applications.commands` (for slash commands)
- ✅ Other permissions based on features (e.g., `Kick Members`, `Ban Members`)

---

## 🚦 Deployment

### Deploy on VPS/Server

```bash
# Install PM2 for process management
npm install -g pm2

# Start the bot with PM2
pm2 start dist/index.js --name discord-bot

# Set up auto-restart on system reboot
pm2 startup
pm2 save
```

### Deploy on Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set TOKEN=your-token
railway variables set CLIENT_ID=your-client-id
railway variables set MONGODB_URI=your-mongodb-uri

# Deploy
railway up
```

### Deploy on Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-bot-name

# Add MongoDB add-on
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set TOKEN=your-token
heroku config:set CLIENT_ID=your-client-id

# Deploy
git push heroku main
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💡 Why Use This Boilerplate?

- 🎯 **Save time** - Don't rebuild the same structure every time
- 🏗️ **Best practices** - Industry-standard project organization
- 🔧 **Easily extensible** - Add new commands and events in seconds
- 📦 **Production-ready** - Includes error handling, logging, and deployment guides
- 🧪 **Type-safe** - Full TypeScript support prevents runtime errors

---

## 📝 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 👨‍💻 Author

Built with ❤️ by **P4ciuf**

- GitHub: [@P4ciuf](https://github.com/P4ciuf)
- Discord: p4ciuf

---

## 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/P4ciuf/discord-bot-boilerplate/issues) with:
- Detailed description of the problem
- Steps to reproduce the bug
- Error logs (if available)
- Environment details (OS, Node.js version, etc.)

---

## 📚 Useful Resources

- [discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs/intro)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🗺️ Roadmap

- [ ] Add command cooldowns
- [ ] Implement permission system
- [ ] Add database models examples
- [ ] Create command categories system
- [ ] Add unit tests
- [ ] Docker support
- [ ] Multi-language support

---

<div align="center">

**If you find this boilerplate helpful, give it a ⭐ on GitHub!**

Made to save developers time ⏱️

</div>
