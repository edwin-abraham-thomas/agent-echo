const CommandHandler = require('./CommandHandler');
const N8nService = require('../services/N8nService');
const DiscordContextBuilder = require('../services/DiscordContextBuilder');

/**
 * Slash Command Handler
 * Handles slash command interactions
 */
class SlashCommandHandler extends CommandHandler {
  constructor(n8nService) {
    super();
    this.n8nService = n8nService;
  }

  /**
   * Handle analyse-nutrition command
   * @param {ChatInputCommandInteraction} interaction
   */
  async handleAnalyseNutrition(interaction) {
    const image = interaction.options.getAttachment('image');
    const message = interaction.options.getString('message');

    try {
      // Acknowledge the command immediately without waiting for response
      await interaction.reply('🥗 Analyzing nutrition information...');

      // Build payload with the image and optional message
      const payload = {
        imageUrl: image.url,
        imageName: image.name,
        imageSize: image.size,
        message: message || '',
        ...DiscordContextBuilder.fromInteraction(interaction),
      };

      // Call the specific webhook for nutrition analysis (fire and forget)
      const url = 'http://localhost:5678/webhook-test/a5d6da3f-8c74-4a42-9455-9a084ccb5354';
      this.n8nService.client.post(url, payload).catch(error => {
        console.error('Error sending nutrition analysis to n8n:', error.message);
      });

      // Don't wait for response - n8n will post the result back to Discord
    } catch (error) {
      console.error('Error with analyse-nutrition command:', error.message);
      await interaction.reply(`❌ Failed to process command: ${error.message}`);
    }
  }

  /**
   * Handle ping command
   * @param {ChatInputCommandInteraction} interaction
   */
  async handlePing(interaction) {
    await interaction.reply('🏓 Pong!');
  }

  /**
   * Handle trigger command
   * @param {ChatInputCommandInteraction} interaction
   */
  async handleTrigger(interaction) {
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

      // Build context and merge with payload
      const context = DiscordContextBuilder.fromInteraction(interaction);
      const finalPayload = DiscordContextBuilder.mergeWithContext(payload, context);

      // Trigger webhook
      const result = await this.n8nService.triggerWebhook(webhookPath, finalPayload);

      // Format and send response
      const resultText = this.n8nService.formatResponse(result);
      const response = this.formatWebhookResponse(resultText);

      await interaction.editReply(response);
    } catch (error) {
      console.error('Error triggering webhook:', error.message);
      await interaction.editReply(`❌ Failed to trigger webhook: ${error.message}`);
    }
  }

  /**
   * Handle help command
   * @param {ChatInputCommandInteraction} interaction
   */
  async handleHelp(interaction) {
    const helpText = `
📚 **Discord Bot - n8n Integration**

**Available Slash Commands:**
\`/ping\` - Check if bot is alive
\`/trigger\` - Trigger n8n webhook
  - \`webhook\` (required): Webhook path (e.g., my-workflow)
  - \`data\` (optional): JSON data to send

\`/analyse-nutrition\` - Analyze nutrition from image
  - \`image\` (required): Image to analyze
  - \`message\` (optional): Additional context

\`/help\` - Show this message

**Legacy Prefix Commands (still supported):**
\`!ping\` - Check if bot is alive
\`!trigger <webhook-path> [json-data]\` - Trigger n8n webhook
\`!analyse-nutrition [context text]\` - Analyze nutrition (attach image)
\`!help\` - Show help

**Examples:**
\`/trigger webhook:my-workflow\`
\`/trigger webhook:my-workflow data:{"key": "value"}\`
\`/analyse-nutrition image:<image.jpg> message:optional context\`

**Bot Features:**
• Slash commands (recommended)
• Prefix commands (legacy support)
• Direct integration with n8n workflows
• Support for custom JSON payloads
• Image-based nutrition analysis
• Discord user context passed to n8n
    `;
    await interaction.reply(helpText);
  }

  /**
   * Format webhook response
   * @param {string} resultText - Response text
   * @returns {string} - Formatted response
   */
  formatWebhookResponse(resultText) {
    if (resultText.length > 2000) {
      return `✅ Webhook triggered successfully!\n\`\`\`\n${resultText.substring(0, 1997)}...\n\`\`\``;
    }
    return `✅ Webhook triggered successfully!\n\`\`\`json\n${resultText}\n\`\`\``;
  }
}

module.exports = SlashCommandHandler;
