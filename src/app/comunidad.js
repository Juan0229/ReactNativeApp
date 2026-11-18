import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { colores } from '../theme/tema';
import { api } from '../services/api';
import { estilos } from '../ui/estilos';

const TIPOS = [
    { id: 'general', texto: 'General' },
    { id: 'reporte', texto: 'Nueva fuente' },
    { id: 'alerta', texto: 'Alerta' },
    { id: 'consejo', texto: 'Consejo' }
];

/* Cada tipo tiene su propia indicación de qué debe escribir el usuario */
const PLACEHOLDERS = {
    general: '¿Qué quieres compartir con la comunidad?',
    reporte: 'Describe la fuente: ¿dónde está? ¿Cómo es el agua? ¿Cómo llegar hasta allí?',
    alerta: '¿Qué pasó? Describe el incidente: lugar, hora y qué se vio...',
    consejo: 'Escribe tu consejo paso a paso para que otros puedan aplicarlo'
};

const FILTROS = [{ id: 'todas', texto: 'Todas' }, ...TIPOS];

export default function Comunidad() {
    const { usuario } = useAuth();
    const [publicaciones, setPublicaciones] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [filtro, setFiltro] = useState('todas');
    const [nuevoPost, setNuevoPost] = useState('');
    const [tipoPost, setTipoPost] = useState('general');
    const [imagenPost, setImagenPost] = useState(null);
    const [cargandoFoto, setCargandoFoto] = useState(false);
    const [comentariosInputs, setComentariosInputs] = useState({});

    const cargarPublicaciones = async () => {
        try {
            const pubs = await api.obtenerPublicaciones();
            setPublicaciones(pubs);
            if (usuario) {
                const mias = await api.obtenerMisPendientes(usuario.id);
                setPendientes(mias);
            } else {
                setPendientes([]);
            }
        } catch (e) {
            console.error('Error al cargar publicaciones:', e);
        }
    };

    useEffect(() => {
        cargarPublicaciones();
    }, [usuario]);

    /* Adjuntar una foto de la galería a la publicación */
    const adjuntarFoto = async () => {
        try {
            const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permiso.granted) {
                Alert.alert(
                    'Permiso necesario',
                    'Activa el permiso de galería en los ajustes del teléfono para adjuntar una foto.'
                );
                return;
            }

            setCargandoFoto(true);
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!resultado.canceled && resultado.assets?.length) {
                setImagenPost(resultado.assets[0].uri);
            }
        } catch {
            Alert.alert('Error', 'No se pudo abrir la galería');
        } finally {
            setCargandoFoto(false);
        }
    };

    const handlePublicar = async () => {
        if (!usuario) {
            Alert.alert('Inicia sesión', 'Debes iniciar sesión para publicar');
            return;
        }
        // El texto siempre es obligatorio: la foto acompaña, no sustituye
        if (nuevoPost.trim() === '') {
            Alert.alert(
                'Falta la descripción',
                `Escribe qué pasó o qué quieres compartir. ${PLACEHOLDERS[tipoPost]}`
            );
            return;
        }

        try {
            await api.crearPublicacion(
                usuario.id,
                nuevoPost.trim(),
                tipoPost,
                imagenPost
            );
            setNuevoPost('');
            setImagenPost(null);
            Alert.alert(
                'Enviado a revisión',
                'Tu publicación será revisada por un administrador antes de aparecer en la comunidad.'
            );
            await cargarPublicaciones();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const handleComentar = async (publicacionId) => {
        if (!usuario) {
            Alert.alert('Inicia sesión', 'Debes iniciar sesión para comentar');
            return;
        }
        const texto = (comentariosInputs[publicacionId] || '').trim();
        if (!texto) return;

        try {
            await api.crearComentario(publicacionId, usuario.id, texto);
            setComentariosInputs(prev => ({ ...prev, [publicacionId]: '' }));
            await cargarPublicaciones();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const getEstadisticas = () => {
        const miembros = new Set();
        let alertas = 0;
        let fuentes = 0;
        publicaciones.forEach(p => {
            if (p.usuario_nombre) miembros.add(p.usuario_nombre);
            if (p.tipo === 'alerta') alertas++;
            if (p.tipo === 'reporte') fuentes++;
        });
        return { miembros: miembros.size, alertas, fuentes };
    };

    const stats = getEstadisticas();

    // Feed según el tipo elegido en el filtro (cada tipo por separado)
    const publicacionesFiltradas = publicaciones.filter(p => filtro === 'todas' || p.tipo === filtro);

    const getEtiqueta = (tipo) => {
        switch (tipo) {
            case 'alerta': return { roja: true, texto: 'Alerta' };
            case 'reporte': return { roja: false, texto: 'Nueva fuente' };
            case 'consejo': return { roja: false, texto: 'Consejo' };
            default: return { roja: false, texto: 'General' };
        }
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <ScrollView contentContainerStyle={estilos.contenidoPagina}>
                <Text style={estilos.tituloPagina}>Comunidad</Text>
                <Text style={estilos.subtituloPagina}>
                    Reportes y alertas de la comunidad para cuidar nuestro recurso más importante
                </Text>

                {/* ---------- Publicar ---------- */}
                <View style={propio.publicar}>
                    <TextInput
                        style={propio.inputPublicar}
                        placeholder={PLACEHOLDERS[tipoPost]}
                        placeholderTextColor={colores.textoTenue}
                        value={nuevoPost}
                        onChangeText={setNuevoPost}
                        onSubmitEditing={handlePublicar}
                        returnKeyType="send"
                        multiline
                    />

                    <View style={propio.filaTipo}>
                        {TIPOS.map(t => {
                            const activo = tipoPost === t.id;
                            return (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[propio.chip, activo && propio.chipActivo]}
                                    onPress={() => setTipoPost(t.id)}
                                >
                                    <Text style={[propio.chipTexto, activo && propio.chipTextoActivo]}>
                                        {t.texto}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Foto adjunta: miniatura con su propio apartado de texto
                        para describir la publicación antes de enviarla */}
                    {imagenPost ? (
                        <View style={propio.fotoAdjunta}>
                            <Image source={{ uri: imagenPost }} style={propio.fotoMini} resizeMode="cover" />
                            <View style={propio.fotoInfo}>
                                <View style={propio.filaFotoTop}>
                                    <Text style={propio.fotoTexto}>Foto adjunta</Text>
                                    <TouchableOpacity
                                        onPress={() => setImagenPost(null)}
                                        style={propio.quitarFoto}
                                        accessibilityLabel="Quitar foto adjunta"
                                    >
                                        <Text style={propio.quitarFotoTexto}>Quitar</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={propio.inputFoto}
                                    placeholder={PLACEHOLDERS[tipoPost]}
                                    placeholderTextColor={colores.textoTenue}
                                    value={nuevoPost}
                                    onChangeText={setNuevoPost}
                                    multiline
                                />
                            </View>
                        </View>
                    ) : null}

                    <View style={propio.filaPublicar}>
                        <Boton
                            variante="contorno"
                            style={propio.botonFoto}
                            onPress={adjuntarFoto}
                            cargando={cargandoFoto}
                        >
                            {imagenPost ? 'Cambiar foto' : 'Agregar foto'}
                        </Boton>
                        <Boton style={propio.botonPublicar} onPress={handlePublicar}>
                            Publicar
                        </Boton>
                    </View>
                </View>

                {/* ---------- En revisión: lo que el usuario mandó ---------- */}
                {pendientes.length > 0 ? (
                    <View style={propio.pendientesCaja}>
                        <Text style={propio.pendientesTitulo}>Tus publicaciones en revisión</Text>
                        <Text style={propio.pendientesNota}>
                            Un administrador debe aprobarlas antes de que aparezcan en la comunidad
                        </Text>
                        {pendientes.map(p => (
                            <View key={p.id} style={propio.pendienteFila}>
                                <View style={propio.pendienteDatos}>
                                    <Text style={propio.pendienteTipo}>
                                        {getEtiqueta(p.tipo).texto} · ⏳ En revisión
                                    </Text>
                                    <Text style={propio.pendienteContenido} numberOfLines={4}>
                                        {p.contenido}
                                    </Text>
                                </View>
                                {p.imagen ? (
                                    <Image source={{ uri: p.imagen }} style={propio.pendienteMini} resizeMode="cover" />
                                ) : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ---------- Filtros: cada tipo por separado ---------- */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={propio.filaFiltro}
                >
                    {FILTROS.map(f => {
                        const activo = filtro === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                style={[propio.chip, activo && propio.chipActivo]}
                                onPress={() => setFiltro(f.id)}
                            >
                                <Text style={[propio.chipTexto, activo && propio.chipTextoActivo]}>
                                    {f.texto}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ---------- Publicaciones ---------- */}
                {publicacionesFiltradas.length === 0 ? (
                    <Text style={propio.emptyState}>
                        {filtro === 'todas'
                            ? 'No hay publicaciones aún. ¡Sé el primero!'
                            : 'No hay publicaciones de este tipo todavía'}
                    </Text>
                ) : (
                    publicacionesFiltradas.map(p => {
                        const esAlerta = p.tipo === 'alerta';
                        const icono = esAlerta ? '!' : p.tipo === 'reporte' ? '*' : p.tipo === 'consejo' ? '~' : '#';
                        const etiqueta = getEtiqueta(p.tipo);

                        return (
                            <View key={p.id} style={[propio.card, esAlerta && propio.cardAlerta]}>
                                <View style={[propio.cardIcono, esAlerta && propio.cardIconoAlerta]}>
                                    <Text style={propio.cardIconoTexto}>{icono}</Text>
                                </View>

                                <View style={propio.cardContenido}>
                                    <View style={propio.filaTop}>
                                        <Avatar
                                            uri={p.usuario_avatar}
                                            nombre={p.usuario_nombre}
                                            tamano={26}
                                        />
                                        <Text style={propio.nombre} numberOfLines={1}>
                                            {p.usuario_nombre || 'Anónimo'}
                                        </Text>
                                        <Text style={propio.tiempo} numberOfLines={1}>
                                            {p.fecha_publicacion}
                                        </Text>
                                        <View style={[propio.etiqueta, etiqueta.roja && propio.etiquetaRoja]}>
                                            <Text style={propio.etiquetaTexto}>{etiqueta.texto}</Text>
                                        </View>
                                        {p.verificada ? (
                                            <View style={propio.etiquetaVerificada}>
                                                <Text style={propio.etiquetaVerificadaTexto}>✓ Verificada</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    <Text style={propio.textoPost}>{p.contenido}</Text>

                                    {p.imagen ? (
                                        <Image
                                            source={{ uri: p.imagen }}
                                            style={propio.postImagen}
                                            resizeMode="cover"
                                        />
                                    ) : null}

                                    {p.comentarios && p.comentarios.length > 0 && (
                                        <View style={propio.listaComentarios}>
                                            {p.comentarios.map(c => (
                                                <Text key={c.id} style={propio.comentarioTexto}>
                                                    <Text style={{ fontWeight: '700' }}>{c.usuario_nombre}: </Text>
                                                    {c.contenido}
                                                </Text>
                                            ))}
                                        </View>
                                    )}

                                    {usuario && (
                                        <View style={propio.filaComentario}>
                                            <TextInput
                                                style={propio.inputComentario}
                                                placeholder="Escribe un comentario..."
                                                placeholderTextColor={colores.textoTenue}
                                                value={comentariosInputs[p.id] || ''}
                                                onChangeText={(texto) =>
                                                    setComentariosInputs(prev => ({ ...prev, [p.id]: texto }))
                                                }
                                                onSubmitEditing={() => handleComentar(p.id)}
                                                returnKeyType="send"
                                            />
                                            <Boton
                                                variante="contorno"
                                                style={propio.botonEnviar}
                                                onPress={() => handleComentar(p.id)}
                                            >
                                                Enviar
                                            </Boton>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}

                {/* ---------- Barra lateral: en móvil va debajo del feed ---------- */}
                <View style={propio.sidebar}>
                    <View style={propio.box}>
                        <Text style={propio.boxTitulo}>Tipos de reporte</Text>
                        <Text style={propio.boxTexto}>Nueva fuente</Text>
                        <Text style={propio.boxTexto}>Agua contaminada</Text>
                    </View>

                    <View style={propio.box}>
                        <Text style={propio.boxTitulo}>Estadísticas de la comunidad</Text>
                        <Text style={propio.boxTexto}>{stats.miembros} Miembros</Text>
                        <Text style={propio.boxTexto}>{stats.fuentes} Fuentes</Text>
                        <Text style={propio.boxTexto}>{stats.alertas} Alertas</Text>
                    </View>

                    <View style={[propio.box, propio.boxVerde]}>
                        <Text style={[propio.boxTitulo, { color: '#fff' }]}>Consejo del día</Text>
                        <Text style={[propio.boxTexto, { color: '#eafff5' }]}>
                            Cuida el agua hoy para tener un mejor mañana
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const propio = StyleSheet.create({
    publicar: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 14,
        gap: 12,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    inputPublicar: {
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colores.texto,
        backgroundColor: '#f8fcfc'
    },
    filaTipo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    filaPublicar: {
        flexDirection: 'row',
        gap: 10
    },
    botonFoto: {
        flex: 1,
        paddingVertical: 14
    },
    botonPublicar: {
        flex: 1
    },

    /* Publicaciones en revisión del usuario */
    pendientesCaja: {
        backgroundColor: '#fffbe8',
        borderWidth: 1,
        borderColor: '#f0e0a0',
        borderRadius: 15,
        padding: 14,
        gap: 10
    },
    pendientesTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#8a6d1a'
    },
    pendientesNota: {
        fontSize: 12,
        color: '#a08430',
        lineHeight: 17
    },
    pendienteFila: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10
    },
    pendienteDatos: {
        flex: 1,
        minWidth: 0,
        gap: 4
    },
    pendienteTipo: {
        fontSize: 11,
        fontWeight: '700',
        color: '#b8901f'
    },
    pendienteContenido: {
        fontSize: 13,
        color: colores.textoClaro,
        lineHeight: 18
    },
    pendienteMini: {
        width: 56,
        height: 56,
        borderRadius: 8
    },

    /* Filtros por tipo */
    filaFiltro: {
        gap: 8,
        paddingVertical: 2
    },
    fotoAdjunta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f8fcfc',
        borderWidth: 1,
        borderColor: colores.borde,
        borderRadius: 12,
        padding: 8
    },
    fotoMini: {
        width: 64,
        height: 64,
        borderRadius: 8
    },
    fotoInfo: {
        flex: 1,
        minWidth: 0,
        gap: 6
    },
    filaFotoTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
    },
    fotoTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio
    },
    /* Apartado pequeño de texto junto a la foto: la foto no sustituye al
       texto, aquí se escribe lo que acompaña a la imagen */
    inputFoto: {
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
        color: colores.texto,
        backgroundColor: '#fff',
        minHeight: 62,
        textAlignVertical: 'top'
    },
    quitarFoto: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: colores.errorFondo,
        borderWidth: 1,
        borderColor: colores.errorBorde
    },
    quitarFotoTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: colores.errorTexto
    },
    chip: {
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colores.borde,
        backgroundColor: colores.fondo
    },
    chipActivo: {
        backgroundColor: colores.acento,
        borderColor: colores.acento
    },
    chipTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio
    },
    chipTextoActivo: {
        color: '#fff'
    },
    emptyState: {
        textAlign: 'center',
        color: colores.gris,
        paddingVertical: 30,
        fontSize: 14
    },

    /* Publicación */
    card: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 14,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    cardAlerta: {
        borderLeftWidth: 4,
        borderLeftColor: '#e27777'
    },
    cardIcono: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(61, 173, 174, 0.14)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardIconoAlerta: {
        backgroundColor: 'rgba(226, 119, 119, 0.16)'
    },
    cardIconoTexto: {
        fontSize: 18,
        fontWeight: '800',
        color: colores.acento
    },
    cardContenido: {
        flex: 1,
        minWidth: 0
    },
    filaTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        flexWrap: 'wrap'
    },
    nombre: {
        fontSize: 14,
        fontWeight: '700',
        color: colores.texto,
        flexShrink: 1
    },
    tiempo: {
        fontSize: 11,
        color: colores.textoTenue,
        flexShrink: 1
    },
    etiqueta: {
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: 20,
        backgroundColor: 'rgba(61, 173, 174, 0.14)'
    },
    etiquetaRoja: {
        backgroundColor: 'rgba(226, 119, 119, 0.16)'
    },
    etiquetaTexto: {
        fontSize: 11,
        fontWeight: '700',
        color: colores.acento
    },
    textoPost: {
        fontSize: 14,
        lineHeight: 21,
        color: colores.textoClaro
    },
    postImagen: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: colores.suave
    },
    etiquetaVerificada: {
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: 20,
        backgroundColor: 'rgba(46, 160, 110, 0.14)'
    },
    etiquetaVerificadaTexto: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2ea06e'
    },
    listaComentarios: {
        marginTop: 10,
        gap: 6,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eef6f6'
    },
    comentarioTexto: {
        fontSize: 13,
        lineHeight: 19,
        color: colores.textoMedio
    },
    filaComentario: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10
    },
    inputComentario: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
        color: colores.texto,
        backgroundColor: '#f8fcfc'
    },
    botonEnviar: {
        paddingVertical: 10,
        paddingHorizontal: 14
    },

    /* Sidebar */
    sidebar: {
        gap: 12,
        marginTop: 6
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        gap: 6,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    boxVerde: {
        backgroundColor: '#3dadae'
    },
    boxTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: colores.texto,
        marginBottom: 2
    },
    boxTexto: {
        fontSize: 14,
        color: colores.textoClaro
    }
});
