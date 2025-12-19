const { removeProfileFromFile } = require('../../dist/Index.js');

const ruta = '.minecraft';

removeProfileFromFile(ruta, 'perfil_vacio');
console.log('🗑️ Perfil eliminado');