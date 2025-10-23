/**
 * Interaction Event Handler
 * Handles slash command interactions
 */
class InteractionEventHandler {
  constructor(slashCommandHandler) {
    this.slashCommandHandler = slashCommandHandler;
  }

  /**
   * Handle interaction event
   * @param {Interaction} interaction - Discord interaction
   */
  async handle(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
      await this.executeCommand(interaction, commandName);
    } catch (error) {
      console.error('Error handling interaction:', error);
      const errorMsg = '❌ An error occurred while processing your command.';
      
      if (interaction.replied) {
        await interaction.editReply(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    }
  }

  /**
   * Execute command
   * @param {Interaction} interaction - Discord interaction
   * @param {string} commandName - Command name
   */
  async executeCommand(interaction, commandName) {
    switch (commandName) {
      case 'ping':
        await this.slashCommandHandler.handlePing(interaction);
        break;

      case 'trigger':
        await this.slashCommandHandler.handleTrigger(interaction);
        break;

      case 'help':
        await this.slashCommandHandler.handleHelp(interaction);
        break;

      case 'analyse-nutrition':
        await this.slashCommandHandler.handleAnalyseNutrition(interaction);
        break;

      default:
        await interaction.reply('Unknown command.');
    }
  }
}

module.exports = InteractionEventHandler;
