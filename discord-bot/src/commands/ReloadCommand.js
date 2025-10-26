const BaseCommand = require('./BaseCommand');

/**
 * Reload Command
 * Reloads all commands and re-registers them with Discord
 */
class ReloadCommand extends BaseCommand {
  constructor(n8nService, commandManager) {
    super();
    this.n8nService = n8nService;
    this.commandManager = commandManager;
  }

  /**
   * Get command definition
   */
  getDefinition() {
    return {
      name: 'reload',
      description: 'Reload all commands and re-register with Discord',
    };
  }

  /**
   * Execute the reload command
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      // Only allow bot owner/admin to reload (optional security check)
      // You can customize this check based on your needs
      
      await interaction.deferReply({ ephemeral: true });

      // Clear Node.js module cache for hot reloading
      this.clearModuleCache();

      // Reload commands in the command manager
      await this.commandManager.reloadCommands();

      // Re-register commands with Discord
      await this.commandManager.registerCommands(interaction.client);

      await interaction.editReply({
        content: '✅ Commands reloaded and re-registered successfully!',
        ephemeral: true
      });

    } catch (error) {
      console.error('Error reloading commands:', error);
      
      const errorMsg = '❌ Failed to reload commands: ' + error.message;
      
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMsg, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMsg, ephemeral: true });
      }
    }
  }

  /**
   * Clear Node.js module cache for hot reloading
   */
  clearModuleCache() {
    const path = require('path');
    const commandsDir = path.join(__dirname);
    
    // Clear cache for all command files
    Object.keys(require.cache).forEach(key => {
      if (key.includes(commandsDir) && !key.includes('node_modules')) {
        delete require.cache[key];
        console.log(`🗑️ Cleared cache for: ${path.basename(key)}`);
      }
    });
  }
}

module.exports = ReloadCommand;