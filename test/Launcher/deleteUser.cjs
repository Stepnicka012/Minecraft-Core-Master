const { removeUserFromFile } = require('../../dist/Index.js');

const ruta = '.minecraft';

removeUserFromFile(ruta, 'cuenta_principal');
console.log('🗑️ Usuario eliminado');