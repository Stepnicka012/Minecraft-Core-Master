const { Mojang } = require('../../dist/index.js');

(async () => {
    try {
        // 🔹 ES: Cambiar el endpoint si tienes un servidor Yggdrasil personalizado
        // 🔹 EN: Change the endpoint if using a custom Yggdrasil server
        // ChangeAuthApi("https://mi-servidor-personal.com/auth");

        // 🔹 ES: Login de usuario online (con email y contraseña)
        // 🔹 EN: Online login (with email and password)
        const user = await Mojang.login("bobicraft");

        // 🔹 ES: Verificar si ocurrió un error
        // 🔹 EN: Check if there was an error
        if (user.error) {
            console.error("Error de login:", user.message);
            return;
        }

        console.log("Usuario logueado:", user);

        // 🔹 ES: Validar que el token sigue activo
        // 🔹 EN: Validate that the token is still valid
        const isValid = await Mojang.validate(user);
        console.log("Token válido:", isValid);

        // 🔹 ES: Refrescar el token si es necesario
        // 🔹 EN: Refresh the token if needed
        if (!isValid) {
            const refreshed = await Mojang.refresh(user);
            if (refreshed.error) {
                console.error("Error al refrescar token:", refreshed.message);
                return;
            }
            console.log("Token refrescado:", refreshed);
        }

        // 🔹 ES: Simulación de uso del usuario logueado en la app
        // 🔹 EN: Simulate using the logged-in user in your app
        console.log(`Bienvenido ${user.name} (UUID: ${user.uuid})`);

        // 🔹 ES: Cerrar sesión cuando el usuario se desconecta
        // 🔹 EN: Logout when the user disconnects
        const loggedOut = await Mojang.signout(user);
        console.log("Sesión cerrada:", loggedOut);

    } catch (err) {
        console.error("Error inesperado:", err);
    }
})();
