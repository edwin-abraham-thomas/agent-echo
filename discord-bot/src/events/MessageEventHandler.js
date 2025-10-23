/**
 * Message Event Handler
 * Handles message creation events for prefix commands
 */
class MessageEventHandler {
  constructor(prefixCommandHandler) {
    this.prefixCommandHandler = prefixCommandHandler;
    this.prefix = '!';
  }

  /**
   * Handle message event
   * @param {Message} message - Discord message
   */
  async handle(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore messages without prefix
    if (!message.content.startsWith(this.prefix)) return;

    // Parse command and args
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      await this.executeCommand(message, command, args);
    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply('❌ An error occurred while processing your command.');
    }
  }

  /**
   * Execute command
   * @param {Message} message - Discord message
   * @param {string} command - Command name
   * @param {string[]} args - Command arguments
   */
  async executeCommand(message, command, args) {
    switch (command) {
      case 'ping':
        await this.prefixCommandHandler.handlePing(message);
        break;

      case 'trigger':
        await this.prefixCommandHandler.handleTrigger(message, args);
        break;

      case 'help':
        await this.prefixCommandHandler.handleHelp(message);
        break;

      default:
        await message.reply('Unknown command. Use `!help` for available commands.');
    }
  }
}

module.exports = MessageEventHandler;
