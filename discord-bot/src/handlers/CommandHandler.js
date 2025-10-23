/**
 * Command Handler Interface
 * Abstract base class for handling different command types
 */
class CommandHandler {
  /**
   * Handle ping command
   * @abstract
   */
  async handlePing() {
    throw new Error('handlePing must be implemented');
  }

  /**
   * Handle trigger command
   * @abstract
   */
  async handleTrigger() {
    throw new Error('handleTrigger must be implemented');
  }

  /**
   * Handle help command
   * @abstract
   */
  async handleHelp() {
    throw new Error('handleHelp must be implemented');
  }
}

module.exports = CommandHandler;
