module.exports = {
  apps: [
    {
      name: 'quiz-admin',
      cwd: '/var/www/lostmonktales/quiz-admin/quiz-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3030',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3030',
      },
    },
  ],
}
