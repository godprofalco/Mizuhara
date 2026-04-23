module.exports = {
  globalPrompt: "You are a helpful AI assistant.",

  guildPrompts: new Map(),      // server prompts
  activeChannels: new Map(),    // active AI channels per server
};
