import { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { esStaff } from '../services/api';
import { colores } from '../theme/tema';
import Boton from './Boton';

const ENLACES_BASE = [
    { ruta: '/', texto: 'Inicio', icono: 'home-outline' },
    { ruta: '/fuentes', texto: 'Encontrar agua', icono: 'water-outline' },
    { ruta: '/comunidad', texto: 'Comunidad', icono: 'people-outline' },
    { ruta: '/chat', texto: 'Chat', icono: 'chatbubbles-outline' },
    { ruta: '/perfil', texto: 'Mi perfil', icono: 'person-circle-outline' }
];

/* Barra superior con logo y menú hamburguesa (en móvil siempre se muestra
   hamburguesa, igual que la web por debajo de 1024px). El menú lateral es un
   Modal con la misma estructura del drawer de la web. */
export default function Navbar() {
    const { usuario, cargando, logout } = useAuth();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const rutaActual = usePathname();
    const insets = useSafeAreaInsets();

    const cerrarMenu = () => setMenuAbierto(false);

    /* "Mi perfil" siempre; "Panel de gestión" solo para el equipo (super
       admin y moderadores) */
    const enlaces = esStaff(usuario)
        ? [...ENLACES_BASE, { ruta: '/admin', texto: 'Panel de gestión', icono: 'shield-outline' }]
        : ENLACES_BASE;

    const irA = (ruta) => {
        setMenuAbierto(false);
        if (ruta !== rutaActual) router.push(ruta);
    };

    return (
        <>
            <View style={[estilos.barra, { paddingTop: insets.top }]}>
                <View style={estilos.logo}>
                    <Image
                        source={require('../../assets/imagenes/logo.png')}
                        style={estilos.logoImagen}
                        resizeMode="contain"
                    />
                    <Text style={estilos.logoTexto} numberOfLines={1}>Water Seven</Text>
                </View>

                <TouchableOpacity
                    style={estilos.botonMenu}
                    onPress={() => setMenuAbierto(true)}
                    accessibilityLabel="Abrir menú de navegación"
                    accessibilityRole="button"
                >
                    <View style={estilos.lineaMenu} />
                    <View style={estilos.lineaMenu} />
                    <View style={estilos.lineaMenu} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={menuAbierto}
                transparent
                animationType="fade"
                onRequestClose={cerrarMenu}
                statusBarTranslucent
            >
                <View style={estilos.overlay}>
                    <Pressable style={estilos.overlayFondo} onPress={cerrarMenu} />

                    <View style={[estilos.drawer, { paddingTop: insets.top + 18 }]}>
                        <View style={estilos.drawerHead}>
                            <Text style={estilos.drawerTitulo}>Menú</Text>
                            <TouchableOpacity
                                style={estilos.botonCerrar}
                                onPress={cerrarMenu}
                                accessibilityLabel="Cerrar menú"
                            >
                                <Ionicons name="close" size={18} color={colores.texto} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={estilos.drawerNav} contentContainerStyle={{ gap: 4 }}>
                            {enlaces.map(e => {
                                const activo = rutaActual === e.ruta;
                                return (
                                    <TouchableOpacity
                                        key={e.ruta}
                                        style={[estilos.drawerLink, activo && estilos.drawerLinkActivo]}
                                        onPress={() => irA(e.ruta)}
                                    >
                                        <Ionicons
                                            name={e.icono}
                                            size={17}
                                            color={colores.acento}
                                            style={{ width: 22, textAlign: 'center' }}
                                        />
                                        <Text
                                            style={[estilos.drawerLinkTexto, activo && estilos.drawerLinkTextoActivo]}
                                        >
                                            {e.texto}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={estilos.drawerFoot}>
                            {cargando ? null : usuario ? (
                                <>
                                    <View style={estilos.usuarioCaja}>
                                        {usuario.avatar ? (
                                            <Image source={{ uri: usuario.avatar }} style={estilos.usuarioAvatar} />
                                        ) : (
                                            <Ionicons name="person" size={16} color={colores.acento} />
                                        )}
                                        <Text style={estilos.usuarioTexto} numberOfLines={1}>
                                            {usuario.nombre}
                                            {esStaff(usuario)
                                                ? usuario.rol === 'moderador' ? ' · Mod' : ' · Super'
                                                : ''}
                                        </Text>
                                    </View>
                                    <Boton variante="contorno" onPress={() => { cerrarMenu(); irA('/perfil'); }}>
                                        Mi perfil
                                    </Boton>
                                    <Boton variante="contorno" onPress={() => { cerrarMenu(); logout(); }}>
                                        Cerrar sesión
                                    </Boton>
                                </>
                            ) : (
                                <>
                                    <Boton variante="contorno" onPress={() => irA('/login')}>
                                        Iniciar sesión
                                    </Boton>
                                    <Boton onPress={() => irA('/registro')}>
                                        Crear cuenta
                                    </Boton>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const estilos = StyleSheet.create({
    barra: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colores.borde,
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    logoImagen: {
        width: 42,
        height: 42,
    },
    logoTexto: {
        marginLeft: 8,
        fontSize: 17,
        fontWeight: '700',
        color: colores.texto,
        flexShrink: 1,
    },
    botonMenu: {
        width: 40,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colores.primario,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 8,
    },
    lineaMenu: {
        width: 18,
        height: 2,
        borderRadius: 2,
        backgroundColor: colores.texto,
    },

    /* Menú lateral */
    overlay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(16, 49, 47, 0.45)',
    },
    overlayFondo: {
        ...StyleSheet.absoluteFillObject,
    },
    drawer: {
        width: 300,
        maxWidth: '92%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        paddingHorizontal: 16,
        paddingBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: -6, height: 0 },
        elevation: 12,
    },
    drawerHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colores.borde,
        marginBottom: 8,
    },
    drawerTitulo: {
        fontSize: 19,
        fontWeight: '700',
        color: colores.texto,
    },
    botonCerrar: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colores.fondo,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerNav: {
        flex: 1,
        paddingVertical: 8,
    },
    drawerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    drawerLinkActivo: {
        backgroundColor: colores.suave,
    },
    drawerLinkTexto: {
        fontSize: 15,
        fontWeight: '500',
        color: colores.texto,
    },
    drawerLinkTextoActivo: {
        color: colores.textoOscuro,
        fontWeight: '700',
    },
    drawerFoot: {
        gap: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colores.borde,
    },
    usuarioCaja: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        backgroundColor: colores.fondo,
        borderRadius: 12,
    },
    usuarioAvatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    usuarioTexto: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: colores.texto,
    },
});
