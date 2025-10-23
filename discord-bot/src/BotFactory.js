const { Client, GatewayIntentBits } = require('discord.js');
const N8nService = require('./services/N8nService');
const SlashCommandRegistry = require('./commands/SlashCommandRegistry');
const SlashCommandHandler = require('./handlers/SlashCommandHandler');
const PrefixCommandHandler = require('./handlers/PrefixCommandHandler');
const ReadyEventHandler = require('./events/ReadyEventHandler');
const MessageEventHandler = require('./events/MessageEventHandler');
const InteractionEventHandler = require('./events/InteractionEventHandler');

/**
 * Bot Factory
 * Responsible for creating and configuring the bot instance
 */
class BotFactory {
  /**
   * Create bot instance
   * @param {object} config - Configuration object
   * @returns {Client} - Discord client
   */
  static create(config) {
    // Validate config
    if (!config.discordToken) {
      throw new Error('DISCORD_TOKEN is required');
    }

    // Create client
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Initialize services
    const n8nService = new N8nService(config.n8nBaseUrl, config.n8nApiKey);
    const slashCommandRegistry = new SlashCommandRegistry();

    // Initialize handlers
    const slashCommandHandler = new SlashCommandHandler(n8nService);
    const prefixCommandHandler = new PrefixCommandHandler(n8nService);
    const readyEventHandler = new ReadyEventHandler(
      config.n8nBaseUrl,
      config.discordToken,
      slashCommandRegistry
    );
    const messageEventHandler = new MessageEventHandler(prefixCommandHandler);
    const interactionEventHandler = new InteractionEventHandler(slashCommandHandler);

    // Register event listeners
    client.on('ready', () => readyEventHandler.handle(client));
    client.on('messageCreate', (message) => messageEventHandler.handle(message));
    client.on('interactionCreate', (interaction) => interactionEventHandler.handle(interaction));

    // Handle errors
    client.on('error', (error) => console.error('Discord client error:', error));
    process.on('unhandledRejection', (error) => console.error('Unhandled promise rejection:', error));

    return client;
  }
}

module.exports = BotFactory;
