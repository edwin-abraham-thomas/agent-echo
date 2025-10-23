require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://n8n:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Define slash commands
const commands = [
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
].map(command => command.toJSON());

// Bot ready event
client.on('ready', async () => {
  console.log(`✅ Discord bot is online as ${client.user.tag}`);
  console.log(`🔗 Connected to n8n at: ${N8N_BASE_URL}`);

  // Register slash commands
  try {
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    
    console.log('🔄 Registering slash commands...');
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
});

// Message handling (legacy prefix commands)
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Ignore messages without prefix
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      case 'ping':
        await message.reply('🏓 Pong!');
        break;

      case 'trigger':
        await handleN8nTrigger(message, args);
        break;

      case 'help':
        await showHelp(message);
        break;

      default:
        await message.reply('Unknown command. Use `!help` for available commands.');
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await message.reply('❌ An error occurred while processing your command.');
  }
});

// Slash command handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'ping':
        await interaction.reply('🏓 Pong!');
        break;

      case 'trigger':
        await handleSlashN8nTrigger(interaction);
        break;

      case 'help':
        await showSlashHelp(interaction);
        break;

      default:
        await interaction.reply('Unknown command.');
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    const errorMsg = '❌ An error occurred while processing your command.';
    if (interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply(errorMsg);
    }
  }
});

/**
 * Handle n8n workflow trigger from slash command
 */
async function handleSlashN8nTrigger(interaction) {
  const webhookPath = interaction.options.getString('webhook');
  const dataStr = interaction.options.getString('data');

  let payload = {};

  // Try to parse JSON if provided
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

    // Add message context to payload
    payload.discord = {
      author: interaction.user.username,
      userId: interaction.user.id,
      guildId: interaction.guildId,
      commandName: 'trigger',
    };

    const url = `${N8N_BASE_URL}/webhook/${webhookPath}`;
    const response = await axios.post(url, payload, {
      headers: N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {},
      timeout: 10000,
    });

    const result = response.data;
    const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    // Truncate if too long
    if (resultText.length > 2000) {
      await interaction.editReply(
        `✅ Webhook triggered successfully!\n\`\`\`\n${resultText.substring(0, 1997)}...\n\`\`\``
      );
    } else {
      await interaction.editReply(
        `✅ Webhook triggered successfully!\n\`\`\`json\n${resultText}\n\`\`\``
      );
    }
  } catch (error) {
    console.error('Error triggering n8n webhook:', error.message);
    const errorMsg = error.response?.data?.message || error.message;
    await interaction.editReply(`❌ Failed to trigger webhook: ${errorMsg}`);
  }
}

/**
 * Handle n8n workflow trigger from prefix command
 */
async function handleN8nTrigger(message, args) {
  if (args.length === 0) {
    await message.reply('❌ Usage: `!trigger <webhook-path> [json-data]`');
    return;
  }

  const webhookPath = args[0];
  let payload = {};

  // Try to parse JSON if provided
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
    // Add message context to payload
    payload.discord = {
      author: message.author.username,
      userId: message.author.id,
      channelId: message.channelId,
      guildId: message.guildId,
      message: message.content,
    };

    const url = `${N8N_BASE_URL}/webhook/${webhookPath}`;
    const response = await axios.post(url, payload, {
      headers: N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {},
      timeout: 10000,
    });

    const result = response.data;
    const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    // Truncate if too long
    if (resultText.length > 2000) {
      await message.reply(
        `✅ Webhook triggered successfully!\n\`\`\`\n${resultText.substring(0, 1997)}...\n\`\`\``
      );
    } else {
      await message.reply(
        `✅ Webhook triggered successfully!\n\`\`\`json\n${resultText}\n\`\`\``
      );
    }
  } catch (error) {
    console.error('Error triggering n8n webhook:', error.message);
    const errorMsg = error.response?.data?.message || error.message;
    await message.reply(`❌ Failed to trigger webhook: ${errorMsg}`);
  }
}

/**
 * Show help message for slash commands
 */
async function showSlashHelp(interaction) {
  const helpText = `
📚 **Discord Bot - n8n Integration**

**Available Slash Commands:**
\`/ping\` - Check if bot is alive
\`/trigger\` - Trigger n8n webhook
  - \`webhook\` (required): Webhook path (e.g., my-workflow)
  - \`data\` (optional): JSON data to send

\`/help\` - Show this message

**Legacy Prefix Commands (still supported):**
\`!ping\` - Check if bot is alive
\`!trigger <webhook-path> [json-data]\` - Trigger n8n webhook
\`!help\` - Show help

**Examples:**
\`/trigger webhook:my-workflow\`
\`/trigger webhook:my-workflow data:{"key": "value"}\`

**Bot Features:**
• Slash commands (recommended)
• Prefix commands (legacy support)
• Direct integration with n8n workflows
• Support for custom JSON payloads
• Discord user context passed to n8n
  `;
  await interaction.reply(helpText);
}

/**
 * Show help message
 */
async function showHelp(message) {
  const helpText = `
📚 **Discord Bot - n8n Integration**

**Available Commands:**
\`!ping\` - Check if bot is alive
\`!trigger <webhook-path> [json-data]\` - Trigger n8n webhook
\`!help\` - Show this message

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
 * Error handling
 */
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(DISCORD_TOKEN);
