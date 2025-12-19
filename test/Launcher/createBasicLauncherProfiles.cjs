const { createBasicLauncherProfiles } = require('../../dist/Index.js');

// 1. Crear archivo básico
const rutaMinecraft = '.minecraft'; // En la carpeta actual
createBasicLauncherProfiles(rutaMinecraft);
console.log('✅ Archivo launcher_profiles.json creado');