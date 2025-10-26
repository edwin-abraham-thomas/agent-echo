const { SlashCommandBuilder } = require('discord.js');
const BaseCommand = require('./BaseCommand');

/**
 * Example Command Template
 * Copy this file to create new commands easily
 * 
 * Steps to add a new command:
 * 1. Copy this file and rename it (e.g., MyNewCommand.js)
 * 2. Update the constructor with your command name and description
 * 3. Modify buildCommand() to add any options you need
 * 4. Implement execute() with your command logic
 * 5. Add the new command to CommandManager.js imports
 * 6. Add the class to the commandClasses array in CommandManager
 */
class ExampleCommand extends BaseCommand {
  constructor() {
    // Change these to match your command
    super('example', 'An example command template');
    // Optional: set webhook ID if this command triggers n8n
    this.webhookId = 'your-webhook-id-here';
  }

  buildCommand() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      // Add options as needed:
      .addStringOption(option =>
        option.setName('text')
          .setDescription('Some text input')
          .setRequired(true)
      )
      .addAttachmentOption(option =>
        option.setName('file')
          .setDescription('Optional file upload')
          .setRequired(false)
      );
  }

  async execute(interaction, n8nService) {
    const text = interaction.options.getString('text');
    const file = interaction.options.getAttachment('file');

    try {
      // For immediate response commands:
      await interaction.reply(`You said: ${text}`);

      // OR for fire-and-forget n8n webhook commands:
      // await interaction.reply('🔄 Processing...');
      // 
      // const payload = {
      //   text: text,
      //   fileUrl: file?.url,
      //   discord: this.buildDiscordContext(interaction),
      // };
      // 
      // await this.triggerWebhook(n8nService, this.webhookId, payload);

    } catch (error) {
      console.error(`Error with ${this.name} command:`, error.message);
      await interaction.reply(`❌ Failed to process command: ${error.message}`);
    }
  }
}

module.exports = ExampleCommand;