# Discord Bot - n8n Integration (Refactored)

A modern Discord bot that integrates with n8n workflows using only slash commands. Built with clean architecture for easy extensibility and maintenance.

**Status:** ✅ Fully Operational | **Architecture:** 🏗️ Modern & Clean | **Commands:** ⚡ Slash Only

## 🚀 Quick Start

### Prerequisites
- Discord Bot Token ([Create here](https://discord.com/developers/applications))
- n8n instance (included in docker-compose)
- Docker & Docker Compose

### Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your DISCORD_TOKEN to .env
# DISCORD_TOKEN=your_token_here

# 3. Start all services
docker compose up -d --build

# 4. Check status
docker compose ps
```

## 🤖 Available Commands

### Core Commands
- **`/ping`** - Check bot responsiveness
- **`/help`** - Show available commands and usage
- **`/trigger`** - Trigger custom n8n workflows
  - `webhook` (required): Webhook path
  - `data` (optional): JSON payload
- **`/analyse-nutrition`** - Analyze nutrition from images
  - `image` (required): Image to analyze
  - `message` (optional): Additional context

### Usage Examples
```bash
/ping
/help
/trigger webhook:my-workflow data:{"key": "value"}
/analyse-nutrition image:<upload.jpg> message:optional context
```

## 🏗️ Architecture

### Clean & Modern Structure
```
src/
├── index.js                    # Entry point
├── BotFactory.js              # Bot creation and setup
├── services/
│   └── N8nService.js          # n8n API integration
└── commands/
    ├── BaseCommand.js         # Abstract base class
    ├── CommandManager.js      # Command registry & execution
    ├── PingCommand.js         # Health check
    ├── HelpCommand.js         # Help system
    ├── TriggerCommand.js      # Generic n8n trigger
    ├── AnalyseNutritionCommand.js # Nutrition analysis
    └── ExampleCommand.js      # Template for new commands
```

### Key Benefits
- 🚫 **No Legacy Code** - Slash commands only
- 🔄 **Zero Duplication** - Shared base classes
- ➕ **Easy Extensions** - Template-based command creation
- 🎯 **Single Responsibility** - Each file has one purpose
- 📦 **Clean Dependencies** - Minimal coupling

## 🛠️ Adding New Commands

### 1. Copy the Template
```bash
cp src/commands/ExampleCommand.js src/commands/YourCommand.js
```

### 2. Customize Your Command
```javascript
class YourCommand extends BaseCommand {
  constructor() {
    super('your-command', 'Description of your command');
    this.webhookId = 'your-n8n-webhook-id'; // Optional
  }

  buildCommand() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option.setName('input')
          .setDescription('Your input parameter')
          .setRequired(true)
      );
  }

  async execute(interaction, n8nService) {
    const input = interaction.options.getString('input');
    
    // For immediate responses:
    await interaction.reply(\`Processing: \${input}\`);
    
    // OR for n8n webhooks:
    const payload = {
      input: input,
      discord: this.buildDiscordContext(interaction),
    };
    await this.triggerWebhook(n8nService, this.webhookId, payload);
  }
}
```

### 3. Register in CommandManager
```javascript
// In src/commands/CommandManager.js
const YourCommand = require('./YourCommand');

// Add to commandClasses array:
const commandClasses = [
  PingCommand,
  HelpCommand,
  TriggerCommand,
  AnalyseNutritionCommand,
  YourCommand, // <- Add here
];
```

### 4. Deploy
```bash
docker compose up -d --build
```

That's it! Your new command is live.

## 🔗 n8n Integration Patterns

### Fire-and-Forget Pattern
Best for long-running processes where n8n posts results back:

```javascript
async execute(interaction, n8nService) {
  await interaction.reply('🔄 Processing...');
  
  const payload = {
    data: 'your-data',
    discord: this.buildDiscordContext(interaction),
  };
  
  // Triggers webhook, doesn't wait for response
  await this.triggerWebhook(n8nService, this.webhookId, payload);
  // n8n will post results back to Discord asynchronously
}
```

### Immediate Response Pattern
Best for quick operations that return results immediately:

```javascript
async execute(interaction, n8nService) {
  await interaction.deferReply();
  
  const result = await n8nService.triggerWebhook(webhookPath, payload);
  await interaction.editReply(\`Result: \${result}\`);
}
```

## 📡 Discord Context

Every command automatically includes Discord context in the payload sent to n8n:

```javascript
{
  // Your command data
  "input": "user data",
  
  // Automatic Discord context
  "discord": {
    "author": "username",
    "userId": "123456789",
    "channelId": "987654321",
    "guildId": "555555555", 
    "commandName": "your-command"
  }
}
```

## 🚢 Development

### Local Development
```bash
cd discord-bot
npm install
npm start
```

### Project Structure
- **Single Responsibility**: Each file has one clear purpose
- **Open/Closed**: Easy to extend with new commands
- **Dependency Injection**: Services passed to commands
- **Template Pattern**: ExampleCommand.js for consistency

### Testing Changes
Always rebuild containers after code changes:
```bash
docker compose down
docker compose up -d --build
docker compose logs discord-bot -f
```

## 🔧 Configuration

### Environment Variables
```bash
DISCORD_TOKEN=your_discord_bot_token
N8N_BASE_URL=http://n8n:5678
N8N_API_KEY=your_n8n_api_key
NODE_ENV=production
```

### Docker Integration
- Minimal intents (Guilds only, no message content)
- Health checks enabled
- Automatic restart on failure
- Optimized Alpine Linux image

## 📊 Technical Specs

| Component | Technology | Purpose |
|-----------|------------|---------|
| Commands | discord.js v14 | Slash command framework |
| HTTP Client | axios | n8n API requests |
| Runtime | Node.js 18+ | JavaScript execution |
| Container | Alpine Linux | Minimal Docker image |
| Architecture | SOLID principles | Clean, maintainable code |

## 🎯 Benefits of Refactoring

### Before (Legacy)
- ❌ Dual command systems (slash + prefix)
- ❌ Code duplication across handlers
- ❌ Complex event routing
- ❌ Difficult to add new commands

### After (Modern)
- ✅ Slash commands only
- ✅ Zero code duplication
- ✅ Template-based command creation
- ✅ 5-minute new command development
- ✅ Clean separation of concerns
- ✅ Easy testing and maintenance

---

**Last Updated**: October 26, 2025  
**Version**: 2.0.0 (Refactored)  
**Status**: Production Ready ✅