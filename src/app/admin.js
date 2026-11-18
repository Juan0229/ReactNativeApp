import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Redirect } from 'expo-router';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { colores } from '../theme/tema';
import { api, esStaff, esSuper, nombreRol } from '../services/api';
import { estilos } from '../ui/estilos';

const PESTANAS = [
    { id: 'pendientes', texto: 'Pendientes' },
    { id: 'resumen', texto: 'Resumen' },
    { id: 'usuarios', texto: 'Usuarios' },
    { id: 'publicaciones', texto: 'Publicaciones' },
    { id: 'fuentes', texto: 'Fuentes' }
];

/* Panel de administrador: solo accesible con rol "admin".
   Resumen con estadísticas y gestión de usuarios, publicaciones y fuentes
   (los reportes de nuevas fuentes que se aprueban). */
export default function Admin() {
    const { usuario, cargando } = useAuth();

    const [pestana, setPestana] = useState('pendientes');
    const [usuarios, setUsuarios] = useState([]);
    const [publicaciones, setPublicaciones] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [stats, setStats] = useState(null);
    const [aviso, setAviso] = useState('');

    const recargar = useCallback(async () => {
        try {
            const [listaUsuarios, listaPublicaciones, datos] = await Promise.all([
                api.listarUsuarios(),
                api.obtenerPublicacionesAdmin(),
                api.estadisticas()
            ]);
            setUsuarios(listaUsuarios);
            setPublicaciones(listaPublicaciones.filter(p => p.estado !== 'pendiente'));
            setPendientes(listaPublicaciones.filter(p => p.estado === 'pendiente'));
            setStats(datos);
        } catch (e) {
            console.error('Error al cargar el panel:', e);
        }
    }, []);

    useEffect(() => {
        if (esStaff(usuario)) recargar();
    }, [usuario, recargar]);

    if (cargando) return <View style={estilos.pagina}><Navbar /></View>;
    if (!usuario) return <Redirect href="/login" />;
    if (!esStaff(usuario)) return <Redirect href="/" />;

    const esSuperAdmin = esSuper(usuario);

    /* La pestaña de usuarios es exclusiva del super admin */
    const pestanas = PESTANAS.filter(p => esSuperAdmin || p.id !== 'usuarios');

    const fuentes = publicaciones.filter(p => p.tipo === 'reporte');

    const confirmar = (titulo, mensaje, alConfirmar) => {
        Alert.alert(titulo, mensaje, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: alConfirmar }
        ]);
    };

    /* ---------- Acciones ---------- */
    const handleBaneo = async (u) => {
        const res = await api.alternarBaneo(u.id, usuario.id);
        setAviso(res.error || (res.usuario?.baneado
            ? `${u.nombre} quedó suspendido`
            : `${u.nombre} reactivado`));
        await recargar();
    };

    const handleEliminarUsuario = (u) => {
        confirmar(
            'Eliminar usuario',
            `Se eliminará la cuenta de ${u.nombre} junto con todas sus publicaciones. No se puede deshacer.`,
            async () => {
                const res = await api.eliminarUsuario(u.id, usuario.id);
                setAviso(res.error || `Usuario ${u.nombre} eliminado`);
                await recargar();
            }
        );
    };

    const handleEliminarPublicacion = (p) => {
        confirmar(
            'Eliminar publicación',
            `Publicación de ${p.usuario_nombre}: «${p.contenido.slice(0, 60)}…»`,
            async () => {
                const res = await api.eliminarPublicacion(p.id);
                setAviso(res.error || 'Publicación eliminada');
                await recargar();
            }
        );
    };

    const handleAprobarFuente = async (p) => {
        const res = await api.aprobarFuente(p.id);
        setAviso(res.error || (res.publicacion?.verificada
            ? 'Fuente aprobada y marcada como verificada'
            : 'Se quitó la verificación de la fuente'));
        await recargar();
    };

    /* ---------- Revisión de publicaciones pendientes ---------- */
    const handleAprobar = async (p) => {
        const res = await api.aprobarPublicacion(p.id);
        setAviso(res.error || `Publicación de ${p.usuario_nombre} aprobada: ya aparece en la comunidad`);
        await recargar();
    };

    const handleRechazar = (p) => {
        confirmar(
            'Rechazar publicación',
            `No aparecerá nunca en la comunidad. Publicación de ${p.usuario_nombre}: «${p.contenido.slice(0, 60)}${p.contenido.length > 60 ? '…' : ''}»`,
            async () => {
                const res = await api.eliminarPublicacion(p.id);
                setAviso(res.error || 'Publicación rechazada');
                await recargar();
            }
        );
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <ScrollView contentContainerStyle={estilos.contenidoPagina}>
                <Text style={estilos.tituloPagina}>Panel de administración</Text>
                <Text style={estilos.subtituloPagina}>
                    Conectado como {nombreRol(usuario)} · gestión de usuarios,
                    publicaciones y fuentes de Water Seven
                </Text>

                {/* ---------- Pestañas ---------- */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={propio.pestanas}>
                    {pestanas.map(p => {
                        const activo = pestana === p.id;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={[propio.pestana, activo && propio.pestanaActiva]}
                                onPress={() => { setPestana(p.id); setAviso(''); }}
                            >
                                <Text style={[propio.pestanaTexto, activo && propio.pestanaTextoActiva]}>
                                    {p.id === 'pendientes' && pendientes.length > 0
                                        ? `Pendientes (${pendientes.length})`
                                        : p.texto}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}

                {/* ---------- Pendientes: revisión antes de aprobar ---------- */}
                {pestana === 'pendientes' ? (
                    <View style={propio.lista}>
                        <Text style={propio.nota}>
                            Revisa cada publicación antes de que aparezca en la comunidad: mira el
                            texto y la foto, y aprueba solo lo que sea verdadero.
                        </Text>

                        {pendientes.length === 0 ? (
                            <Text style={estilos.emptyStateTexto}>
                                No hay nada pendiente de revisión. Todo al día ✅
                            </Text>
                        ) : pendientes.map(p => (
                            <View key={p.id} style={propio.tarjetaPendiente}>
                                <View style={propio.filaPendienteTop}>
                                    <Avatar uri={p.usuario_avatar} nombre={p.usuario_nombre} tamano={36} />
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={propio.filaTitulo} numberOfLines={1}>
                                            {p.usuario_nombre}
                                        </Text>
                                        <Text style={propio.pendienteFecha}>{p.fecha_publicacion}</Text>
                                    </View>
                                    <View style={[propio.badge, p.tipo === 'alerta' && propio.badgeRojo]}>
                                        <Text style={propio.badgeTexto}>
                                            {p.tipo === 'alerta' ? 'Alerta' : p.tipo === 'reporte' ? 'Nueva fuente' : p.tipo === 'consejo' ? 'Consejo' : 'General'}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={propio.pendienteTexto}>{p.contenido}</Text>

                                {p.imagen ? (
                                    <Image source={{ uri: p.imagen }} style={propio.pendienteImagen} resizeMode="cover" />
                                ) : (
                                    <Text style={propio.sinFoto}>Sin foto adjunta</Text>
                                )}

                                <View style={propio.pendienteAcciones}>
                                    <Boton style={propio.botonAprobar} onPress={() => handleAprobar(p)}>
                                        ✓ Aprobar
                                    </Boton>
                                    <Boton variante="plano" style={propio.botonRechazar} onPress={() => handleRechazar(p)}>
                                        ✗ Rechazar
                                    </Boton>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ---------- Resumen ---------- */}
                {pestana === 'resumen' && stats ? (
                    <View style={propio.grid}>
                        <Stat valor={stats.pendientes} etiqueta="Por revisar" destacado />
                        <Stat valor={stats.usuarios} etiqueta="Usuarios" />
                        <Stat valor={stats.administradores} etiqueta="Equipo" />
                        <Stat valor={stats.suspendidos} etiqueta="Suspendidos" />
                        <Stat valor={stats.publicaciones} etiqueta="Publicadas" />
                        <Stat valor={stats.fuentes} etiqueta="Fuentes reportadas" />
                        <Stat valor={stats.fuentesVerificadas} etiqueta="Verificadas" />
                        <Stat valor={stats.alertas} etiqueta="Alertas" />
                        <Stat valor={stats.mensajes} etiqueta="Mensajes" />
                    </View>
                ) : null}

                {/* ---------- Usuarios ---------- */}
                {pestana === 'usuarios' ? (
                    <View style={propio.lista}>
                        {usuarios.length === 0 ? (
                            <Text style={estilos.emptyStateTexto}>No hay usuarios</Text>
                        ) : usuarios.map(u => (
                            <View key={u.id} style={propio.fila}>
                                <Avatar uri={u.avatar} nombre={u.nombre} tamano={44} />

                                <View style={propio.filaDatos}>
                                    <View style={propio.filaNombre}>
                                        <Text style={propio.filaTitulo} numberOfLines={1}>{u.nombre}</Text>
                                        {esSuper(u) ? (
                                            <View style={[propio.badge, propio.badgeAdmin]}>
                                                <Text style={propio.badgeTexto}>Super</Text>
                                            </View>
                                        ) : null}
                                        {u.rol === 'moderador' ? (
                                            <View style={[propio.badge, propio.badgeMod]}>
                                                <Text style={propio.badgeTextoMod}>Mod</Text>
                                            </View>
                                        ) : null}
                                        {u.baneado ? (
                                            <View style={[propio.badge, propio.badgeRojo]}>
                                                <Text style={propio.badgeTexto}>Suspendido</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Text style={propio.filaSub} numberOfLines={1}>{u.correo}</Text>

                                    {/* Gestionar usuarios: solo el super admin */}
                                    <View style={propio.filaAcciones}>
                                        {esSuperAdmin && !esSuper(u) ? (
                                            <Boton
                                                variante="contorno"
                                                style={propio.botonMini}
                                                onPress={() => handleBaneo(u)}
                                            >
                                                {u.baneado ? 'Reactivar' : 'Suspender'}
                                            </Boton>
                                        ) : null}
                                        {esSuperAdmin && !esSuper(u) ? (
                                            <Boton
                                                variante="plano"
                                                style={propio.botonMiniPeligro}
                                                onPress={() => handleEliminarUsuario(u)}
                                            >
                                                Eliminar
                                            </Boton>
                                        ) : null}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ---------- Publicaciones ---------- */}
                {pestana === 'publicaciones' ? (
                    <View style={propio.lista}>
                        {publicaciones.length === 0 ? (
                            <Text style={estilos.emptyStateTexto}>No hay publicaciones</Text>
                        ) : publicaciones.map(p => (
                            <View key={p.id} style={propio.fila}>
                                <View style={[propio.punto, p.tipo === 'alerta' && propio.puntoRojo]}>
                                    <Text style={propio.puntoTexto}>
                                        {p.tipo === 'alerta' ? '!' : p.tipo === 'reporte' ? '*' : p.tipo === 'consejo' ? '~' : '#'}
                                    </Text>
                                </View>

                                <View style={propio.filaDatos}>
                                    <View style={propio.filaNombre}>
                                        <Text style={propio.filaTitulo} numberOfLines={1}>
                                            {p.usuario_nombre}
                                        </Text>
                                        <View style={[propio.badge, p.tipo === 'alerta' && propio.badgeRojo]}>
                                            <Text style={propio.badgeTexto}>
                                                {p.tipo === 'alerta' ? 'Alerta' : p.tipo === 'reporte' ? 'Fuente' : p.tipo === 'consejo' ? 'Consejo' : 'General'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={propio.filaSub} numberOfLines={2}>{p.contenido}</Text>

                                    <Boton
                                        variante="plano"
                                        style={[propio.botonMiniPeligro, { alignSelf: 'flex-start' }]}
                                        onPress={() => handleEliminarPublicacion(p)}
                                    >
                                        Eliminar publicación
                                    </Boton>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ---------- Fuentes ---------- */}
                {pestana === 'fuentes' ? (
                    <View style={propio.lista}>
                        <Text style={propio.nota}>
                            Son las publicaciones tipo «Nueva fuente». Al aprobarlas quedan
                            marcadas como verificadas para toda la comunidad.
                        </Text>

                        {fuentes.length === 0 ? (
                            <Text style={estilos.emptyStateTexto}>No hay fuentes reportadas</Text>
                        ) : fuentes.map(p => (
                            <View key={p.id} style={propio.fila}>
                                <View style={propio.punto}>
                                    <Text style={propio.puntoTexto}>*</Text>
                                </View>

                                <View style={propio.filaDatos}>
                                    <View style={propio.filaNombre}>
                                        <Text style={propio.filaTitulo} numberOfLines={1}>
                                            {p.usuario_nombre}
                                        </Text>
                                        <View style={[propio.badge, p.verificada ? propio.badgeVerde : propio.badgeGris]}>
                                            <Text style={[propio.badgeTexto, p.verificada && propio.badgeTextoVerde]}>
                                                {p.verificada ? 'Verificada' : 'Pendiente'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={propio.filaSub} numberOfLines={2}>{p.contenido}</Text>

                                    <View style={propio.filaAcciones}>
                                        <Boton
                                            variante="contorno"
                                            style={propio.botonMini}
                                            onPress={() => handleAprobarFuente(p)}
                                        >
                                            {p.verificada ? 'Quitar verificación' : 'Aprobar fuente'}
                                        </Boton>
                                        <Boton
                                            variante="plano"
                                            style={propio.botonMiniPeligro}
                                            onPress={() => handleEliminarPublicacion(p)}
                                        >
                                            Eliminar
                                        </Boton>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

function Stat({ valor, etiqueta, destacado = false }) {
    const resalta = destacado && valor > 0;
    return (
        <View style={[propio.stat, resalta && propio.statDestacado]}>
            <Text style={[propio.statValor, resalta && propio.statValorDestacado]}>
                {valor}
            </Text>
            <Text style={propio.statEtiqueta}>{etiqueta}</Text>
        </View>
    );
}

const propio = StyleSheet.create({
    pestanas: {
        gap: 8,
        paddingVertical: 2,
    },
    pestana: {
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colores.borde,
        backgroundColor: '#fff',
    },
    pestanaActiva: {
        backgroundColor: colores.acento,
        borderColor: colores.acento,
    },
    pestanaTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio,
    },
    pestanaTextoActiva: {
        color: '#fff',
    },

    /* Estadísticas */
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    stat: {
        flexGrow: 1,
        flexBasis: '22%',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
        gap: 3,
        shadowColor: colores.acento,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    statValor: {
        fontSize: 24,
        fontWeight: '800',
        color: colores.acento,
    },
    statDestacado: {
        backgroundColor: '#fff7dd',
        borderWidth: 1,
        borderColor: '#f0dd9a',
    },
    statValorDestacado: {
        color: '#c99a12',
    },
    statEtiqueta: {
        fontSize: 11,
        color: colores.textoSuave,
        textAlign: 'center',
    },

    /* Tarjeta de publicación pendiente de revisión */
    tarjetaPendiente: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        gap: 10,
        borderWidth: 1.5,
        borderColor: '#f0dd9a',
        shadowColor: colores.acento,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    filaPendienteTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pendienteFecha: {
        fontSize: 11,
        color: colores.textoTenue,
    },
    pendienteTexto: {
        fontSize: 14,
        lineHeight: 21,
        color: colores.texto,
    },
    pendienteImagen: {
        width: '100%',
        height: 190,
        borderRadius: 10,
        backgroundColor: colores.suave,
    },
    sinFoto: {
        fontSize: 12,
        color: colores.textoTenue,
        fontStyle: 'italic',
    },
    pendienteAcciones: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 2,
    },
    botonAprobar: {
        flex: 1,
        backgroundColor: '#2ea06e',
        borderColor: '#268a5e',
    },
    botonRechazar: {
        flex: 1,
        borderColor: colores.errorBorde,
    },

    /* Listas */
    lista: {
        gap: 10,
    },
    nota: {
        fontSize: 12,
        color: colores.textoSuave,
        lineHeight: 17,
        marginBottom: 2,
    },
    fila: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        shadowColor: colores.acento,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    filaDatos: {
        flex: 1,
        minWidth: 0,
        gap: 5,
    },
    filaNombre: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        flexWrap: 'wrap',
    },
    filaTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: colores.texto,
        flexShrink: 1,
        maxWidth: '70%',
    },
    filaSub: {
        fontSize: 13,
        color: colores.textoMedio,
        lineHeight: 18,
    },
    filaAcciones: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    botonMini: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    botonMiniPeligro: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },

    badge: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(61, 173, 174, 0.14)',
    },
    badgeAdmin: {
        backgroundColor: 'rgba(94, 196, 197, 0.3)',
    },
    badgeMod: {
        backgroundColor: 'rgba(155, 140, 240, 0.18)',
    },
    badgeTextoMod: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6b5fd6',
    },
    badgeRojo: {
        backgroundColor: 'rgba(226, 119, 119, 0.18)',
    },
    badgeVerde: {
        backgroundColor: 'rgba(46, 160, 110, 0.16)',
    },
    badgeGris: {
        backgroundColor: '#eef2f2',
    },
    badgeTexto: {
        fontSize: 11,
        fontWeight: '700',
        color: colores.acento,
    },
    badgeTextoVerde: {
        color: '#2ea06e',
    },

    punto: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(61, 173, 174, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    puntoRojo: {
        backgroundColor: 'rgba(226, 119, 119, 0.16)',
    },
    puntoTexto: {
        fontSize: 18,
        fontWeight: '800',
        color: colores.acento,
    },
});
