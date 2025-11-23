import crypto from 'crypto';

// ES: URL base del servidor de autenticación (Mojang o Yggdrasil personalizado).
// EN: Base URL of the authentication server (Mojang or custom Yggdrasil).
let api_url = 'https://authserver.mojang.com';

interface MojangUser {
	access_token: string;
	client_token: string;
	uuid: string;
	name: string;
	user_properties: string;
	meta: {
		online: boolean;
		type: string;
	};
	error?: boolean;
	message?: string;
}

interface MojangResponse {
	accessToken?: string;
	clientToken?: string;
	selectedProfile?: { id: string; name: string };
	error?: boolean;
	message?: string;
}

/**
 * ES: Inicia sesión en Mojang o crea una cuenta offline si no se pasa contraseña.
 * EN: Logs into Mojang or creates an offline account if no password is provided.
 *
 * Cómo usar / How to use:
 * const user = await login("email@example.com", "password123");
 * const offline = await login("PlayerName");
 */
async function login(username: string, password?: string): Promise<MojangUser | MojangResponse> {
	const UUID = crypto.randomBytes(16).toString('hex'); // ES/EN: UUID aleatorio para tokens offline.

	// ES: Si no hay contraseña → login offline.
	// EN: If no password → offline login.
	if (!password) {
		return {
			access_token: UUID,
			client_token: UUID,
			uuid: UUID,
			name: username,
			user_properties: '{}',
			meta: { online: false, type: 'Mojang' }
		};
	}

	// ES: Llamada al endpoint oficial de Mojang /authenticate
	// EN: Request to Mojang /authenticate endpoint
	const response = await fetch(`${api_url}/authenticate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			agent: { name: 'Minecraft', version: 1 },
			username,
			password,
			clientToken: UUID,
			requestUser: true
		})
	});

	const message = (await response.json()) as MojangResponse;

	// ES: Si Mojang devolvió un error, lo regresamos tal cual.
	// EN: If Mojang returned an error, return it directly.
	if (message.error) return message;

	// ES: Perfil del jugador seleccionado.
	// EN: Player's selected profile.
	const selectedProfile = message.selectedProfile!;
	return {
		access_token: message.accessToken!,
		client_token: message.clientToken!,
		uuid: selectedProfile.id,
		name: selectedProfile.name,
		user_properties: '{}',
		meta: { online: true, type: 'Mojang' }
	};
}

/**
 * ES: Refresca el token Mojang (renueva la sesión).
 * EN: Refreshes the Mojang token (renews the session).
 *
 * Cómo usar / How to use:
 * const newSession = await refresh(oldUser);
 */
async function refresh(acc: MojangUser): Promise<MojangUser | MojangResponse> {
	const response = await fetch(`${api_url}/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			accessToken: acc.access_token,
			clientToken: acc.client_token,
			requestUser: true
		})
	});

	const message = (await response.json()) as MojangResponse;

	// ES/EN: Error de Mojang.
	if (message.error) return message;

	const selectedProfile = message.selectedProfile!;
	return {
		access_token: message.accessToken!,
		client_token: message.clientToken!,
		uuid: selectedProfile.id,
		name: selectedProfile.name,
		user_properties: '{}',
		meta: { online: true, type: 'Mojang' }
	};
}

/**
 * ES: Valida si el token sigue siendo válido.
 * EN: Validates whether the token is still valid.
 *
 * Cómo usar / How to use:
 * const ok = await validate(user);
 */
async function validate(acc: MojangUser): Promise<boolean> {
	const response = await fetch(`${api_url}/validate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ accessToken: acc.access_token, clientToken: acc.client_token })
	});

	// ES: Si Mojang devuelve 204, el token es válido.
	// EN: If Mojang returns 204, the token is valid.
	return response.status === 204;
}

/**
 * ES: Cierra la sesión e invalida el token Mojang.
 * EN: Logs out and invalidates the Mojang token.
 *
 * Cómo usar / How to use:
 * const loggedOut = await signout(user);
 */
async function signout(acc: MojangUser): Promise<boolean> {
	const response = await fetch(`${api_url}/invalidate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ accessToken: acc.access_token, clientToken: acc.client_token })
	});

	// ES: Mojang devuelve una respuesta vacía si funcionó.
	// EN: Mojang returns an empty response when successful.
	const text = await response.text();
	return text === '';
}

/**
 * ES: Cambia el endpoint de autenticación (para servidores Yggdrasil personalizados).
 * EN: Changes the authentication endpoint (for custom Yggdrasil servers).
 *
 * Cómo usar / How to use:
 * ChangeAuthApi("https://mi-servidor.xyz/auth");
 */
function ChangeAuthApi(url: string) {
	api_url = url;
}

export { login, refresh, validate, signout, ChangeAuthApi };
