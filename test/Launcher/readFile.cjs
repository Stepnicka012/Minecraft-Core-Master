const { readLauncherProfiles } = require('../../dist/Index.js');

// 6. Leer archivo existente
const ruta = '.minecraft';

const datos = readLauncherProfiles(ruta);
console.log('📊 Perfiles:', Object.keys(datos.profiles || {}).length);
console.log('👤 Usuarios:', Object.keys(datos.authenticationDatabase || {}).length);