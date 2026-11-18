# Water Seven — App móvil (React Native + Expo)

Aplicación móvil de **Water Seven**, creada con [Expo](https://expo.dev/) (SDK 58) y
React Native. Es la versión móvil del sitio web `Water-Seven-copia-de-respaldo-`,
con las mismas pantallas, colores y funcionalidades.

## Requisitos para probarla

- **Node.js** (ya instalado en el equipo)
- **Expo Go** en el móvil:
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iPhone: buscar "Expo Go" en la App Store
- El móvil y el ordenador deben estar en **la misma red WiFi**

## Cómo ejecutarla

```bash
cd Water-Seven-app
npx expo start
```

Se abre un QR en la terminal:

- **Android**: escanearlo con la app Expo Go (o con la cámara del teléfono)
- **iPhone**: escanearlo con la cámara de la App Store → "Abrir en Expo Go"

Si el QR no conecta (redes de empresa/invitados que bloquean el descubrimiento),
usa `npx expo start --tunnel`.

## Cuentas de prueba (datos de prueba, igual que la web)

| Correo | Contraseña | Rol |
|---|---|---|
| maria@email.com | 123456 | Usuario |
| carlos@email.com | 123456 | Usuario |
| ana@email.com | 123456 | Usuario |
| admin@waterseven.com | admin1234 | **Super admin** (todo el panel) |
| moderador1@waterseven.com | mod12345 | **Moderador** (revisa, no gestiona usuarios) |
| moderador2@waterseven.com | mod12345 | **Moderador** (revisa, no gestiona usuarios) |

### Roles

- **Super admin**: ve todo — Pendientes, Resumen, Usuarios, Publicaciones y Fuentes.
  Puede suspender/eliminar cuentas.
- **Moderador**: revisa y aprueba (Pendientes, Publicaciones, Fuentes) pero **no**
  tiene la pestaña de Usuarios ni puede borrar cuentas.
- **Usuario**: sin panel; publica y chatea.

### Salas de chat (cada una aparte, nada se mezcla)

- **💬 General** — todos los usuarios.
- **🛡 Sala del equipo** — privada; solo la ven super admin y moderadores
  (bloqueada también en la API, no sólo en la interfaz).

> Las categorías (General / Nueva fuente / Alerta / Consejo) son los **filtros
> de publicaciones** de la pantalla Comunidad, no salas de chat.

> **Importante — dónde viven los datos:** esta app no tiene servidor; usuarios,
> publicaciones y mensajes se guardan en el **propio teléfono** (AsyncStorage).
> Para probar el flujo de aprobación hay que hacerlo **en el mismo móvil**
> (publicar como usuario → cerrar sesión → entrar como admin). Cada teléfono
> tiene sus datos independientes.

## Estructura

```
Water-Seven-app/
├── app.json                 # Nombre, permisos de ubicación, plugins
├── assets/imagenes/         # Logo e imágenes copiadas de la web
└── src/
    ├── app/                 # PANTALLAS (Expo Router: un archivo = una ruta)
    │   ├── _layout.js       # Navegador raíz + proveedor de sesión
    │   ├── index.js         # /              Inicio
    │   ├── fuentes.js       # /fuentes       Encontrar agua (mapa)
    │   ├── comunidad.js     # /comunidad     Muro de la comunidad
    │   ├── chat.js          # /chat          Chat de la comunidad
    │   ├── login.js         # /login         Iniciar sesión / recuperar
    │   ├── registro.js      # /registro      Crear cuenta (entra directo)
    │   ├── nueva-password.js # /nueva-password Nueva contraseña
    │   ├── perfil.js        # /perfil        Mi perfil (foto, contraseña, salida)
    │   └── admin.js         # /admin         Panel de administrador (rol admin)
    ├── components/          # Navbar, Avatar, botones, campos...
    ├── context/             # AuthContext (sesión con AsyncStorage)
    ├── services/            # api, emailService, fuentesService, persistencia
    ├── data/                # Datos de prueba (mockData, con roles)
    ├── theme/               # Paleta de colores (la misma que la web)
    └── ui/                  # Estilos compartidos (StyleSheet)
```

## Novedades respecto a la web

- **Roles**: `super` (super admin), `moderador` y `usuario`. El panel se muestra
  a super y moderadores; la pestaña de Usuarios es solo del super admin.
- **`/perfil`**: foto de perfil (galería), datos de la cuenta, cambio directo
  de contraseña, acceso al panel de admin y cierre de sesión.
- **`/admin`**: pestañas de Resumen (estadísticas), Usuarios (suspender /
  eliminar), Publicaciones (eliminar) y Fuentes (aprobar reportes de nuevas
  fuentes → quedan marcadas «Verificada» en la comunidad).
- **Fotos**: en la galería de la comunidad se puede adjuntar una imagen al
  publicar; el avatar del autor también sale en el chat.
- **Persistencia**: las cuentas, fotos y publicaciones se guardan en
  `AsyncStorage` (`services/persistencia.js`) y sobreviven a cerrar la app.
- **Formularios (Formik + Yup)**: el estado de cada formulario vive en un
  solo objeto (`values`), la validación es declarativa con esquemas de Yup
  (`services/validaciones.js`) y `isSubmitting` bloquea los envíos duplicados.
  Formularios con Formik: iniciar sesión / recuperar contraseña, registro,
  nueva contraseña y cambio de contraseña del perfil. Los errores salen
  campo a campo bajo cada input.

## Diferencias con la web

| Web | App móvil |
|---|---|
| react-router-dom | **Expo Router** (archivos en `src/app/`) |
| CSS con media queries | **StyleSheet** de React Native |
| `localStorage` (sesión) | **AsyncStorage** |
| Código de verificación por correo | **No se usa**: el registro entra directo y solo se envía el correo de recuperación |
| `@emailjs/browser` | **API REST de EmailJS** con `fetch` |
| Validación de formularios a mano | **Formik + Yup** (estado, errores y envío) |
| Leaflet + OpenStreetMap | **react-native-maps** + mosaicos OSM |
| `navigator.geolocation` | **expo-location** (pide permiso) |
| Menú hamburguesa con CSS | Menú lateral con `Modal` |

## Notas

- `npx expo-doctor` → 20/20 comprobaciones OK.
- Los mapas, la geolocalización y el deslizador funcionan en **Expo Go** sin
  instalar nada extra (módulos incluidos en Expo Go).
- Para publicarla como APK real en el futuro: `npx eas build -p android`.
