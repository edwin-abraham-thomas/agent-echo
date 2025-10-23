const CommandHandler = require('./CommandHandler');
const N8nService = require('../services/N8nService');
const DiscordContextBuilder = require('../services/DiscordContextBuilder');

/**
 * Prefix Command Handler
 * Handles legacy prefix-based commands (!command)
 */
class PrefixCommandHandler extends CommandHandler {
  constructor(n8nService) {
    super();
    this.n8nService = n8nService;
  }

  /**
   * Handle ping command
   * @param {Message} message
   */
  async handlePing(message) {
    await message.reply('🏓 Pong!');
  }

  /**
   * Handle trigger command
   * @param {Message} message
   * @param {string[]} args - Command arguments
   */
  async handleTrigger(message, args) {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!trigger <webhook-path> [json-data]`');
      return;
    }

    const webhookPath = args[0];
    let payload = {};

    // Parse JSON if provided
    if (args.length > 1) {
      try {
        const jsonStr = args.slice(1).join(' ');
        payload = JSON.parse(jsonStr);
      } catch (e) {
        await message.reply('❌ Invalid JSON provided. Usage: `!trigger <webhook-path> [json-data]`');
        return;
      }
    }

    try {
      // Build context and merge with payload
      const context = DiscordContextBuilder.fromMessage(message);
      const finalPayload = DiscordContextBuilder.mergeWithContext(payload, context);

      // Trigger webhook
      const result = await this.n8nService.triggerWebhook(webhookPath, finalPayload);

      // Format and send response
      const resultText = this.n8nService.formatResponse(result);
      const response = this.formatWebhookResponse(resultText);

      await message.reply(response);
    } catch (error) {
      console.error('Error triggering webhook:', error.message);
      await message.reply(`❌ Failed to trigger webhook: ${error.message}`);
    }
  }

  /**
   * Handle help command
   * @param {Message} message
   */
  async handleHelp(message) {
    const helpText = `
📚 **Discord Bot - n8n Integration**

**Available Commands:**
\`!ping\` - Check if bot is alive
\`!trigger\` - Trigger n8n webhook
\`!help\` - Show this message

**Slash Commands (recommended):**
\`/ping\` - Check if bot is alive
\`/trigger\` - Trigger n8n webhook
\`/help\` - Show this message

**Examples:**
\`!trigger my-workflow\`
\`!trigger my-workflow {"key": "value"}\`

**Bot Features:**
• Direct integration with n8n workflows
• Support for custom JSON payloads
• Discord message context passed to n8n

For more information, check the documentation.
    `;
    await message.reply(helpText);
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

module.exports = PrefixCommandHandler;
