## 🔹 Arguments - Núcleo de la Ejecución de Minecraft

Dentro de **Minecraft-Core-Master**, el módulo **`Arguments`** es **una pieza fundamental y esencial** para cualquier lanzamiento de Minecraft. Su función principal es construir, preparar y gestionar **todos los argumentos necesarios para iniciar el juego correctamente**, incluyendo la configuración de Java, JVM, classpath, librerías, nativos y parámetros específicos de cada versión de Minecraft.

### ¿Por qué `Arguments` es tan crítico?

Minecraft no se ejecuta como un simple `.jar`. Cada versión requiere una combinación precisa de:

* **Clase principal (`main class`)**: Diferente según la versión y loader (vanilla, Forge, Fabric, NeoForge, Quilt…).
* **Classpath completo**: Incluye todas las librerías descargadas y verificadas, tanto externas como internas, que el juego necesita para funcionar.
* **Nativos y recursos**: Archivos específicos de cada sistema operativo y versión (OpenGL, DLLs, librerías nativas).
* **Argumentos JVM**: Configuración de memoria, flags de rendimiento y compatibilidad.
* **Argumentos de juego**: Resolución, usuario, características habilitadas, mods cargados y configuraciones especiales.

Un error en **cualquier parámetro** puede provocar que el juego **no arranque**, se bloquee, tenga errores gráficos, problemas de conexión o incluso fallos de rendimiento.

### Interactuar con `Arguments` es técnico y complicado

* Cada versión de Minecraft maneja estructuras de argumentos distintas. Lo que funciona para 1.12.2 puede romper el juego en 1.21.10 o cualquier versión con un loader modificado.
* La integración de loaders como **Forge, Fabric, NeoForge o Quilt** añade otra capa de complejidad, ya que modifican el classpath, agregan librerías nativas adicionales y cambian la clase principal.
* La sincronización entre **librerías descargadas**, **nativos**, **assets** y **configuraciones de Java** requiere precisión absoluta. Una ruta mal escrita o un argumento faltante puede romper todo el lanzamiento.
* Capturar correctamente los eventos de ejecución (`status`, `progress`, `phase-start`, `game-started`, `stdout`, `stderr`, etc.) es vital para que **Minecraft-Core-Master** pueda informar al usuario sobre cada fase de inicio y detectar problemas automáticamente.

En resumen: **`Arguments` no es solo un generador de strings o un ejecutor de comandos**. Es el **cerebro detrás del lanzamiento del juego**, y su manipulación exige **conocimiento profundo de la estructura interna de Minecraft**, las versiones de Java, loaders, librerías y el sistema operativo del usuario.

> ⚠️ Si quieres modificar o interactuar con `Arguments`, debes tener en cuenta que cualquier cambio puede afectar drásticamente la estabilidad del juego. Por eso **Minecraft-Core-Master** maneja este módulo con cuidado extremo, validando cada argumento, cada archivo y cada librería antes de ejecutar Minecraft.
