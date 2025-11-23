const { Microsoft } = require('../../dist/index');

(async () => {
    try {
        // 🔹 ES: Crear instancia del autenticador Microsoft
        // 🔹 EN: Create an instance of Microsoft authenticator
        const msAuth = new Microsoft();

        // 🔹 ES: Iniciar login. Dependiendo del entorno, mostrará la UI correcta
        // 🔹 EN: Start login. Will show the correct UI depending on environment
        const user = await msAuth.getAuth(); // Puedes pasar 'electron'|'nwjs'|'terminal' si quieres forzar tipo

        if (!user) {
            console.log("Login cancelado por el usuario / Login cancelled by user");
            return;
        }

        // 🔹 ES: Comprobar si hubo error durante el login
        // 🔹 EN: Check if there was an error during login
        if ('error' in user) {
            console.error("Error de autenticación:", user.error, user.errorType);
            return;
        }

        console.log("Usuario autenticado correctamente:", user.name);

        // 🔹 ES: Acceder al perfil del usuario (skins y capas)
        // 🔹 EN: Access user profile (skins and capes)
        console.log("Perfil de Minecraft:", user.profile);

        // 🔹 ES: Refrescar token si es necesario
        // 🔹 EN: Refresh token if necessary
        const refreshedUser = await msAuth.refresh(user);

        if ('error' in refreshedUser) {
            console.error("Error al refrescar token:", refreshedUser.error, refreshedUser.errorType);
        } else {
            console.log("Token actualizado o perfil actualizado:", refreshedUser.name);
        }

        // 🔹 ES: Usar los datos del usuario en tu app
        // 🔹 EN: Use user data in your app
        console.log(`Bienvenido ${user.name} (XUID: ${user.xboxAccount.xuid})`);

        // 🔹 ES: Ejemplo de cómo mostrar skins en base64
        // 🔹 EN: Example of showing skins in base64
        if (user.profile.skins.length) {
            console.log("Primera skin en base64:", user.profile.skins[0].base64);
        }

    } catch (err) {
        console.error("Error inesperado:", err);
    }
})();
