import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

type ReleaseType = 'old_alpha' | 'old_beta' | 'release' | 'snapshot';
type ProfileType = 'custom' | 'latest-release' | 'latest-snapshot';
type LauncherVisibility = 'hide launcher and re-open when game closes' | 'close launcher when game starts' | 'keep the launcher open';

export interface Resolution {
    width?: number;
    height?: number;
}

export interface Profile {
    name: string;
    type?: ProfileType;
    created?: string;
    lastUsed?: string;
    icon?: string;
    lastVersionId?: string;
    gameDir?: string;
    javaDir?: string;
    javaArgs?: string;
    logConfig?: string;
    logConfigIsXML?: boolean;
    resolution?: Resolution;
    allowedReleaseTypes?: ReleaseType[];
    launcherVisibilityOnGameClose?: LauncherVisibility;
    // NOTA: Las configuraciones de launcher como mcm ya NO están aquí
    // Se han movido al nivel global
}

export interface UserProfile {
    displayName?: string;
    uuid?: string;
}

export interface AuthenticationEntry {
    accessToken?: string;
    username?: string;
    profiles?: Record<string, UserProfile>;
    displayName?: string;
    userid?: string;
    uuid?: string;
}

export interface LauncherVersion {
    name?: string;
    format?: number;
    profilesFormat?: number;
}

export interface Settings {
    enableSnapshots?: boolean;
    enableAdvanced?: boolean;
    keepLauncherOpen?: boolean;
    showGameLog?: boolean;
    locale?: string;
    showMenu?: boolean;
    enableHistorical?: boolean;
    profileSorting?: 'byName' | 'byLastPlayed';
    crashAssistance?: boolean;
    enableAnalytics?: boolean;
}

// NUEVA INTERFAZ: Configuraciones globales del launcher (como mcm)
export interface LauncherGlobalConfig {
    // Configuraciones del launcher que afectan a todos los perfiles
    thisBaseRootNatives?: boolean;
    javaRoot?: string;
    enableDebug?: boolean;
    enforceSandbox?: boolean;
    enableSpeedMetrics?: boolean;
    launcherName?: string;
    launcherVersion?: string;
    
    // Configuración OPCIONAL para que cada usuario tenga su propia configuración del launcher
    perUserConfig?: boolean; // DESACTIVADO por defecto
    userSpecificConfigs?: Record<string, LauncherGlobalConfig>; // Configuraciones por usuario
}

export interface SelectedUser {
    account?: string;
    profile?: string;
}

export interface LauncherProfiles {
    profiles?: Record<string, Profile>;
    clientToken?: string;
    authenticationDatabase?: Record<string, AuthenticationEntry>;
    launcherVersion?: LauncherVersion;
    settings?: Settings;
    // NUEVO: Configuraciones globales del launcher
    launcherConfig?: LauncherGlobalConfig;
    analyticsToken?: string;
    analyticsFailcount?: number;
    selectedUser?: SelectedUser;
    selectedProfile?: string;
}

function generateMinecraftUUID(): string {
    return randomUUID().replace(/-/g, '');
}

function generateClientToken(): string {
    return randomUUID();
}

function getCurrentISODate(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
}

/**
 * Crea un objeto launcher_profiles.json completamente VACÍO
 * Solo estructura básica con valores mínimos requeridos
 */
export function createEmptyLauncherProfiles(): LauncherProfiles {
    return {
        profiles: {},
        clientToken: generateClientToken(),
        authenticationDatabase: {},
        launcherVersion: {
            name: '2.0.0',
            format: 21
        },
        settings: {},
        launcherConfig: {}, // Inicializado vacío
        analyticsToken: generateMinecraftUUID(),
        analyticsFailcount: 0,
        selectedUser: {},
        selectedProfile: ''
    };
}

/**
 * Crea un perfil VACÍO (solo con nombre)
 */
export function createEmptyProfile(name: string): Profile {
    return {
        name,
        created: getCurrentISODate(),
        lastUsed: getCurrentISODate()
    };
}

/**
 * Crea un perfil CON configuraciones básicas de Minecraft
 * SIN configuraciones específicas del launcher (están en nivel global)
 */
export function createCustomProfile(
    name: string,
    options: {
        version?: string;
        gameDir?: string;
        javaArgs?: string;
        launcherVisibilityOnGameClose?: LauncherVisibility;
    } = {}
): Profile {
    const profile: Profile = {
        name,
        type: 'custom',
        created: getCurrentISODate(),
        lastUsed: getCurrentISODate(),
        lastVersionId: options.version || 'latest-release',
        launcherVisibilityOnGameClose: options.launcherVisibilityOnGameClose || 'hide launcher and re-open when game closes'
    };

    if (options.gameDir) profile.gameDir = options.gameDir;
    if (options.javaArgs) profile.javaArgs = options.javaArgs;

    return profile;
}

/**
 * Crea una entrada de autenticación (puede ser online u offline)
 */
export function createAuthenticationEntry(
    username: string,
    isOnline: boolean = false,
    displayName?: string
): AuthenticationEntry {
    const uuid = randomUUID();
    
    const entry: AuthenticationEntry = {
        displayName: displayName || username,
        userid: username,
        uuid
    };

    if (isOnline) {
        entry.accessToken = generateMinecraftUUID();
        entry.username = username.includes('@') ? username : `${username}@example.com`;
        entry.profiles = {
            [uuid.replace(/-/g, '')]: {
                displayName: displayName || username,
                uuid
            }
        };
    } else {
        entry.accessToken = 'null';
        entry.username = username;
    }

    return entry;
}

/**
 * Lee un archivo launcher_profiles.json existente desde una ruta específica
 */
export function readLauncherProfiles(minecraftRoot: string): LauncherProfiles {
    const filePath = join(minecraftRoot, 'launcher_profiles.json');
    try {
        const content = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        
        // Asegurar que la estructura tiene launcherConfig
        if (!parsed.launcherConfig) {
            parsed.launcherConfig = {};
        }
        
        return parsed;
    } catch {
        // Si no existe, crear uno vacío
        return createEmptyLauncherProfiles();
    }
}

/**
 * GUARDA el launcher_profiles.json en la ruta especificada
 */
export function saveLauncherProfiles(minecraftRoot: string, launcherProfiles: LauncherProfiles): void {
    const filePath = join(minecraftRoot, 'launcher_profiles.json');
    const content = JSON.stringify(launcherProfiles, null, 2);
    mkdirSync(minecraftRoot, { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
}

/**
 * Añade un perfil y lo guarda directamente en el archivo
 */
export function addProfile(
    minecraftRoot: string,
    profileKey: string,
    profile: Profile
): LauncherProfiles {
    // Leer el archivo existente
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    // Añadir el perfil
    if (!launcherProfiles.profiles) {
        launcherProfiles.profiles = {};
    }
    
    launcherProfiles.profiles[profileKey] = profile;
    
    if (!launcherProfiles.selectedProfile) {
        launcherProfiles.selectedProfile = profileKey;
    }
    
    // Guardar los cambios
    saveLauncherProfiles(minecraftRoot, launcherProfiles);
    
    return launcherProfiles;
}

/**
 * Añade un usuario y lo guarda directamente en el archivo
 */
export function addUser(
    minecraftRoot: string,
    userKey: string,
    authEntry: AuthenticationEntry
): LauncherProfiles {
    // Leer el archivo existente
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    // Añadir el usuario
    if (!launcherProfiles.authenticationDatabase) {
        launcherProfiles.authenticationDatabase = {};
    }
    
    launcherProfiles.authenticationDatabase[userKey] = authEntry;
    
    // Si no hay usuario seleccionado, seleccionar este
    if (!launcherProfiles.selectedUser?.account) {
        launcherProfiles.selectedUser = {
            account: userKey,
            profile: authEntry.uuid?.replace(/-/g, '') || ''
        };
    }
    
    // Guardar los cambios
    saveLauncherProfiles(minecraftRoot, launcherProfiles);
    
    return launcherProfiles;
}

/**
 * Actualiza las configuraciones y guarda directamente en el archivo
 */
export function updateSettings(
    minecraftRoot: string,
    newSettings: Settings
): LauncherProfiles {
    // Leer el archivo existente
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    // Actualizar configuraciones
    if (!launcherProfiles.settings) {
        launcherProfiles.settings = {};
    }
    
    launcherProfiles.settings = { ...launcherProfiles.settings, ...newSettings };
    
    // Guardar los cambios
    saveLauncherProfiles(minecraftRoot, launcherProfiles);
    
    return launcherProfiles;
}

/**
 * Actualiza las configuraciones GLOBALES del launcher
 */
export function updateLauncherConfig(
    minecraftRoot: string,
    newConfig: LauncherGlobalConfig
): LauncherProfiles {
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    if (!launcherProfiles.launcherConfig) {
        launcherProfiles.launcherConfig = {};
    }
    
    // Si se activa la configuración por usuario, inicializar las estructuras
    if (newConfig.perUserConfig === true && !launcherProfiles.launcherConfig.userSpecificConfigs) {
        launcherProfiles.launcherConfig.userSpecificConfigs = {};
    }
    
    launcherProfiles.launcherConfig = { 
        ...launcherProfiles.launcherConfig, 
        ...newConfig 
    };
    
    saveLauncherProfiles(minecraftRoot, launcherProfiles);
    return launcherProfiles;
}

/**
 * Actualiza las configuraciones del launcher para un USUARIO ESPECÍFICO
 * Solo funciona si perUserConfig está activado
 */
export function updateLauncherConfigForUser(
    minecraftRoot: string,
    userId: string,
    userConfig: LauncherGlobalConfig
): LauncherProfiles {
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    if (!launcherProfiles.launcherConfig) {
        launcherProfiles.launcherConfig = {};
    }
    
    // Solo permitir si perUserConfig está activado
    if (launcherProfiles.launcherConfig.perUserConfig !== true) {
        throw new Error('La configuración por usuario no está activada. Active perUserConfig primero.');
    }
    
    if (!launcherProfiles.launcherConfig.userSpecificConfigs) {
        launcherProfiles.launcherConfig.userSpecificConfigs = {};
    }
    
    launcherProfiles.launcherConfig.userSpecificConfigs[userId] = {
        ...launcherProfiles.launcherConfig.userSpecificConfigs[userId],
        ...userConfig
    };
    
    saveLauncherProfiles(minecraftRoot, launcherProfiles);
    return launcherProfiles;
}

/**
 * Obtiene la configuración del launcher activa para el usuario actual
 * Si perUserConfig está activado y existe configuración para el usuario, la retorna
 * De lo contrario, retorna la configuración global
 */
export function getActiveLauncherConfig(
    minecraftRoot: string,
    userId?: string
): LauncherGlobalConfig {
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    if (!launcherProfiles.launcherConfig) {
        return {};
    }
    
    // Si no hay configuración por usuario o no se especifica usuario, retornar global
    if (
        launcherProfiles.launcherConfig.perUserConfig !== true ||
        !userId ||
        !launcherProfiles.launcherConfig.userSpecificConfigs ||
        !launcherProfiles.launcherConfig.userSpecificConfigs[userId]
    ) {
        return launcherProfiles.launcherConfig;
    }
    
    // Combinar configuración global con la específica del usuario
    return {
        ...launcherProfiles.launcherConfig,
        ...launcherProfiles.launcherConfig.userSpecificConfigs[userId]
    };
}

/**
 * Crea un archivo básico de launcher_profiles.json en la ruta especificada
 */
export function createBasicLauncherProfiles(minecraftRoot: string): LauncherProfiles {
    const launcher = createEmptyLauncherProfiles();
    
    // Configuraciones recomendadas
    launcher.settings = {
        enableSnapshots: false,
        enableAdvanced: true,
        keepLauncherOpen: false,
        locale: 'es-AR',
        crashAssistance: true
    };
    
    // Configuraciones globales del launcher (como mcm)
    launcher.launcherConfig = {
        thisBaseRootNatives: true,
        enableDebug: false,
        enforceSandbox: true,
        enableSpeedMetrics: false,
        launcherName: 'Minecraft Launcher',
        launcherVersion: '2.0.0',
        perUserConfig: false // DESACTIVADO por defecto
    };
    
    // Guardar el archivo
    saveLauncherProfiles(minecraftRoot, launcher);
    
    return launcher;
}

/**
 * Elimina un perfil del archivo
 */
export function removeProfileFromFile(
    minecraftRoot: string,
    profileKey: string
): LauncherProfiles {
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    if (launcherProfiles.profiles && launcherProfiles.profiles[profileKey]) {
        delete launcherProfiles.profiles[profileKey];
        
        // Si el perfil eliminado era el seleccionado, limpiar la selección
        if (launcherProfiles.selectedProfile === profileKey) {
            launcherProfiles.selectedProfile = '';
        }
        
        saveLauncherProfiles(minecraftRoot, launcherProfiles);
    }
    
    return launcherProfiles;
}

/**
 * Elimina un usuario del archivo
 */
export function removeUserFromFile(
    minecraftRoot: string,
    userKey: string
): LauncherProfiles {
    const launcherProfiles = readLauncherProfiles(minecraftRoot);
    
    if (launcherProfiles.authenticationDatabase && launcherProfiles.authenticationDatabase[userKey]) {
        delete launcherProfiles.authenticationDatabase[userKey];
        
        // Si el usuario eliminado era el seleccionado, limpiar la selección
        if (launcherProfiles.selectedUser?.account === userKey) {
            launcherProfiles.selectedUser = {};
        }
        
        // Si hay configuración por usuario, eliminar también esa configuración
        if (
            launcherProfiles.launcherConfig?.perUserConfig === true &&
            launcherProfiles.launcherConfig.userSpecificConfigs &&
            launcherProfiles.launcherConfig.userSpecificConfigs[userKey]
        ) {
            delete launcherProfiles.launcherConfig.userSpecificConfigs[userKey];
        }
        
        saveLauncherProfiles(minecraftRoot, launcherProfiles);
    }
    
    return launcherProfiles;
}