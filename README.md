# Agent Echo 🤖

A comprehensive automation platform combining Discord bot integration with n8n workflow orchestration, running in a fully containerized environment.

## 📋 Overview

Agent Echo is a complete automation system that enables Discord users to trigger sophisticated workflows through n8n. The architecture is built on three main services:

- **Discord Bot** - Modern slash commands and prefix commands for user interaction
- **n8n** - Low-code workflow automation platform for enterprise integrations
- **PostgreSQL** - Persistent data storage for workflow execution history and configurations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │   Discord Bot    │  │      n8n         │  │PostgreSQL │ │
│  │   (Node.js)      │─→│   (Workflows)    │→ │           │ │
│  │                  │  │                  │  │ (Data)    │ │
│  │ • Slash Commands │  │ • Webhooks       │  │           │ │
│  │ • Prefix Commands│  │ • Automation     │  │           │ │
│  └──────────────────┘  └──────────────────┘  └───────────┘ │
│                                                              │
│  All services networked and running on localhost            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/edwin-abraham-thomas/agent-echo.git
   cd agent-echo
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values:
   - `DISCORD_TOKEN` - Your Discord bot token from Discord Developer Portal
   - `N8N_API_KEY` - API key for n8n authentication

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify all services are running:**
   ```bash
   docker-compose ps
   ```

### Accessing Services

- **n8n Dashboard**: http://localhost:5678
- **Discord Bot**: Invite to your server and use commands

## 📁 Project Structure

```
agent-echo/
├── README.md                          # This file - project overview
├── docker-compose.yml                 # Service orchestration
├── init-data.sh                       # PostgreSQL initialization script
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore patterns
│
└── discord-bot/                       # Discord Bot Service
    ├── package.json                   # Node.js dependencies
    ├── Dockerfile                     # Bot containerization
    ├── .dockerignore                  # Docker build optimization
    ├── README.md                      # Bot-specific documentation
    │
    └── src/
        ├── index.js                   # Entry point & bot initialization
        ├── BotFactory.js              # Factory pattern for dependency injection
        ├── index_old.js               # Original monolithic version (archived)
        │
        ├── commands/
        │   └── SlashCommandRegistry.js # Slash command definitions
        │
        ├── services/
        │   ├── N8nService.js          # n8n API integration
        │   └── DiscordContextBuilder.js # Discord context extraction
        │
        ├── handlers/
        │   ├── CommandHandler.js      # Abstract base class
        │   ├── SlashCommandHandler.js # Slash command logic
        │   └── PrefixCommandHandler.js # Prefix command logic
        │
        └── events/
            ├── ReadyEventHandler.js   # Bot ready event
            ├── MessageEventHandler.js # Message processing
            └── InteractionEventHandler.js # Slash command processing
```

## 🤖 Discord Bot Features

### Commands

#### Slash Commands (Modern)
- `/ping` - Check bot responsiveness
- `/trigger` - Trigger n8n workflows from Discord
- `/help` - Display command help

#### Prefix Commands (Legacy)
- `!ping` - Check bot responsiveness
- `!trigger` - Trigger n8n workflows from Discord
- `!help` - Display command help

### Triggering Workflows

Use the `/trigger` command to execute n8n workflows:

```
/trigger workflow_name:my-workflow param1:value1 param2:value2
```

The bot will:
1. Extract Discord context (user ID, channel, etc.)
2. Send webhook request to n8n with parameters
3. Return workflow execution results in Discord

## 🛠️ Technology Stack

| Service | Technology | Version | Purpose |
|---------|-----------|---------|---------|
| Bot | Node.js | 18+ | Discord bot runtime |
| Bot Framework | discord.js | 14.14.0 | Discord API wrapper |
| HTTP Client | axios | 1.6.0 | API requests to n8n |
| Config | dotenv | 16.3.1 | Environment management |
| Workflows | n8n | Latest | Automation platform |
| Database | PostgreSQL | 16 | Data persistence |
| Container | Docker | Latest | Containerization |
| Orchestration | Docker Compose | Latest | Service management |

## 🔧 Development

### Code Architecture

The Discord bot follows **SOLID principles**:

- **Single Responsibility**: Each module has one clear purpose
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: CommandHandler base class for polymorphism
- **Interface Segregation**: Focused service interfaces
- **Dependency Inversion**: BotFactory manages all dependencies

### Key Design Patterns

1. **Factory Pattern** (BotFactory.js)
   - Centralized bot creation and dependency injection
   - All services and handlers instantiated here

2. **Abstract Factory** (CommandHandler.js)
   - Base class for all command handlers
   - Eliminates code duplication

3. **Event-Driven Architecture**
   - Separate event handlers for different Discord events
   - Clean separation of concerns

4. **Service-Oriented**
   - N8nService: Pure n8n API integration
   - DiscordContextBuilder: Pure Discord context extraction

### Local Development

1. **Install dependencies:**
   ```bash
   cd discord-bot
   npm install
   ```

2. **Run without Docker:**
   ```bash
   npm start
   ```

3. **Run tests (when implemented):**
   ```bash
   npm test
   ```

## 📊 Services Overview

### Discord Bot
- **Port**: Internal (Discord API)
- **Status**: Runs in docker-compose
- **Responsibility**: Handle Discord interactions and route to n8n
- **Documentation**: See `discord-bot/README.md`

### n8n
- **Port**: 5678 (HTTP)
- **Status**: Runs in docker-compose
- **Responsibility**: Execute workflows, manage integrations
- **Access**: http://localhost:5678
- **Docs**: https://docs.n8n.io

### PostgreSQL
- **Port**: 5432 (Internal only)
- **Status**: Runs in docker-compose
- **Responsibility**: Store workflow data and configurations
- **Access**: Internal to Docker network only

## 🔐 Security

- Secrets stored in `.env` (never committed to git)
- GitHub push protection enabled
- `.env` excluded from git via `.gitignore`
- Use `.env.example` as configuration template
- Bot token never exposed in code or logs

## 📦 Docker Compose Services

### Environment Variables Required

```bash
# PostgreSQL
POSTGRES_USER=n8nadm
POSTGRES_PASSWORD=<secure_password>
POSTGRES_DB=n8n
POSTGRES_NON_ROOT_USER=n8nuser
POSTGRES_NON_ROOT_PASSWORD=<secure_password>

# Discord Bot
DISCORD_TOKEN=<your_discord_token>
N8N_API_KEY=<your_n8n_api_key>
N8N_BASE_URL=http://n8n:5678

# Application
NODE_ENV=production
```

## 🚢 Deployment

### Production Deployment

1. **On Linux Server:**
   ```bash
   git clone <repo>
   cd agent-echo
   cp .env.example .env
   # Edit .env with production secrets
   docker-compose -f docker-compose.yml up -d
   ```

2. **Health Checks:**
   ```bash
   docker-compose ps
   docker-compose logs discord-bot
   docker-compose logs n8n
   ```

3. **Persistent Storage:**
   - PostgreSQL data persists in Docker volume
   - n8n workflows stored in database
   - Discord bot logs in container

## 📝 Logging

View logs for each service:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f discord-bot
docker-compose logs -f n8n
docker-compose logs -f postgres
```

## 🐛 Troubleshooting

### Discord Bot not responding
```bash
docker-compose logs discord-bot
# Check DISCORD_TOKEN in .env
# Verify bot has required Discord server permissions
```

### n8n webhooks not working
```bash
docker-compose logs n8n
# Verify N8N_API_KEY in .env
# Check workflow webhook configurations
```

### PostgreSQL connection issues
```bash
docker-compose logs postgres
# Verify POSTGRES_PASSWORD matches env variable
# Ensure postgres service is running
```

## 📚 Additional Resources

- **Discord Bot Docs**: See `discord-bot/README.md`
- **n8n Documentation**: https://docs.n8n.io
- **Discord.js Guide**: https://discordjs.guide
- **Docker Docs**: https://docs.docker.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👤 Author

**Edwin Abraham Thomas**
- GitHub: [@edwin-abraham-thomas](https://github.com/edwin-abraham-thomas)
- Repository: [agent-echo](https://github.com/edwin-abraham-thomas/agent-echo)

## 🎯 Roadmap

- [ ] Unit tests for bot commands
- [ ] Integration tests for n8n workflows
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migration scripts
- [ ] Additional Discord integrations
- [ ] Web dashboard for workflow management
- [ ] Kubernetes deployment manifests
- [ ] Multi-language support

## ❓ FAQ

**Q: Can I run this without Docker?**
A: Yes, install Node.js 18+, PostgreSQL, and n8n separately. See development section.

**Q: How do I add new commands?**
A: Add to `discord-bot/src/commands/SlashCommandRegistry.js` and implement handler in `SlashCommandHandler.js`.

**Q: Can I use different databases?**
A: n8n supports multiple databases. See n8n documentation for configuration.

**Q: How do I scale this?**
A: Use Kubernetes manifests or scale Docker services with docker-compose.

---

**Last Updated**: October 24, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
