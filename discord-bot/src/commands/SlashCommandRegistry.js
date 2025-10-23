const { SlashCommandBuilder } = require('discord.js');

/**
 * Slash Command Registry
 * Responsible for defining and managing slash commands
 */
class SlashCommandRegistry {
  constructor() {
    this.commands = [
      new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if the bot is alive'),
      new SlashCommandBuilder()
        .setName('trigger')
        .setDescription('Trigger an n8n webhook')
        .addStringOption(option =>
          option.setName('webhook')
            .setDescription('Webhook path (e.g., my-workflow)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('data')
            .setDescription('JSON data to send (optional)')
            .setRequired(false)
        ),
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands'),
      new SlashCommandBuilder()
        .setName('analyse-nutrition')
        .setDescription('Analyze nutrition information from a message')
        .addStringOption(option =>
          option.setName('message')
            .setDescription('The message to analyze for nutrition information')
            .setRequired(true)
        ),
    ];
  }

  /**
   * Get all commands in JSON format for registration
   */
  getCommandsJSON() {
    return this.commands.map(command => command.toJSON());
  }

  /**
   * Get command names
   */
  getCommandNames() {
    return this.commands.map(command => command.name);
  }
}

module.exports = SlashCommandRegistry;
