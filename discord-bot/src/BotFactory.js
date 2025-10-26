const { Client, GatewayIntentBits } = require('discord.js');
const N8nService = require('./services/N8nService');
const CommandManager = require('./commands/CommandManager');

/**
 * Bot Factory
 * Simplified bot creation with modern slash-only commands
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

    // Create client with minimal intents (no legacy message support needed)
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });

    // Initialize services and command manager
    const n8nService = new N8nService(config.n8nBaseUrl, config.n8nApiKey);
    const commandManager = new CommandManager(n8nService);

    // Register event listeners
    client.on('clientReady', async () => {
      console.log(`✅ Discord bot is online as ${client.user.tag}`);
      console.log(`🔗 Connected to n8n at: ${config.n8nBaseUrl}`);
      
      try {
        await commandManager.registerCommands(client);
      } catch (error) {
        console.error('❌ Failed to register commands:', error);
      }
    });

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await commandManager.executeCommand(interaction);
    });

    // Handle errors
    client.on('error', (error) => console.error('Discord client error:', error));
    process.on('unhandledRejection', (error) => console.error('Unhandled promise rejection:', error));

    return client;
  }
}

module.exports = BotFactory;
