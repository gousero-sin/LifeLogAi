// PM2 Configuration for LifeLog IA
module.exports = {
  apps: [
    {
      name: 'lifelog-ia',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=lifelog-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10
    }
  ]
}
