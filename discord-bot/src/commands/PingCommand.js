const BaseCommand = require('./BaseCommand');

/**
 * Ping Command
 * Simple health check command
 */
class PingCommand extends BaseCommand {
  constructor(n8nService) {
    super(n8nService);
  }

  /**
   * Get command definition
   */
  getDefinition() {
    return {
      name: 'ping',
      description: 'Check if the bot is alive',
    };
  }

  /**
   * Execute the ping command
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply('🏓 Pong!');
  }
}

module.exports = PingCommand;