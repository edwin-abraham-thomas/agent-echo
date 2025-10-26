const BaseCommand = require('./BaseCommand');

/**
 * Help Command
 * Shows available commands and usage
 */
class HelpCommand extends BaseCommand {
  constructor(n8nService) {
    super(n8nService);
  }

  /**
   * Get command definition
   */
  getDefinition() {
    return {
      name: 'help',
      description: 'Show available commands and usage',
    };
  }

  /**
   * Execute the help command
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const helpText = `
📚 **Discord Bot - n8n Integration**

**Available Commands:**
\`/ping\` - Check if bot is alive
\`/trigger\` - Trigger custom n8n workflow
\`/analyse-nutrition\` - Analyze nutrition from image
\`/reload\` - Reload commands (admin only)
\`/help\` - Show this message

**Usage Examples:**
\`/trigger webhook:my-workflow data:{"key": "value"}\`
\`/analyse-nutrition image:<upload> message:optional context\`
\`/reload\` - Hot reload all commands

**Features:**
• Modern slash commands only
• Direct integration with n8n workflows
• Image analysis capabilities
• Hot reload functionality
• Discord context passed to workflows

**Need more help?** Check the documentation or contact support.
    `;
    await interaction.reply(helpText);
  }
}

module.exports = HelpCommand;