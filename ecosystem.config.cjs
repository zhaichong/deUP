module.exports = {
  apps: [
    {
      name: 'deup-endoscopy-backend',
      script: 'npx',
      args: 'tsx server/index.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
