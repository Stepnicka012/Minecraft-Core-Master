import { Mojang } from '../../dist/index.js'; 
import { MinecraftLaunch } from '../../dist/Components/Launch.js';

// Configuración básica
const User = await Mojang.login("Stepnicka012");
const basicLauncher = new MinecraftLaunch({
    gameRoot: '.minecraft',
    version: '1.7.10-Forge10.13.4.1614-1.7.10',
    user: User,
    java: 'C:/Program Files/Java/jre1.8.0_471/bin/java.exe',
    memory: {
        min: '512M',
        max: '4G'
    },
    // Solo eventos simples
    enableDetailedEvents: false,
    enableTechnicalEvents: false,
    enableGameEvents: false,
    monitorPerformance: false
});

// Eventos Simples
basicLauncher.on('status', (message) => {
    console.log(`${message}`);
});

basicLauncher.on('progress', (type, percentage, currentFile) => {
    console.log(`${type}: ${percentage}% ${currentFile ? `- ${currentFile}` : ''}`);
});

basicLauncher.on('game-start', () => {
    console.log('¡Juego Iniciado!');
});

basicLauncher.on('game-exit', (code, signal) => {
    console.log(`Juego terminado - Código: ${code}, Señal: ${signal}`);
});

basicLauncher.on('error', (error) => {
    console.error('Error:', error.message);
});

// Función para iniciar
async function launchBasic() {
  try {
        console.log('🚀 Iniciando Minecraft en modo básico...');
        await basicLauncher.launch();
        // Opcional: Detener después de 5 minutos
        // setTimeout(() => {
        //     console.log('⏰ Deteniendo Minecraft después de 5 minutos...');
        // basicLauncher.kill();
        // }, 5 * 60 * 100);
    } catch (error) {
        console.error('Error al lanzar:', error);
    }
}

// Ejecutar
launchBasic();