module.exports = {
  apps: [
    {
      name: "mission-control",
      script: "node_modules/.bin/next",
      args: "start -p 3100",
      cwd: "/home/ubuntu/mission-control",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "discord-agent",
      script: "node_modules/.bin/tsx",
      args: "src/agent/index.ts",
      cwd: "/home/ubuntu/mission-control",
      env: {
        NODE_ENV: "production",
        DISCORD_BOT_TOKEN: "",
        OBSIDIAN_VAULT_PATH: "/home/ubuntu/obsidian-vault",
        BRAIN_DUMP_CHANNEL_NAME: "brain-dump",
        OBSIDIAN_INBOX_DIR: "Brain Dump",
      },
    },
  ],
};
