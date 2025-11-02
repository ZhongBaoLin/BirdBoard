// start-server.js - простий скрипт для гарантованого запуску
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск BirdBoard сервера...');

// Запускаємо сервер
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Помилка запуску сервера:', error);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`❌ Сервер зупинився з кодом: ${code}`);
    console.log('🔄 Перезапуск через 3 секунди...');
    setTimeout(() => {
      console.log('🔄 Перезапуск сервера...');
      require('./server.js');
    }, 3000);
  }
});

// Обробка завершення процесу
process.on('SIGINT', () => {
  console.log('\n🛑 Зупинка сервера...');
  server.kill('SIGINT');
});