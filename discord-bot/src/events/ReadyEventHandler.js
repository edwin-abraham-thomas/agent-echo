const { REST, Routes } = require('discord.js');

/**
 * Ready Event Handler
 * Handles bot ready event and slash command registration
 */
class ReadyEventHandler {
  constructor(n8nBaseUrl, discordToken, commands) {
    this.n8nBaseUrl = n8nBaseUrl;
    this.discordToken = discordToken;
    this.commands = commands;
  }

  /**
   * Handle ready event
   * @param {Client} client - Discord client
   */
  async handle(client) {
    console.log(`✅ Discord bot is online as ${client.user.tag}`);
    console.log(`🔗 Connected to n8n at: ${this.n8nBaseUrl}`);

    try {
      await this.registerSlashCommands(client);
    } catch (error) {
      console.error('❌ Failed to register slash commands:', error);
    }
  }

  /**
   * Register slash commands
   * @param {Client} client - Discord client
   */
  async registerSlashCommands(client) {
    console.log('🔄 Registering slash commands...');
    
    const rest = new REST({ version: '10' }).setToken(this.discordToken);
    await rest.put(Routes.applicationCommands(client.user.id), { 
      body: this.commands.getCommandsJSON() 
    });
    
    console.log('✅ Slash commands registered successfully!');
  }
}

module.exports = ReadyEventHandler;
