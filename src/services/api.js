import { mockDB } from '../data/mockData';
import { cargarDatos, guardarDatos } from './persistencia';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* Una publicación es visible en el feed salvo que esté explícitamente en
   revisión (así los datos antiguos, sin el campo, siguen apareciendo) */
const esVisible = (p) => p.estado !== 'pendiente';

/* Roles del equipo: super admin (todo) y moderador (revisar, no gestionar
   usuarios). "admin" es la forma antigua y se trata como super. */
export const esSuper = (u) => Boolean(u) && (u.rol === 'super' || u.rol === 'admin');
export const esStaff = (u) => Boolean(u) && (u.rol === 'super' || u.rol === 'admin' || u.rol === 'moderador');
export const nombreRol = (u) => {
    if (!u) return 'Usuario';
    if (esSuper(u)) return 'Super admin';
    if (u.rol === 'moderador') return 'Moderador';
    return 'Usuario';
};

/* Los datos se cargan de AsyncStorage una sola vez antes de cualquier
   operación (registro, login, publicar...) para que todo lo que se guarde
   esté ya restaurado. */
const listo = cargarDatos();

const sinPassword = (u) => {
    const { password: _, ...resto } = u;
    return resto;
};

export const api = {

    async login(correo, password) {
        await Promise.all([listo, delay(300)]);
        const usuario = mockDB.usuarios.find(u => u.correo === correo);
        if (!usuario) return { error: "Correo no registrado" };
        if (usuario.password !== password) return { error: "Contraseña incorrecta" };
        if (usuario.baneado) return { error: "Tu cuenta está suspendida. Contacta con el administrador." };
        return { usuario: sinPassword(usuario) };
    },

    async registro(nombre, correo, password) {
        await Promise.all([listo, delay(300)]);
        const existe = mockDB.usuarios.find(u => u.correo === correo);
        if (existe) return { error: "El correo ya está registrado" };
        const id = mockDB.getNextUserId();
        const nuevoUsuario = {
            id,
            nombre,
            correo,
            password,
            rol: 'usuario',
            avatar: null,
            baneado: false,
            fecha_registro: new Date().toISOString().split('T')[0]
        };
        mockDB.usuarios.push(nuevoUsuario);
        await guardarDatos();
        return { mensaje: "Cuenta creada exitosamente" };
    },

    async correoExiste(correo) {
        await Promise.all([listo, delay(200)]);
        return Boolean(mockDB.usuarios.find(u => u.correo === correo));
    },

    async actualizarPassword(correo, password) {
        await Promise.all([listo, delay(300)]);
        const usuario = mockDB.usuarios.find(u => u.correo === correo);
        if (!usuario) return { error: "El correo no está registrado" };
        usuario.password = password;
        await guardarDatos();
        return { mensaje: "Contraseña actualizada correctamente" };
    },

    /* Cambio directo de contraseña desde el perfil (pide la actual) */
    async cambiarPassword(usuarioId, passwordActual, passwordNueva) {
        await Promise.all([listo, delay(300)]);
        const usuario = mockDB.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return { error: "Usuario no encontrado" };
        if (usuario.password !== passwordActual) return { error: "Tu contraseña actual no es correcta" };
        usuario.password = passwordNueva;
        await guardarDatos();
        return { mensaje: "Contraseña actualizada correctamente" };
    },

    async buscarUsuarioPorCorreo(correo) {
        await Promise.all([listo, delay(200)]);
        const usuario = mockDB.usuarios.find(u => u.correo === correo);
        if (!usuario) return null;
        return sinPassword(usuario);
    },

    /* ---------- Perfil: foto de perfil ---------- */

    async actualizarAvatar(usuarioId, uri) {
        await Promise.all([listo, delay(200)]);
        const usuario = mockDB.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return { error: "Usuario no encontrado" };
        usuario.avatar = uri || null;
        await guardarDatos();
        return { usuario: sinPassword(usuario) };
    },

    /* ---------- Comunidad ---------- */

    /* Feed público: solo lo que el administrador ya aprobó */
    async obtenerPublicaciones() {
        await Promise.all([listo, delay(200)]);
        // Se les pega el avatar actual del autor por si lo cambió después
        return [...mockDB.publicaciones]
            .filter(esVisible)
            .reverse()
            .map(p => {
                const autor = mockDB.usuarios.find(u => u.id === p.usuario_id);
                return { ...p, usuario_avatar: autor ? autor.avatar : null };
            });
    },

    /* Lo que el usuario enviaron y sigue esperando revisión del admin */
    async obtenerMisPendientes(usuarioId) {
        await Promise.all([listo, delay(200)]);
        return mockDB.publicaciones
            .filter(p => p.estado === 'pendiente' && p.usuario_id === usuarioId)
            .map(p => {
                const autor = mockDB.usuarios.find(u => u.id === p.usuario_id);
                return { ...p, usuario_avatar: autor ? autor.avatar : null };
            });
    },

    /* Todas (aprobadas + pendientes), para el panel del administrador */
    async obtenerPublicacionesAdmin() {
        await Promise.all([listo, delay(200)]);
        return [...mockDB.publicaciones].reverse().map(p => {
            const autor = mockDB.usuarios.find(u => u.id === p.usuario_id);
            return { ...p, usuario_avatar: autor ? autor.avatar : null };
        });
    },

    /* Todo lo que se publica queda PENDIENTE hasta que el admin lo apruebe */
    async crearPublicacion(usuario_id, contenido, tipo, imagen = null) {
        await Promise.all([listo, delay(200)]);
        const usuario = mockDB.usuarios.find(u => u.id === usuario_id);
        const id = mockDB.getNextPostId();
        const nueva = {
            id,
            usuario_id,
            usuario_nombre: usuario ? usuario.nombre : "Anónimo",
            usuario_avatar: usuario ? usuario.avatar : null,
            imagen,
            verificada: false,
            estado: 'pendiente',
            contenido,
            tipo,
            fecha_publicacion: new Date().toLocaleString('es-ES'),
            comentarios: []
        };
        mockDB.publicaciones.push(nueva);
        await guardarDatos();
        return nueva;
    },

    async aprobarPublicacion(publicacionId) {
        await Promise.all([listo, delay(200)]);
        const publicacion = mockDB.publicaciones.find(p => p.id === publicacionId);
        if (!publicacion) return { error: "Publicación no encontrada" };
        if (publicacion.estado === 'aprobada') return { error: "Ya estaba aprobada" };
        publicacion.estado = 'aprobada';
        await guardarDatos();
        return { publicacion };
    },

    async crearComentario(publicacion_id, usuario_id, contenido) {
        await Promise.all([listo, delay(200)]);
        const publicacion = mockDB.publicaciones.find(p => p.id === publicacion_id);
        if (!publicacion) return { error: "Publicación no encontrada" };
        const usuario = mockDB.usuarios.find(u => u.id === usuario_id);
        const id = mockDB.getNextCommentId();
        const comentario = {
            id,
            usuario_nombre: usuario ? usuario.nombre : "Anónimo",
            contenido
        };
        publicacion.comentarios.push(comentario);
        await guardarDatos();
        return comentario;
    },

    /* ---------- Chat ---------- */

    /* Cada sala es un chat aparte: "general", "comunidad", "alertas" y
       "consejos" son públicas; "staff" es privada del equipo (el filtro de
       permisos está aquí, no sólo en la interfaz). */
    async obtenerMensajes(sala = 'general', usuarioId = null) {
        await Promise.all([listo, delay(200)]);
        // Sala del equipo: sólo el equipo puede leerla
        if (sala === 'staff') {
            const lector = mockDB.usuarios.find(u => u.id === usuarioId);
            if (!esStaff(lector)) return [];
        }
        // Con el avatar de quien lo envió, para mostrarlo en la burbuja
        return [...mockDB.mensajes]
            .filter(m => (m.sala || 'general') === sala)
            .map(m => {
                const autor = mockDB.usuarios.find(u => u.id === m.remitente_id);
                return { ...m, remitente_avatar: autor ? autor.avatar : null };
            });
    },

    async enviarMensaje(remitente_id, contenido, sala = 'general') {
        await Promise.all([listo, delay(200)]);
        const usuario = mockDB.usuarios.find(u => u.id === remitente_id);
        // Sala del equipo: sólo el equipo puede escribir en ella
        if (sala === 'staff' && !esStaff(usuario)) {
            return { error: "No tienes permiso para escribir en la sala del equipo" };
        }
        const id = mockDB.getNextMessageId();
        const mensaje = {
            id,
            remitente_id,
            remitente_nombre: usuario ? usuario.nombre : "Anónimo",
            remitente_avatar: usuario ? usuario.avatar : null,
            sala,
            contenido,
            fecha: new Date().toLocaleString('es-ES')
        };
        mockDB.mensajes.push(mensaje);
        await guardarDatos();
        return mensaje;
    },

    /* ---------- Panel de administrador ---------- */

    async listarUsuarios() {
        await Promise.all([listo, delay(200)]);
        return mockDB.usuarios.map(sinPassword);
    },

    /* Solo el super admin gestiona usuarios (ni los moderadores) */
    async alternarBaneo(usuarioId, adminId) {
        await Promise.all([listo, delay(200)]);
        const actor = mockDB.usuarios.find(u => u.id === adminId);
        if (!esSuper(actor)) return { error: "Solo el super admin puede suspender usuarios" };
        const usuario = mockDB.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return { error: "Usuario no encontrado" };
        if (usuario.id === actor.id) return { error: "No puedes suspenderte a ti mismo" };
        if (esSuper(usuario)) return { error: "No se puede suspender a un super admin" };
        usuario.baneado = !usuario.baneado;
        await guardarDatos();
        return { usuario: sinPassword(usuario) };
    },

    /* Al eliminar un usuario se borran también sus publicaciones */
    async eliminarUsuario(usuarioId, adminId) {
        await Promise.all([listo, delay(200)]);
        const actor = mockDB.usuarios.find(u => u.id === adminId);
        if (!esSuper(actor)) return { error: "Solo el super admin puede eliminar usuarios" };
        const usuario = mockDB.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return { error: "Usuario no encontrado" };
        if (usuario.id === actor.id) return { error: "No puedes eliminarte a ti mismo" };
        if (esSuper(usuario)) return { error: "No se puede eliminar a un super admin" };

        mockDB.usuarios.splice(mockDB.usuarios.indexOf(usuario), 1);
        for (let i = mockDB.publicaciones.length - 1; i >= 0; i--) {
            if (mockDB.publicaciones[i].usuario_id === usuarioId) {
                mockDB.publicaciones.splice(i, 1);
            }
        }
        await guardarDatos();
        return { mensaje: "Usuario eliminado" };
    },

    async eliminarPublicacion(publicacionId) {
        await Promise.all([listo, delay(200)]);
        const publicacion = mockDB.publicaciones.find(p => p.id === publicacionId);
        if (!publicacion) return { error: "Publicación no encontrada" };
        mockDB.publicaciones.splice(mockDB.publicaciones.indexOf(publicacion), 1);
        await guardarDatos();
        return { mensaje: "Publicación eliminada" };
    },

    /* Las "fuentes" del panel son las publicaciones tipo reporte que ya
       fueron aprobadas; el admin además las puede marcar como verificadas */
    async listarFuentes() {
        await Promise.all([listo, delay(200)]);
        return mockDB.publicaciones.filter(p => p.tipo === 'reporte' && esVisible(p));
    },

    async aprobarFuente(publicacionId) {
        await Promise.all([listo, delay(200)]);
        const publicacion = mockDB.publicaciones.find(p => p.id === publicacionId);
        if (!publicacion) return { error: "Publicación no encontrada" };
        publicacion.verificada = !publicacion.verificada;
        await guardarDatos();
        return { publicacion };
    },

    async estadisticas() {
        await Promise.all([listo, delay(200)]);
        return {
            usuarios: mockDB.usuarios.length,
            administradores: mockDB.usuarios.filter(esStaff).length,
            suspendidos: mockDB.usuarios.filter(u => u.baneado).length,
            pendientes: mockDB.publicaciones.filter(p => p.estado === 'pendiente').length,
            publicaciones: mockDB.publicaciones.filter(esVisible).length,
            alertas: mockDB.publicaciones.filter(p => p.tipo === 'alerta' && esVisible(p)).length,
            fuentes: mockDB.publicaciones.filter(p => p.tipo === 'reporte' && esVisible(p)).length,
            fuentesVerificadas: mockDB.publicaciones.filter(p => p.tipo === 'reporte' && esVisible(p) && p.verificada).length,
            mensajes: mockDB.mensajes.length,
        };
    },
};
