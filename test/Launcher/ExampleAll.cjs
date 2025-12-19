// 10. Ejemplo completo usando varias funciones
const {
    createBasicLauncherProfiles,
    createCustomProfile,
    createAuthenticationEntry,
    addProfile,
    addUser,
    updateSettings
} = require('../../dist/Index.js');

const ruta = '.minecraft';

// Paso 1: Crear archivo básico
createBasicLauncherProfiles(ruta);

// Paso 2: Crear usuario
const usuario = createAuthenticationEntry('MiJugador', false);
addUser(ruta, 'mi_usuario', usuario);

// Paso 3: Crear perfil
const perfil = createCustomProfile('Minecraft Mods', {
    version: '1.19.2',
    javaArgs: '-Xmx6G'
});
addProfile(ruta, 'perfil_mods', perfil);

// Paso 4: Configurar launcher
updateSettings(ruta, {
    locale: 'es-MX',
    showGameLog: true
});

console.log('🎮 Configuración de Minecraft completada!');