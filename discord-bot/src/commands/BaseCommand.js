/**
 * Base Command Class
 * All commands should extend this class
 */
class BaseCommand {
  constructor(n8nService) {
    this.n8nService = n8nService;
  }

  /**
   * Get command definition (name, description, options)
   * Must be implemented by child classes
   * @returns {object}
   */
  getDefinition() {
    throw new Error('getDefinition() must be implemented by child classes');
  }

  /**
   * Execute the command
   * Must be implemented by child classes
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    throw new Error('execute() must be implemented by child classes');
  }

  /**
   * Build Discord slash command from definition
   * @returns {SlashCommandBuilder}
   */
  buildCommand() {
    const { SlashCommandBuilder } = require('discord.js');
    const definition = this.getDefinition();
    
    let command = new SlashCommandBuilder()
      .setName(definition.name)
      .setDescription(definition.description);

    // Add options if they exist
    if (definition.options) {
      definition.options.forEach(option => {
        switch (option.type) {
          case 'string':
            command.addStringOption(opt => 
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required || false)
            );
            break;
          case 'attachment':
            command.addAttachmentOption(opt => 
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required || false)
            );
            break;
          // Add more option types as needed
        }
      });
    }

    return command;
  }

  /**
   * Build Discord context from interaction
   * @param {ChatInputCommandInteraction} interaction
   * @returns {object}
   */
  buildDiscordContext(interaction) {
    return {
      author: interaction.user.username,
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      commandName: interaction.commandName,
    };
  }

  /**
   * Send to n8n webhook with error handling
   * @param {string} webhookPath
   * @param {object} payload
   * @returns {Promise<object|null>}
   */
  async sendToN8n(webhookPath, payload) {
    try {
      return await this.n8nService.triggerWebhook(webhookPath, payload);
    } catch (error) {
      console.error('Error sending to n8n:', error.message);
      throw error;
    }
  }

  /**
   * Send to n8n webhook (fire and forget)
   * @param {string} webhookPath
   * @param {object} payload
   */
  async sendToN8nAsync(webhookPath, payload) {
    const url = `${this.n8nService.baseUrl}/webhook/${webhookPath}`;
    this.n8nService.client.post(url, payload).catch(error => {
      console.error('Error sending to n8n (async):', error.message);
    });
  }
}

module.exports = BaseCommand;