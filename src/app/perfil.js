import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import CampoPassword from '../components/CampoPassword';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { colores } from '../theme/tema';
import { api, esStaff, nombreRol } from '../services/api';
import { esquemaCambioPassword } from '../services/validaciones';
import { estilos } from '../ui/estilos';

/* Panel del usuario: foto de perfil, datos, cambio de contraseña,
   acceso al panel de administrador (si es admin) y cierre de sesión. */
export default function Perfil() {
    const { usuario, cargando, logout, actualizarUsuario } = useAuth();

    const [guardandoFoto, setGuardandoFoto] = useState(false);
    const [modoPassword, setModoPassword] = useState(false);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    if (cargando) return <View style={estilos.pagina}><Navbar /></View>;
    if (!usuario) return <Redirect href="/login" />;

    const esAdmin = esStaff(usuario);

    /* ---------- Foto de perfil ---------- */
    const cambiarFoto = async () => {
        setError('');
        setAviso('');
        try {
            const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permiso.granted) {
                Alert.alert(
                    'Permiso necesario',
                    'Activa el permiso de galería en los ajustes del teléfono para elegir una foto.'
                );
                return;
            }

            setGuardandoFoto(true);
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (resultado.canceled || !resultado.assets?.length) return;

            const uri = resultado.assets[0].uri;
            const res = await api.actualizarAvatar(usuario.id, uri);
            if (res.error) {
                setError(res.error);
                return;
            }
            actualizarUsuario({ avatar: uri });
            setAviso('Foto de perfil actualizada');
        } catch {
            setError('No se pudo abrir la galería');
        } finally {
            setGuardandoFoto(false);
        }
    };

    const quitarFoto = async () => {
        setError('');
        setAviso('');
        try {
            const res = await api.actualizarAvatar(usuario.id, null);
            if (res.error) {
                setError(res.error);
                return;
            }
            actualizarUsuario({ avatar: null });
            setAviso('Foto eliminada. Se muestran tus iniciales');
        } catch {
            setError('No se pudo quitar la foto');
        }
    };

    /* ---------- Cambio de contraseña (Formik + Yup) ---------- */
    const guardarPassword = async (values, helpers) => {
        setError('');
        setAviso('');

        try {
            const res = await api.cambiarPassword(usuario.id, values.actual, values.nueva);
            if (res.error) {
                helpers.setStatus({ error: res.error });
                return;
            }
            helpers.resetForm();
            setModoPassword(false);
            setAviso('Contraseña actualizada correctamente');
        } catch {
            helpers.setStatus({ error: 'Error de conexión con el servidor' });
        }
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <ScrollView contentContainerStyle={estilos.contenidoPagina}>
                <Text style={estilos.tituloPagina}>Mi perfil</Text>
                <Text style={estilos.subtituloPagina}>
                    Tu cuenta, tu foto y tus ajustes de seguridad
                </Text>

                {/* ---------- Tarjeta principal ---------- */}
                <View style={propio.tarjeta}>
                    <View style={propio.avatarCaja}>
                        <Avatar uri={usuario.avatar} nombre={usuario.nombre} tamano={96} />

                        <View style={propio.filaBotonesFoto}>
                            <Boton
                                variante="contorno"
                                style={propio.botonFoto}
                                onPress={cambiarFoto}
                                cargando={guardandoFoto}
                            >
                                {usuario.avatar ? 'Cambiar foto' : 'Agregar foto'}
                            </Boton>

                            {usuario.avatar ? (
                                <Boton variante="plano" onPress={quitarFoto}>
                                    Quitar
                                </Boton>
                            ) : null}
                        </View>
                    </View>

                    <View style={propio.datosCaja}>
                        <View style={propio.filaDato}>
                            <Text style={propio.etiqueta}>Nombre</Text>
                            <Text style={propio.valor}>{usuario.nombre}</Text>
                        </View>
                        <View style={propio.filaDato}>
                            <Text style={propio.etiqueta}>Correo</Text>
                            <Text style={propio.valor}>{usuario.correo}</Text>
                        </View>
                        <View style={propio.filaDato}>
                            <Text style={propio.etiqueta}>Rol</Text>
                            <View style={[propio.badge, esAdmin && propio.badgeAdmin]}>
                                <Text style={[propio.badgeTexto, esAdmin && propio.badgeTextoAdmin]}>
                                    {nombreRol(usuario)}
                                </Text>
                            </View>
                        </View>
                        {usuario.fecha_registro ? (
                            <View style={propio.filaDato}>
                                <Text style={propio.etiqueta}>Miembro desde</Text>
                                <Text style={propio.valor}>{usuario.fecha_registro}</Text>
                            </View>
                        ) : null}
                    </View>

                    {error ? <Text style={estilos.errorMsg}>{error}</Text> : null}
                    {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}
                </View>

                {/* ---------- Accesos ---------- */}
                <View style={propio.tarjeta}>
                    <Text style={propio.tarjetaTitulo}>Cuenta</Text>

                    {esAdmin ? (
                        <Boton
                            style={propio.botonAccion}
                            onPress={() => router.push('/admin')}
                        >
                            Panel de administración
                        </Boton>
                    ) : null}

                    <Boton
                        variante="contorno"
                        style={propio.botonAccion}
                        onPress={() => {
                            setModoPassword(prev => !prev);
                            setError('');
                            setAviso('');
                        }}
                    >
                        {modoPassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                    </Boton>

                    <Boton
                        variante="contorno"
                        style={[propio.botonAccion, propio.botonSalir]}
                        onPress={logout}
                    >
                        Cerrar sesión
                    </Boton>
                </View>

                {/* ---------- Cambio de contraseña ---------- */}
                {modoPassword ? (
                    <Formik
                        initialValues={{ actual: '', nueva: '', confirmar: '' }}
                        validationSchema={esquemaCambioPassword}
                        onSubmit={guardarPassword}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, status }) => (
                            <View style={propio.tarjeta}>
                                <Text style={propio.tarjetaTitulo}>Nueva contraseña</Text>

                                <CampoPassword
                                    etiqueta="Contraseña actual"
                                    valor={values.actual}
                                    onChangeText={handleChange('actual')}
                                    onBlur={handleBlur('actual')}
                                    placeholder="Tu contraseña actual"
                                    error={touched.actual && errors.actual ? errors.actual : ''}
                                />
                                <CampoPassword
                                    etiqueta="Nueva contraseña"
                                    valor={values.nueva}
                                    onChangeText={handleChange('nueva')}
                                    onBlur={handleBlur('nueva')}
                                    placeholder="Mínimo 8 caracteres"
                                    error={touched.nueva && errors.nueva ? errors.nueva : ''}
                                />
                                <CampoPassword
                                    etiqueta="Validar contraseña"
                                    valor={values.confirmar}
                                    onChangeText={handleChange('confirmar')}
                                    onBlur={handleBlur('confirmar')}
                                    placeholder="Repite la nueva contraseña"
                                    error={touched.confirmar && errors.confirmar ? errors.confirmar : ''}
                                />

                                {status && status.error ? (
                                    <Text style={estilos.errorMsg}>{status.error}</Text>
                                ) : null}

                                <Boton onPress={handleSubmit} cargando={isSubmitting}>
                                    Guardar contraseña
                                </Boton>
                            </View>
                        )}
                    </Formik>
                ) : null}
            </ScrollView>
        </View>
    );
}

const propio = StyleSheet.create({
    tarjeta: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 18,
        gap: 6,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    tarjetaTitulo: {
        fontSize: 16,
        fontWeight: '700',
        color: colores.texto,
        marginBottom: 10,
    },
    avatarCaja: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    filaBotonesFoto: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    botonFoto: {
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    datosCaja: {
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#eef6f6',
        paddingTop: 14,
    },
    filaDato: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    etiqueta: {
        fontSize: 14,
        color: colores.textoSuave,
        flexShrink: 0,
    },
    valor: {
        fontSize: 14,
        fontWeight: '600',
        color: colores.texto,
        flexShrink: 1,
        textAlign: 'right',
    },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(61, 173, 174, 0.14)',
    },
    badgeAdmin: {
        backgroundColor: 'rgba(94, 196, 197, 0.28)',
    },
    badgeTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: colores.acento,
    },
    badgeTextoAdmin: {
        color: colores.textoOscuro,
    },
    botonAccion: {
        marginBottom: 10,
    },
    botonSalir: {
        borderColor: colores.errorBorde,
    },
});
