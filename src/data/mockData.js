/* Datos de prueba de la app. Mismos datos de la web, más los campos nuevos
   que solo existen en la app: rol (usuario/admin), avatar (foto de perfil),
   baneado (gestión del admin) y verificada (fuentes aprobadas por el admin).

   Los arrays se pueden restaurar/guardar enteros en AsyncStorage para que los
   cambios (cuentas nuevas, fotos, publicaciones...) sobrevivan a un reinicio. */

let nextUserId = 7;
let nextPostId = 4;
let nextCommentId = 4;
let nextMessageId = 4;

const usuarios = [
    { id: 1, nombre: "Maria Lopez", correo: "maria@email.com", password: "123456", rol: "usuario", avatar: null, baneado: false, fecha_registro: "2024-01-15" },
    { id: 2, nombre: "Carlos Garcia", correo: "carlos@email.com", password: "123456", rol: "usuario", avatar: null, baneado: false, fecha_registro: "2024-02-10" },
    { id: 3, nombre: "Ana Martinez", correo: "ana@email.com", password: "123456", rol: "usuario", avatar: null, baneado: false, fecha_registro: "2024-03-05" },
    // Equipo que creó el proyecto: un super admin y dos moderadores
    { id: 4, nombre: "Super Admin", correo: "admin@waterseven.com", password: "admin1234", rol: "super", avatar: null, baneado: false, fecha_registro: "2024-01-01" },
    { id: 5, nombre: "Moderador Uno", correo: "moderador1@waterseven.com", password: "mod12345", rol: "moderador", avatar: null, baneado: false, fecha_registro: "2024-01-02" },
    { id: 6, nombre: "Moderador Dos", correo: "moderador2@waterseven.com", password: "mod12345", rol: "moderador", avatar: null, baneado: false, fecha_registro: "2024-01-03" },
];

const publicaciones = [
    {
        id: 1,
        usuario_id: 1,
        usuario_nombre: "Maria Lopez",
        usuario_avatar: null,
        imagen: null,
        verificada: false,
        estado: "aprobada",
        contenido: "Encontré una nueva fuente de agua potable en la zona norte de la ciudad. El agua es cristalina y parece segura para consumo.",
        tipo: "reporte",
        fecha_publicacion: "2024-06-15 10:30",
        comentarios: [
            { id: 1, usuario_nombre: "Carlos Garcia", contenido: "Excelente noticia, gracias por compartirlo Maria!" }
        ]
    },
    {
        id: 2,
        usuario_id: 2,
        usuario_nombre: "Carlos Garcia",
        usuario_avatar: null,
        imagen: null,
        verificada: false,
        estado: "aprobada",
        contenido: "ALERTA: Se detectó contaminación en el río principal. Eviten consumir agua de esa fuente hasta nuevo aviso.",
        tipo: "alerta",
        fecha_publicacion: "2024-06-14 15:45",
        comentarios: [
            { id: 2, usuario_nombre: "Ana Martinez", contenido: "Gracias por la alerta Carlos, lo difundiré." }
        ]
    },
    {
        id: 3,
        usuario_id: 3,
        usuario_nombre: "Ana Martinez",
        usuario_avatar: null,
        imagen: null,
        verificada: false,
        estado: "aprobada",
        contenido: "Consejo: Para purificar agua en emergencia, hiérvanla durante al menos 1 minuto. A altitudes superiores a 2000m, hiérvanla 3 minutos.",
        tipo: "consejo",
        fecha_publicacion: "2024-06-13 09:00",
        comentarios: []
    }
];

const mensajes = [
    { id: 1, remitente_id: 1, remitente_nombre: "Maria Lopez", sala: "general", contenido: "Hola a todos, ¿cómo están?", fecha: "2024-06-15 08:00" },
    { id: 2, remitente_id: 2, remitente_nombre: "Carlos Garcia", sala: "general", contenido: "Bien, preparando el informe del agua.", fecha: "2024-06-15 08:05" },
    { id: 3, remitente_id: 3, remitente_nombre: "Ana Martinez", sala: "general", contenido: "Yo también bien, revisando las muestras de ayer.", fecha: "2024-06-15 08:10" },
];

export const mockDB = {
    usuarios,
    publicaciones,
    mensajes,
    getNextUserId: () => nextUserId++,
    getNextPostId: () => nextPostId++,
    getNextCommentId: () => nextCommentId++,
    getNextMessageId: () => nextMessageId++,
};

/* Snapshot completo para guardarlo en AsyncStorage */
export function snapshotDatos() {
    return {
        usuarios: mockDB.usuarios,
        publicaciones: mockDB.publicaciones,
        mensajes: mockDB.mensajes,
        nextUserId,
        nextPostId,
        nextCommentId,
        nextMessageId,
    };
}

/* Restaura los datos guardados (o los antiguos sin campos nuevos:
   se les añaden rol/avatar/baneado por si vienen de una versión previa) */
export function restaurarDatos(datos) {
    if (!datos || !Array.isArray(datos.usuarios)) return false;

    mockDB.usuarios.length = 0;
    datos.usuarios.forEach(u => mockDB.usuarios.push({
        rol: 'usuario',
        avatar: null,
        baneado: false,
        ...u,
        // La versión anterior usaba "admin"; ahora es "super"
        rol: u.rol === 'admin' ? 'super' : (u.rol || 'usuario'),
    }));

    mockDB.publicaciones.length = 0;
    (Array.isArray(datos.publicaciones) ? datos.publicaciones : []).forEach(p => {
        mockDB.publicaciones.push({
            usuario_avatar: null,
            imagen: null,
            verificada: false,
            estado: 'aprobada',
            ...p,
        });
    });

    mockDB.mensajes.length = 0;
    (Array.isArray(datos.mensajes) ? datos.mensajes : []).forEach(m => mockDB.mensajes.push({
        sala: 'general',
        ...m,
    }));

    nextUserId = datos.nextUserId || (mockDB.usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1);
    nextPostId = datos.nextPostId || (mockDB.publicaciones.reduce((max, p) => Math.max(max, p.id), 0) + 1);
    nextCommentId = datos.nextCommentId || 4;
    nextMessageId = datos.nextMessageId || (mockDB.mensajes.reduce((max, m) => Math.max(max, m.id), 0) + 1);

    return true;
}
