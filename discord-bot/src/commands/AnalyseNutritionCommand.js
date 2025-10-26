const BaseCommand = require('./BaseCommand');

/**
 * Analyse Nutrition Command
 * Analyzes nutrition information from uploaded images
 */
class AnalyseNutritionCommand extends BaseCommand {
  constructor(n8nService) {
    super(n8nService);
    this.webhookId = 'a5d6da3f-8c74-4a42-9455-9a084ccb5354';
  }

  /**
   * Get command definition
   */
  getDefinition() {
    return {
      name: 'analyse-nutrition',
      description: 'Analyze nutrition information from an image',
      options: [
        {
          type: 'attachment',
          name: 'image',
          description: 'Image to analyze for nutrition information',
          required: true,
        },
        {
          type: 'string',
          name: 'message',
          description: 'Additional message or context (optional)',
          required: false,
        },
      ],
    };
  }

  /**
   * Execute the analyse-nutrition command
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const image = interaction.options.getAttachment('image');
    const message = interaction.options.getString('message');

    try {
      // Acknowledge immediately (fire-and-forget pattern)
      await interaction.reply('🥗 Analyzing nutrition information...');

      // Build payload with image and Discord context
      const payload = {
        imageUrl: image.url,
        imageName: image.name,
        imageSize: image.size,
        message: message || '',
        discord: this.buildDiscordContext(interaction),
      };

      // Trigger webhook (fire-and-forget - n8n will post results back)
      await this.sendToN8nAsync(this.webhookId, payload);

    } catch (error) {
      console.error('Error with analyse-nutrition command:', error.message);
      await interaction.reply(`❌ Failed to process command: ${error.message}`);
    }
  }
}

module.exports = AnalyseNutritionCommand;