const { createAuthenticationEntry, addUser } = require('../../dist/Index.js');

// 4. Crear usuario premium (online)
const ruta = '.minecraft';

const usuarioPremium = createAuthenticationEntry('correo@real.com', true, 'Steve');
addUser(ruta, 'cuenta_premium', usuarioPremium);
console.log('✅ Usuario premium creado');