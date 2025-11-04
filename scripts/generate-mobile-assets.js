const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSVG = path.join(__dirname, '..', 'public', 'icon.svg');
const outputDir = path.join(__dirname, '..', 'mobile', 'assets');

console.log('📱 Gerando assets para o TakePips Mobile (React Native/Expo)...\n');

// Verificar se o SVG existe
if (!fs.existsSync(inputSVG)) {
  console.error('❌ Erro: icon.svg não encontrado em public/');
  process.exit(1);
}

// Criar diretório de assets se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Diretório mobile/assets criado');
}

async function generateMobileAssets() {
  const assets = [
    { name: 'icon.png', size: 1024, description: 'Ícone principal (iOS/Android)' },
    { name: 'adaptive-icon.png', size: 1024, description: 'Ícone adaptativo (Android)' },
    { name: 'favicon.png', size: 48, description: 'Favicon (Web)' },
  ];

  // Gerar ícones
  for (const asset of assets) {
    const outputPath = path.join(outputDir, asset.name);
    
    try {
      await sharp(inputSVG)
        .resize(asset.size, asset.size, {
          fit: 'contain',
          background: { r: 10, g: 14, b: 26, alpha: 1 } // #0a0e1a
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toFile(outputPath);
      
      console.log(`✅ ${asset.name.padEnd(25)} ${asset.size}×${asset.size}px - ${asset.description}`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${asset.name}:`, error.message);
    }
  }

  // Gerar splash screen (tamanho especial)
  const splashPath = path.join(outputDir, 'splash.png');
  try {
    // Criar splash com o logo centralizado em um background escuro
    const splashWidth = 1284;
    const splashHeight = 2778; // iPhone 14 Pro Max
    const logoSize = 400;

    // Criar background escuro
    const background = await sharp({
      create: {
        width: splashWidth,
        height: splashHeight,
        channels: 4,
        background: { r: 10, g: 14, b: 39, alpha: 1 } // #0A0E27
      }
    }).png().toBuffer();

    // Redimensionar logo
    const logo = await sharp(inputSVG)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Compor splash com logo centralizado
    await sharp(background)
      .composite([{
        input: logo,
        top: Math.floor((splashHeight - logoSize) / 2),
        left: Math.floor((splashWidth - logoSize) / 2)
      }])
      .png({
        quality: 100
      })
      .toFile(splashPath);

    console.log(`✅ splash.png                  ${splashWidth}×${splashHeight}px - Tela de abertura`);
  } catch (error) {
    console.error('❌ Erro ao gerar splash.png:', error.message);
  }

  console.log('\n🎉 Todos os assets do mobile foram gerados!');
  console.log('\n📁 Arquivos criados em: mobile/assets/');
  console.log('📱 Pronto para usar com Expo/React Native!');
}

generateMobileAssets().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
