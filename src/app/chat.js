import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { colores } from '../theme/tema';
import { api, esStaff } from '../services/api';
import { estilos } from '../ui/estilos';

const getAvatarColor = (nombre) => {
    const coloresAvatar = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ff9ff3', '#feca57', '#ff6b6b', '#4ecdc4'];
    let hash = 0;
    for (let i = 0; i < (nombre || '').length; i++) {
        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return coloresAvatar[Math.abs(hash) % coloresAvatar.length];
};

/* Sin depender de Intl (que no siempre está disponible en Hermes) */
const horaDe = (fecha) => {
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return '';
    const h = String(fecha.getHours()).padStart(2, '0');
    const m = String(fecha.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

export default function Chat() {
    const { usuario } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [sala, setSala] = useState('general');
    const [usuariosEnLinea, setUsuariosEnLinea] = useState(0);
    const scrollRef = useRef(null);
    const insets = useSafeAreaInsets();

    /* Dos chats separados: General para todos y la sala del equipo
       (privada, sólo aparece para super admin y moderadores) */
    const esStaff_ = esStaff(usuario);
    const SALAS = [
        { id: 'general', icono: '💬', texto: 'General' },
        ...(esStaff_ ? [{ id: 'staff', icono: '🛡', texto: 'Sala del equipo' }] : []),
    ];

    const INFO_SALA = {
        general: '¡Bienvenido al chat de la comunidad!',
        staff: 'Sala privada del equipo: aquí no escribe nadie de fuera',
    };

    const cargarMensajes = useCallback(async () => {
        try {
            const msgs = await api.obtenerMensajes(sala, usuario ? usuario.id : null);
            setMensajes(Array.isArray(msgs) ? msgs : []);
            setUsuariosEnLinea(Math.floor(Math.random() * 15) + 5);
        } catch (e) {
            console.error('Error al cargar mensajes:', e);
        }
    }, [sala, usuario]);

    // Refresco periódico, igual que en la web (cada 5 segundos)
    useEffect(() => {
        cargarMensajes();
        const interval = setInterval(cargarMensajes, 5000);
        return () => clearInterval(interval);
    }, [cargarMensajes]);

    // Siempre al final de la conversación
    useEffect(() => {
        const temporizador = setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 120);
        return () => clearTimeout(temporizador);
    }, [mensajes]);

    const handleEnviar = async () => {
        if (!usuario) {
            Alert.alert('Inicia sesión', 'Debes iniciar sesión para chatear');
            return;
        }
        if (nuevoMensaje.trim() === '') return;

        try {
            const res = await api.enviarMensaje(usuario.id, nuevoMensaje.trim(), sala);
            if (res && res.error) {
                Alert.alert('No permitido', res.error);
                return;
            }
            setNuevoMensaje('');
            await cargarMensajes();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const esMensajePropio = (remitenteId) => usuario && remitenteId === usuario.id;

    return (
        <View style={estilos.pagina}>
            <Navbar />

            {/* Encabezado */}
            <View style={propio.encabezado}>
                <View style={propio.filaConexion}>
                    <View style={propio.punto} />
                    <Text style={propio.textoConexion}>{usuariosEnLinea} en línea</Text>
                </View>
                <Text style={propio.titulo}>Chat de Comunidad</Text>
                <Text style={propio.subtitulo}>
                    Conversa con otros miembros de Water Seven sobre fuentes de agua,
                    alertas y cuidados del recurso hídrico.
                </Text>
            </View>

            {/* Conversación */}
            <View style={propio.tarjetaChat}>
                {/* Dos salas separadas: los usuarios ven sólo General y el
                    equipo tiene su propia sala privada (no se mezclan) */}
                {SALAS.length > 1 ? (
                    <View style={propio.filaSalas}>
                        {SALAS.map(s => {
                            const activa = sala === s.id;
                            const esStaffRoom = s.id === 'staff';
                            return (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[
                                        propio.sala,
                                        activa && (esStaffRoom ? propio.salaActivaStaff : propio.salaActiva)
                                    ]}
                                    onPress={() => setSala(s.id)}
                                >
                                    <Text
                                        style={[
                                            propio.salaTexto,
                                            activa && (esStaffRoom ? propio.salaTextoActivaStaff : propio.salaTextoActiva)
                                        ]}
                                    >
                                        {s.icono} {s.texto}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : null}

                <View style={propio.bienvenida}>
                    <Ionicons name="hand-left-outline" size={16} color={colores.acento} />
                    <Text style={propio.bienvenidaTexto}>
                        {INFO_SALA[sala] || INFO_SALA.general}
                    </Text>
                </View>

                <ScrollView
                    ref={scrollRef}
                    style={propio.areaMensajes}
                    contentContainerStyle={propio.areaMensajesContenido}
                >
                    {mensajes.length === 0 ? (
                        <View style={propio.vacio}>
                            <Ionicons name="chatbubbles-outline" size={42} color="#b9d8d5" />
                            <Text style={propio.vacioTitulo}>
                                {sala === 'staff' ? 'Sala del equipo vacía' : 'Sin conversaciones aún'}
                            </Text>
                            <Text style={propio.vacioTexto}>
                                {sala === 'staff'
                                    ? 'Este chat es privado del equipo: sólo lo ven super admin y moderadores.'
                                    : 'Inicia tú la conversación y conecta con la comunidad Water Seven.'}
                            </Text>
                        </View>
                    ) : (
                        mensajes.map(m => {
                            const propio_ = esMensajePropio(m.remitente_id);
                            const colorAvatar = getAvatarColor(m.remitente_nombre || '');
                            const fecha = new Date(
                                m.fecha_creacion || m.fecha_publicacion || m.fecha || Date.now()
                            );
                            const hora = horaDe(fecha);

                            return (
                                <View
                                    key={m.id}
                                    style={[propio.mensaje, propio_ ? propio.mensajePropio : propio.mensajeOtro]}
                                >
                                    {!propio_ && (
                                        <Avatar
                                            uri={m.remitente_avatar}
                                            nombre={m.remitente_nombre}
                                            tamano={32}
                                            fondo={colorAvatar}
                                            colorTexto="#fff"
                                        />
                                    )}

                                    <View style={[propio.burbuja, propio_ && propio.burbujaPropia]}>
                                        {!propio_ && (
                                            <Text style={propio.burbujaNombre}>
                                                {m.remitente_nombre || 'Anónimo'}
                                            </Text>
                                        )}
                                        <Text style={[propio.burbujaTexto, propio_ && propio.burbujaTextoPropio]}>
                                            {m.contenido}
                                        </Text>
                                        {hora ? (
                                            <Text style={[propio.burbujaHora, propio_ && propio.burbujaHoraPropia]}>
                                                {hora}
                                            </Text>
                                        ) : null}
                                    </View>

                                    {propio_ && (
                                        <Avatar
                                            uri={m.remitente_avatar}
                                            nombre={m.remitente_nombre}
                                            tamano={32}
                                            fondo={colores.acento}
                                            colorTexto="#fff"
                                        />
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            {/* Envío */}
            <View style={[propio.barraEnvio, { paddingBottom: insets.bottom + 10 }]}>
                <View style={propio.filaEnvio}>
                    <TextInput
                        style={propio.inputMensaje}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={colores.textoTenue}
                        value={nuevoMensaje}
                        onChangeText={setNuevoMensaje}
                        onSubmitEditing={handleEnviar}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[propio.botonEnviar, !usuario && propio.botonEnviarDeshabilitado]}
                        onPress={handleEnviar}
                        disabled={!usuario}
                        accessibilityLabel="Enviar mensaje"
                    >
                        <Ionicons name="paper-plane" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {!usuario && (
                    <View style={propio.alertaSesion}>
                        <Ionicons name="information-circle-outline" size={15} color={colores.textoMedio} />
                        <Text style={propio.alertaSesionTexto}>
                            Inicia sesión para poder enviar mensajes
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const propio = StyleSheet.create({
    encabezado: {
        backgroundColor: colores.acento,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 20,
        alignItems: 'center'
    },
    filaConexion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 10
    },
    punto: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7dffb2'
    },
    textoConexion: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff'
    },
    titulo: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center'
    },
    subtitulo: {
        fontSize: 13,
        color: '#e0f4f4',
        textAlign: 'center',
        lineHeight: 19
    },

    tarjetaChat: {
        flex: 1,
        marginHorizontal: 12,
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'column',
        shadowColor: colores.acento,
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3
    },

    /* Salas del chat */
    filaSalas: {
        flexDirection: 'row',
        gap: 8,
        padding: 10,
        backgroundColor: '#f7fbfb',
        borderBottomWidth: 1,
        borderBottomColor: '#e6f4f4'
    },
    sala: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 13,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colores.borde
    },
    salaActiva: {
        backgroundColor: 'rgba(61, 173, 174, 0.14)',
        borderColor: colores.acento
    },
    salaActivaStaff: {
        backgroundColor: 'rgba(155, 140, 240, 0.16)',
        borderColor: '#9b8cf0'
    },
    salaTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio
    },
    salaTextoActiva: {
        color: colores.acento,
        fontWeight: '700'
    },
    salaTextoActivaStaff: {
        color: '#6b5fd6',
        fontWeight: '700'
    },
    bienvenida: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 11,
        backgroundColor: '#f2fbfb',
        borderBottomWidth: 1,
        borderBottomColor: '#e6f4f4'
    },
    bienvenidaTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.acento
    },
    areaMensajes: {
        flex: 1
    },
    areaMensajesContenido: {
        padding: 14,
        gap: 12
    },
    vacio: {
        alignItems: 'center',
        paddingVertical: 46,
        paddingHorizontal: 24,
        gap: 8
    },
    vacioTitulo: {
        fontSize: 16,
        fontWeight: '700',
        color: colores.texto
    },
    vacioTexto: {
        fontSize: 13,
        color: colores.gris,
        textAlign: 'center',
        lineHeight: 19
    },

    mensaje: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end'
    },
    mensajePropio: {
        justifyContent: 'flex-end'
    },
    mensajeOtro: {
        justifyContent: 'flex-start'
    },
    burbuja: {
        maxWidth: '76%',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: '#f0f6f6'
    },
    burbujaPropia: {
        backgroundColor: colores.acento
    },
    burbujaNombre: {
        fontSize: 12,
        fontWeight: '700',
        color: colores.texto,
        marginBottom: 2
    },
    burbujaTexto: {
        fontSize: 14,
        lineHeight: 20,
        color: colores.texto
    },
    burbujaTextoPropio: {
        color: '#fff'
    },
    burbujaHora: {
        fontSize: 10,
        color: colores.textoTenue,
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    burbujaHoraPropia: {
        color: 'rgba(255,255,255,0.75)'
    },

    barraEnvio: {
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: colores.fondo
    },
    filaEnvio: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center'
    },
    inputMensaje: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 11,
        fontSize: 15,
        color: colores.texto,
        backgroundColor: '#fff'
    },
    botonEnviar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colores.acento,
        alignItems: 'center',
        justifyContent: 'center'
    },
    botonEnviarDeshabilitado: {
        backgroundColor: colores.primarioDeshabilitado
    },
    alertaSesion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8
    },
    alertaSesionTexto: {
        fontSize: 12,
        color: colores.textoMedio
    }
});
