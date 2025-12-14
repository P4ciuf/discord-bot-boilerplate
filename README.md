# Discord Bot Boilerplate

[![GitHub Template](https://img.shields.io/badge/GitHub-Template-brightgreen?style=flat&logo=github)](https://github.com/P4ciuf/discord-bot-boilerplate)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh/)

A scalable and maintainable template for Discord bots built with TypeScript, Discord.js v14, Mongoose, and dotenv.

## 🚀 Features

- ⚡ **Dual Runtime**: Bun for development (maximum speed) and Node.js for production (stability)
- 📦 **TypeScript**: Type-safe with full ESM support and path aliases
- 🎯 **Modular Architecture**: Dynamic loading system for commands, events, and interactions
- 💾 **MongoDB Database**: Pre-configured Mongoose integration
- 🔧 **Hot Reload**: Fast development with Bun
- 📝 **Advanced Logging**: Winston with daily log file rotation
- 🎨 **Code Quality**: Pre-configured ESLint + Prettier
- 🔐 **Environment Management**: Secure configuration via environment variables
- 🛠️ **Utility Scripts**: Ready-to-use scripts for command registration and cleanup
- ✨ **VS Code Snippets**: Ready-made templates to speed up development

## 📁 Project Structure

```
discord-bot-boilerplate/
├── src/
│   ├── commands/           # Bot commands
│   │   ├── messages/       # Message commands (prefix)
│   │   └── slash/          # Slash commands
│   ├── config/             # Configurations
│   │   ├── env.ts          # Environment variable validation
│   │   └── index.ts        # General configuration
│   ├── core/               # Bot core
│   │   ├── clients.ts      # Discord client
│   │   └── loaders.ts      # Dynamic loading system
│   ├── database/           # Database and models
│   │   ├── models/         # Mongoose schemas
│   │   └── index.ts        # DB connection
│   ├── events/             # Event handlers
│   │   ├── client/         # Discord client events
│   │   └── guild/          # Guild events
│   ├── types/              # TypeScript definitions
│   │   ├── button.ts       # Types for button interactions
│   │   ├── commands.ts     # Types for slash commands
│   │   ├── events.ts       # Types for events
│   │   ├── messageCommands.ts  # Types for message commands
│   │   ├── modal.ts        # Types for modal interactions
│   │   └── stringMenu.ts   # Types for select menus
│   ├── utils/              # Utility functions
│   │   ├── createErrorEmbed.ts  # Helper for error embeds
│   │   └── logger.ts       # Logging system
│   ├── main.ts             # Entry point
│   └── shutdown.ts         # Graceful shutdown management
├── scripts/                # Utility scripts
│   ├── deleteCommands.ts   # Remove registered commands
│   └── registerCommands.ts # Register slash commands
├── .env.example            # Environment variables template
├── .gitignore              # Files to ignore
├── eslint.config.js        # ESLint configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── LICENSE                 # Project license
```

## 🛠️ Installation

### Prerequisites

- **Node.js** v18 or higher (for production)
- **Bun** v1.0 or higher (for development)
- **MongoDB** (local or Atlas)
- A **Discord Application** with bot token

### Setup

1. **Use this template**

   Click the "Use this template" button on GitHub or clone the repository:
   ```bash
   git clone https://github.com/P4ciuf/discord-bot-boilerplate.git
   cd discord-bot-boilerplate
   ```

2. **Install dependencies**

   With npm:
   ```bash
   npm install
   ```

   With Bun:
   ```bash
   bun install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   TOKEN="your-bot-token"
   CLIENT_ID="your-client-id"
   MONGODB_URI="mongodb://localhost:27017/discord-bot"
   ```

4. **Register slash commands**
   ```bash
   npm run test  # or bun run test to use Bun
   ```

## 🎮 Usage

### Development (with Bun)

```bash
npm run test
# or
bun run test
```

Hot reload enabled - changes will be applied automatically.

### Production (with Node.js)

```bash
npm run build
npm start
```

The bot will be compiled and optimized for production.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test` | Start the bot in development mode with Bun |
| `npm start` | Compile and start in production with Node.js |
| `npm run build` | Compile the TypeScript project |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run prettier` | Format code with Prettier |

### Utility Scripts (in the `scripts/` folder)

- **registerCommands.ts**: Register all slash commands on Discord
- **deleteCommands.ts**: Remove all registered commands

## ⚡ VS Code Snippets

The template includes pre-configured snippets in `.vscode/snippets.code-snippets` to speed up development:

### Slash Command Template
Type `SlashCommandTemplate` and press Tab:
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "@/types";

export default {
  data: new SlashCommandBuilder()
    .setName("commandname")
    .setDescription("Command description"),
  async execute(interaction: ChatInputCommandInteraction) {
    // Command logic here
  },
} as Command;
```

### Event Template
Type `eventTemplate` and press Tab:
```typescript
import { Event } from "@/types";
import { Events } from "discord.js";

export default {
  name: Events.Eventname,
  once: false,
  async execute(...args) {
    // Event logic here
  },
} as Event;
```

### Text Command Template
Type `textCommandTemplate` and press Tab:
```typescript
import { MessageCommand } from "@/types";
import { Message, Events } from "discord.js";

export default {
  name: "CommandSyntax",
  event: Events.MessageCreate,
  async execute(msg: Message): Promise<void> {
    // Logic here
  },
} as MessageCommand;
```

## 🎯 Creating New Commands

### Slash Command

Create a file in `src/commands/slash/` (or use the `SlashCommandTemplate` snippet):

```typescript
import { SlashCommand } from "@/types";

export default {
  data: {
    name: "example",
    description: "An example command"
  },
  async execute(interaction) {
    await interaction.reply("Hello!");
  }
} satisfies SlashCommand;
```

### Message Command

Create a file in `src/commands/messages/`:

```typescript
import { MessageCommand } from "@/types";

export default {
  name: "example",
  description: "An example command",
  async execute(message, args) {
    await message.reply("Hello!");
  }
} satisfies MessageCommand;
```

## 🎭 Event Management

Create a file in `src/events/client/` or `src/events/guild/` (or use the `eventTemplate` snippet):

```typescript
import { ClientEvent } from "@/types";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    console.log(`Message received: ${message.content}`);
  }
} satisfies ClientEvent<"messageCreate">;
```

## 💾 Database

The template includes pre-configured Mongoose. Create your models in `src/database/models/`:

```typescript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
```

## 🔧 Configuration

### TypeScript

Edit `tsconfig.json` to customize compiler options.

### ESLint & Prettier

Configure linting rules in `eslint.config.js` according to your preferences.

### Logging

The Winston logging system is configurable in `src/utils/logger.ts`. Logs are saved in the `logs/` folder with daily rotation.

### Path Aliases

The project uses TypeScript path aliases for cleaner and more maintainable imports:

- `@/*` → `./src/*` - Alias for the src folder
- `@types/*` → `./src/types/*` - Alias for types

**Usage example:**
```typescript
// Instead of complex relative imports
import { Command } from "../../types";
import { logger } from "../../utils/logger";

// Use aliases
import { Command } from "@/types";
import { logger } from "@/utils/logger";
```

Aliases are configured in `tsconfig.json` and work automatically in both development and production.

## 🚀 Deployment

### Production Environment

1. Make sure all environment variables are configured
2. Compile the project: `npm run build`
3. Start the bot: `npm start`

### PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start the bot
pm2 start npm --name "discord-bot" -- start

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is distributed under the MIT license. See the `LICENSE` file for more details.

## 👤 Author

**P4ciuf**
- Email: p4ciuf@gmail.com
- GitHub: [@P4ciuf](https://github.com/P4ciuf)

## 🐛 Bugs and Requests

Found a bug or have a feature request? Open an [issue](https://github.com/P4ciuf/discord-bot-boilerplate/issues).

## ⭐ Support

If this template was useful to you, consider giving the repository a star ⭐!

---

**Built with ❤️ by P4ciuf**