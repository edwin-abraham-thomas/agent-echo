const { REST, Routes } = require('discord.js');

/**
 * Command Manager
 * Centralized management of all slash commands
 */
class CommandManager {
  constructor(n8nService) {
    this.commands = new Map();
    this.n8nService = n8nService;
    this.initializeCommands();
  }

  /**
   * Initialize all commands
   */
  initializeCommands() {
    // Clear existing commands
    this.commands.clear();
    
    // Import commands (fresh require each time for hot reload)
    const PingCommand = this.requireFresh('./PingCommand');
    const HelpCommand = this.requireFresh('./HelpCommand');
    const TriggerCommand = this.requireFresh('./TriggerCommand');
    const AnalyseNutritionCommand = this.requireFresh('./AnalyseNutritionCommand');
    const ReloadCommand = this.requireFresh('./ReloadCommand');

    const commandClasses = [
      PingCommand,
      HelpCommand,
      TriggerCommand,
      AnalyseNutritionCommand,
      ReloadCommand,
    ];

    commandClasses.forEach(CommandClass => {
      let command;
      if (CommandClass.name === 'ReloadCommand') {
        // ReloadCommand needs special constructor with commandManager reference
        command = new CommandClass(this.n8nService, this);
      } else {
        command = new CommandClass(this.n8nService);
      }
      this.commands.set(command.getDefinition().name, command);
    });

    console.log(`📋 Loaded ${this.commands.size} commands: ${this.getCommandNames().join(', ')}`);
  }

  /**
   * Require a module fresh (for hot reloading)
   * @param {string} modulePath 
   * @returns {any}
   */
  requireFresh(modulePath) {
    const fullPath = require.resolve(modulePath);
    delete require.cache[fullPath];
    return require(modulePath);
  }

  /**
   * Reload all commands
   */
  async reloadCommands() {
    console.log('🔄 Reloading commands...');
    this.initializeCommands();
    console.log('✅ Commands reloaded successfully!');
  }

  /**
   * Get all commands for Discord registration
   * @returns {Array} Array of command definitions
   */
  getCommandDefinitions() {
    return Array.from(this.commands.values()).map(command => 
      command.buildCommand().toJSON()
    );
  }

  /**
   * Execute a command
   * @param {ChatInputCommandInteraction} interaction
   */
  async executeCommand(interaction) {
    const command = this.commands.get(interaction.commandName);
    
    if (!command) {
      await interaction.reply('❌ Unknown command.');
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);
      
      const errorMsg = '❌ An error occurred while processing your command.';
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    }
  }

  /**
   * Register all commands with Discord
   * @param {Client} client
   */
  async registerCommands(client) {
    console.log('🔄 Registering slash commands...');
    
    const rest = new REST({ version: '10' }).setToken(client.token);
    await rest.put(Routes.applicationCommands(client.user.id), { 
      body: this.getCommandDefinitions() 
    });
    
    console.log('✅ Slash commands registered successfully!');
  }

  /**
   * Add a new command (for easy extensibility)
   * @param {BaseCommand} command
   */
  addCommand(command) {
    this.commands.set(command.name, command);
  }

  /**
   * Get command names for debugging
   * @returns {Array<string>}
   */
  getCommandNames() {
    return Array.from(this.commands.keys());
  }
}

module.exports = CommandManager;