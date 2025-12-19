const { createEmptyProfile, addProfile } = require('../../dist/Index.js');

// 7. Crear perfil vacío
const ruta = '.minecraft';

const perfilVacio = createEmptyProfile('Perfil Vacío');
addProfile(ruta, 'perfil_vacio', perfilVacio);
console.log('✅ Perfil vacío creado');