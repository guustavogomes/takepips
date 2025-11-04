const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

// Usar múltiplos tamanhos para melhor qualidade
const inputPngs = [
  path.join(__dirname, '..', 'public', 'icon-96.png'),
  path.join(__dirname, '..', 'public', 'icon-72.png'),
];

const outputIco = path.join(__dirname, '..', 'public', 'favicon.ico');

console.log('🎨 Gerando favicon.ico...\n');

// Ler os arquivos PNG
const files = inputPngs.map(file => fs.readFileSync(file));

toIco(files)
  .then(buf => {
    fs.writeFileSync(outputIco, buf);
    console.log('✅ favicon.ico gerado com sucesso!');
    console.log('📁 Arquivo salvo em: public/favicon.ico');
    console.log('📏 Tamanhos incluídos: 72x72, 96x96');
  })
  .catch(err => {
    console.error('❌ Erro ao gerar favicon.ico:', err);
    process.exit(1);
  });
