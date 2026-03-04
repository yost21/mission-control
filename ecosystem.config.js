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
  ],
};
