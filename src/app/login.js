import { useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Formik } from 'formik';
import Navbar from '../components/Navbar';
import FormAuth from '../components/FormAuth';
import Emblema from '../components/Emblema';
import CampoTexto from '../components/CampoTexto';
import CampoPassword from '../components/CampoPassword';
import SocialButtons from '../components/SocialButtons';
import Beneficios from '../components/Beneficios';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { enviarCodigo } from '../services/emailService';
import { esquemaLogin, esquemaRecuperacion } from '../services/validaciones';
import { estilos } from '../ui/estilos';

export default function Login() {
    const [modo, setModo] = useState('login');
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const { usuario, cargando: cargandoSesion, login } = useAuth();

    // Si ya hay sesión iniciada, no tiene sentido ver el formulario
    if (!cargandoSesion && usuario) return <Redirect href="/" />;

    const socialPendiente = (proveedor) => {
        setError('');
        setAviso(`El acceso con ${proveedor} requiere configurar OAuth en el panel del proyecto.`);
    };

    /* Formik centraliza el estado del formulario y Yup lo valida:
       el envío sólo llega aquí si todos los campos son válidos. */
    const handleLogin = async (values) => {
        setError('');
        setAviso('');

        try {
            const res = await api.login(values.correo.trim(), values.password);
            if (res.error) {
                setError(res.error);
            } else {
                login(res.usuario);
                router.replace({
                    pathname: '/',
                    params: { bienvenida: res.usuario.rol || 'usuario' }
                });
            }
        } catch {
            setError('Error de conexión con el servidor');
        }
    };

    const handleRecuperacion = async (values) => {
        setError('');
        setAviso('');

        try {
            const existe = await api.correoExiste(values.correo.trim());
            if (!existe) {
                setError('Ese correo no está registrado en Water Seven');
                return;
            }

            const usuarioEncontrado = await api.buscarUsuarioPorCorreo(values.correo.trim());

            // Solo se envía el correo de recuperación: sin código, la pantalla
            // de nueva contraseña se abre directamente.
            const res = await enviarCodigo({
                correo: values.correo.trim(),
                nombre: usuarioEncontrado ? usuarioEncontrado.nombre : '',
                tipo: 'recuperacion'
            });

            router.replace({
                pathname: '/nueva-password',
                params: {
                    correo: values.correo.trim(),
                    aviso: res.error
                        ? 'No pudimos enviarte el correo ahora, pero puedes continuar. Intenta de nuevo en unos minutos.'
                        : 'Te enviamos un correo de recuperación a tu Gmail.'
                }
            });
        } catch {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <FormAuth>
                <Formik
                    initialValues={{ correo: '', password: '' }}
                    validationSchema={modo === 'login' ? esquemaLogin : esquemaRecuperacion}
                    onSubmit={modo === 'login' ? handleLogin : handleRecuperacion}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <View>
                            {modo === 'login' ? (
                                <View>
                                    <Emblema icono="water" />

                                    <Text style={estilos.tituloForm}>Iniciar sesión</Text>
                                    <Text style={estilos.subForm}>Accede a tu cuenta de Water Seven</Text>

                                    <CampoTexto
                                        etiqueta="Correo electrónico"
                                        icono="mail-outline"
                                        valor={values.correo}
                                        onChangeText={handleChange('correo')}
                                        onBlur={handleBlur('correo')}
                                        placeholder="tucorreo@gmail.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        error={touched.correo && errors.correo ? errors.correo : ''}
                                    />

                                    <CampoPassword
                                        etiqueta="Contraseña"
                                        valor={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        placeholder="Tu contraseña"
                                        error={touched.password && errors.password ? errors.password : ''}
                                    />

                                    <Text
                                        style={estilos.enlaceCentrado}
                                        onPress={() => { setModo('recuperacion'); setError(''); setAviso(''); }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Text>

                                    {error ? <Text style={estilos.errorMsg}>{error}</Text> : null}
                                    {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}

                                    <Boton onPress={handleSubmit} cargando={isSubmitting}>Entrar</Boton>

                                    <Text style={estilos.formPie}>
                                        ¿No tienes cuenta?{' '}
                                        <Text
                                            style={estilos.enlaceFuerte}
                                            onPress={() => router.push('/registro')}
                                        >
                                            Crear cuenta
                                        </Text>
                                    </Text>

                                    <SocialButtons onSelect={socialPendiente} />

                                    <Beneficios />
                                </View>
                            ) : (
                                <View>
                                    <Emblema icono="key" />

                                    <Text style={estilos.tituloForm}>Recuperar contraseña</Text>
                                    <Text style={estilos.subForm}>
                                        Escribe tu correo y te enviamos un correo de recuperación a tu Gmail
                                    </Text>

                                    <CampoTexto
                                        etiqueta="Correo electrónico"
                                        icono="mail-outline"
                                        valor={values.correo}
                                        onChangeText={handleChange('correo')}
                                        onBlur={handleBlur('correo')}
                                        placeholder="tucorreo@gmail.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        error={touched.correo && errors.correo ? errors.correo : ''}
                                    />

                                    {error ? <Text style={estilos.errorMsg}>{error}</Text> : null}
                                    {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}

                                    <Boton onPress={handleSubmit} cargando={isSubmitting}>Enviar correo</Boton>

                                    <Text
                                        style={estilos.enlaceCentrado}
                                        onPress={() => { setModo('login'); setError(''); setAviso(''); }}
                                    >
                                        ‹ Volver a iniciar sesión
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </Formik>
            </FormAuth>
        </View>
    );
}
