/**
 * Script para gerar chaves VAPID para Web Push Notifications
 * 
 * Execute: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

console.log('🔑 Gerando chaves VAPID...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves VAPID geradas com sucesso!\n');
console.log('📋 Adicione estas variáveis de ambiente na Vercel:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:seu-email@exemplo.com\n');
console.log('📝 Copie a chave pública abaixo e use no frontend:\n');
console.log(vapidKeys.publicKey);

