const { createCustomProfile, addProfile } = require('../../dist/Index.js');

// 2. Crear y añadir perfil
const ruta = '.minecraft';

// Crear perfil para Forge
const perfilForge = createCustomProfile('Forge 1.20.1', {
    version: '1.20.1',
    javaArgs: '-Xmx4G -Xms2G',
});

addProfile(ruta, 'forge_1201', perfilForge);
console.log('✅ Perfil Forge añadido');