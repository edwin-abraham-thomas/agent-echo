/**
 * Discord Context Builder
 * Responsible for building Discord context objects
 */
class DiscordContextBuilder {
  /**
   * Build context from message
   * @param {Message} message - Discord message
   * @returns {object} - Context object
   */
  static fromMessage(message) {
    return {
      author: message.author.username,
      userId: message.author.id,
      channelId: message.channelId,
      guildId: message.guildId,
      message: message.content,
    };
  }

  /**
   * Build context from interaction
   * @param {Interaction} interaction - Discord interaction
   * @returns {object} - Context object
   */
  static fromInteraction(interaction) {
    return {
      author: interaction.user.username,
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      commandName: interaction.commandName,
    };
  }

  /**
   * Merge custom payload with context
   * @param {object} payload - Custom payload
   * @param {object} context - Context object
   * @returns {object} - Merged payload
   */
  static mergeWithContext(payload, context) {
    return {
      ...payload,
      discord: context,
    };
  }
}

module.exports = DiscordContextBuilder;
