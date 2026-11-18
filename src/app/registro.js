import { useState } from 'react';
import { Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
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
import { colores } from '../theme/tema';
import { api } from '../services/api';
import { esquemaRegistro, REGLAS_PASSWORD } from '../services/validaciones';
import { estilos } from '../ui/estilos';

function Regla({ ok, texto }) {
    return (
        <View style={estilos.reglaFila}>
            <FontAwesome5
                name={ok ? 'check-circle' : 'circle'}
                size={13}
                color={ok ? colores.acento : colores.textoTenue}
                solid
            />
            <Text style={[estilos.reglaTexto, ok && estilos.reglaTextoOk]}>{texto}</Text>
        </View>
    );
}

export default function Registro() {
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const { usuario, cargando: cargandoSesion, login } = useAuth();

    if (!cargandoSesion && usuario) return <Redirect href="/" />;

    const socialPendiente = (proveedor) => {
        setError('');
        setAviso(`El acceso con ${proveedor} requiere configurar OAuth en el panel del proyecto.`);
    };

    /* Formik + Yup: nombre, correo, contraseña y confirmación validados
       antes de llegar aquí; isSubmitting evita envíos duplicados. */
    const handleRegistro = async (values) => {
        setError('');
        setAviso('');

        try {
            const res = await api.registro(values.nombre.trim(), values.correo.trim(), values.password);
            if (res.error) {
                setError(res.error);
                return;
            }

            // Sin verificación por correo: la cuenta queda creada y se entra
            // directamente con ella (con el aviso de rol en el inicio).
            const acceso = await api.login(values.correo.trim(), values.password);
            if (acceso.usuario) {
                login(acceso.usuario);
                router.replace({ pathname: '/', params: { bienvenida: 'usuario' } });
            } else {
                router.replace('/login');
            }
        } catch {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <FormAuth>
                <Formik
                    initialValues={{ nombre: '', correo: '', password: '', confirmar: '' }}
                    validationSchema={esquemaRegistro}
                    onSubmit={handleRegistro}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <View>
                            <Emblema icono="person-add" />

                            <Text style={estilos.tituloForm}>Crear cuenta</Text>
                            <Text style={estilos.subForm}>Únete a la comunidad de Water Seven</Text>

                            <CampoTexto
                                etiqueta="Nombre completo"
                                icono="person-outline"
                                valor={values.nombre}
                                onChangeText={handleChange('nombre')}
                                onBlur={handleBlur('nombre')}
                                placeholder="Tu nombre"
                                autoCapitalize="words"
                                error={touched.nombre && errors.nombre ? errors.nombre : ''}
                            />

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
                                placeholder="Mínimo 8 caracteres"
                                error={touched.password && errors.password ? errors.password : ''}
                            />

                            {/* Checklist en vivo: cada regla se marca al cumplirse */}
                            {values.password ? (
                                <View style={{ marginBottom: 14 }}>
                                    {REGLAS_PASSWORD.map(regla => (
                                        <Regla
                                            key={regla.falta}
                                            ok={regla.regex.test(values.password)}
                                            texto={regla.ok}
                                        />
                                    ))}
                                </View>
                            ) : null}

                            <CampoPassword
                                etiqueta="Validar contraseña"
                                valor={values.confirmar}
                                onChangeText={handleChange('confirmar')}
                                onBlur={handleBlur('confirmar')}
                                placeholder="Repite tu contraseña"
                                error={touched.confirmar && errors.confirmar ? errors.confirmar : ''}
                            />

                            {error ? <Text style={estilos.errorMsg}>{error}</Text> : null}
                            {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}

                            <Boton onPress={handleSubmit} cargando={isSubmitting}>Registrarse</Boton>

                            <Text style={estilos.formPie}>
                                ¿Ya tienes cuenta?{' '}
                                <Text style={estilos.enlaceFuerte} onPress={() => router.push('/login')}>
                                    Inicia sesión
                                </Text>
                            </Text>

                            <SocialButtons onSelect={socialPendiente} />

                            <Beneficios />
                        </View>
                    )}
                </Formik>
            </FormAuth>
        </View>
    );
}
