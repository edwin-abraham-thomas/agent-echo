require('dotenv').config();
const BotFactory = require('./BotFactory');

/**
 * Main Entry Point
 * Initializes and starts the Discord bot
 */
async function main() {
  // Validate environment variables
  const discordToken = process.env.DISCORD_TOKEN;
  if (!discordToken) {
    throw new Error('❌ DISCORD_TOKEN environment variable is required');
  }

  // Create bot configuration
  const config = {
    discordToken: discordToken,
    n8nBaseUrl: process.env.N8N_BASE_URL || 'http://n8n:5678',
    n8nApiKey: process.env.N8N_API_KEY || '',
  };

  // Create and start bot
  const client = BotFactory.create(config);
  
  try {
    await client.login(config.discordToken);
  } catch (error) {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  }
}

// Start the application
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
