module.exports = {
  apps: [
    {
      name: "oasis-backend",
      cwd: "./backend",
      script: "dist/src/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7500,
      },
    },
    {
      name: "oasis-frontend",
      cwd: "./",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7200",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7200,
      },
    },
  ],
};
