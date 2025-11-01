/**
 * Script para gerar todos os ícones PNG a partir do SVG
 * 
 * Usa a biblioteca 'sharp' (instalada via npm)
 * 
 * Execute: npm install (primeira vez)
 * Depois: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
    { size: 512, name: 'icon-512.png', required: true },
    { size: 384, name: 'icon-384.png', required: false },
    { size: 192, name: 'icon-192.png', required: true },
    { size: 152, name: 'icon-152.png', required: false },
    { size: 144, name: 'icon-144.png', required: false },
    { size: 128, name: 'icon-128.png', required: false },
    { size: 96, name: 'icon-96.png', required: false },
    { size: 72, name: 'icon-72.png', required: false },
];

const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
const publicDir = path.join(__dirname, '..', 'public');

console.log('🎨 Gerando ícones do PWA...\n');

// Verificar se o SVG existe
if (!fs.existsSync(svgPath)) {
    console.error('❌ Arquivo icon.svg não encontrado em public/');
    console.log('💡 Certifique-se de que o arquivo existe antes de executar este script');
    process.exit(1);
}

// Verificar se sharp está instalado
try {
    require.resolve('sharp');
} catch (e) {
    console.error('❌ Biblioteca "sharp" não está instalada');
    console.log('\n💡 Execute primeiro: npm install');
    console.log('   Isso instalará a biblioteca necessária para converter SVG para PNG');
    process.exit(1);
}

async function generateIcons() {
    let successCount = 0;
    let errorCount = 0;

    for (const { size, name, required } of sizes) {
        const outputPath = path.join(publicDir, name);
        
        try {
            await sharp(svgPath)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toFile(outputPath);
            
            const mark = required ? '⭐' : '✅';
            console.log(`${mark} ${name} (${size}x${size}px) gerado com sucesso!`);
            successCount++;
        } catch (error) {
            console.error(`❌ Erro ao gerar ${name}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n📊 Resumo:');
    console.log(`✅ ${successCount} ícones gerados`);
    if (errorCount > 0) {
        console.log(`❌ ${errorCount} erros`);
    }

    if (successCount === sizes.length) {
        console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
        console.log('📁 Arquivos estão em: public/');
        console.log('\n✨ Pronto para usar no PWA!');
    } else if (successCount > 0) {
        console.log('\n⚠️ Alguns ícones não foram gerados. Verifique os erros acima.');
    }
}

// Executar
generateIcons().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

