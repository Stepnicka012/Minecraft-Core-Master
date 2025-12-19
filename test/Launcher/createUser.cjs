const { createAuthenticationEntry, addUser } = require('../../dist/Index.js');

// 3. Crear y añadir usuario
const ruta = '.minecraft';

// Usuario offline (crack)
const usuario = createAuthenticationEntry('Player123',false);
addUser(ruta, 'cuenta_principal', usuario);
console.log('✅ Usuario offline creado:', usuario.displayName);