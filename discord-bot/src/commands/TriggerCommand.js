const BaseCommand = require('./BaseCommand');

/**
 * Trigger Command
 * Generic command to trigger any n8n workflow
 */
class TriggerCommand extends BaseCommand {
  constructor(n8nService) {
    super(n8nService);
  }

  /**
   * Get command definition
   */
  getDefinition() {
    return {
      name: 'trigger',
      description: 'Trigger an n8n webhook',
      options: [
        {
          type: 'string',
          name: 'webhook',
          description: 'Webhook path (e.g., my-workflow)',
          required: true,
        },
        {
          type: 'string',
          name: 'data',
          description: 'JSON data to send (optional)',
          required: false,
        },
      ],
    };
  }

  /**
   * Execute the trigger command
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const webhookPath = interaction.options.getString('webhook');
    const dataStr = interaction.options.getString('data');

    let payload = {};

    // Parse JSON if provided
    if (dataStr) {
      try {
        payload = JSON.parse(dataStr);
      } catch (e) {
        await interaction.reply('❌ Invalid JSON provided.');
        return;
      }
    }

    try {
      await interaction.deferReply();

      // Build payload with Discord context
      const finalPayload = {
        ...payload,
        discord: this.buildDiscordContext(interaction),
      };

      // Trigger webhook and wait for response
      const result = await this.sendToN8n(webhookPath, finalPayload);
      const resultText = this.n8nService.formatResponse(result);
      
      const response = this.formatResponse(resultText);
      await interaction.editReply(response);
    } catch (error) {
      console.error('Error triggering webhook:', error.message);
      await interaction.editReply(`❌ Failed to trigger webhook: ${error.message}`);
    }
  }

  /**
   * Format webhook response
   * @param {string} resultText
   * @returns {string}
   */
  formatResponse(resultText) {
    if (resultText.length > 2000) {
      return `✅ Webhook triggered successfully!\n\`\`\`\n${resultText.substring(0, 1997)}...\n\`\`\``;
    }
    return `✅ Webhook triggered successfully!\n\`\`\`json\n${resultText}\n\`\`\``;
  }
}

module.exports = TriggerCommand;