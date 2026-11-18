import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import Navbar from '../components/Navbar';
import FormAuth from '../components/FormAuth';
import Emblema from '../components/Emblema';
import CampoPassword from '../components/CampoPassword';
import Boton from '../components/Boton';
import { api } from '../services/api';
import { esquemaNuevaPassword } from '../services/validaciones';
import { estilos } from '../ui/estilos';

export default function NuevaPassword() {
    const parametros = useLocalSearchParams();
    const correo = typeof parametros.correo === 'string' ? parametros.correo : '';
    const aviso = typeof parametros.aviso === 'string' ? parametros.aviso : '';

    // Sin correo de origen no se puede actualizar nada
    useEffect(() => {
        if (!correo) router.replace('/login');
    }, [correo]);

    /* Formik + Yup: contraseña nueva y confirmación validadas antes de enviar */
    const handleGuardar = async (values) => {
        if (!correo) {
            router.replace('/login');
            return;
        }

        try {
            const res = await api.actualizarPassword(correo, values.password);
            if (res.error) {
                return res.error;
            }
            return { listo: true };
        } catch {
            return 'Error de conexión con el servidor';
        }
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <FormAuth>
                <Formik
                    initialValues={{ password: '', confirmar: '' }}
                    validationSchema={esquemaNuevaPassword}
                    onSubmit={async (values, helpers) => {
                        const res = await handleGuardar(values);
                        if (typeof res === 'string') {
                            // Error del servidor: se muestra sin salir del formulario
                            helpers.setStatus({ error: res });
                        } else {
                            helpers.setStatus({ listo: true });
                        }
                    }}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, status }) => (
                        <View>
                            {status && status.listo ? (
                                <View>
                                    <Emblema icono="checkmark-circle" />
                                    <Text style={estilos.tituloForm}>Contraseña actualizada</Text>
                                    <Text style={estilos.subForm}>Ya puedes iniciar sesión con tu nueva contraseña</Text>

                                    <Boton onPress={() => router.replace('/login')}>Ir a iniciar sesión</Boton>
                                </View>
                            ) : (
                                <View>
                                    <Emblema icono="lock-open" />

                                    <Text style={estilos.tituloForm}>Nueva contraseña</Text>
                                    <Text style={estilos.subForm}>
                                        Elige una contraseña segura para{' '}
                                        <Text style={{ fontWeight: '700', color: '#2d4f4f' }}>{correo}</Text>
                                    </Text>

                                    <CampoPassword
                                        etiqueta="Nueva contraseña"
                                        valor={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        placeholder="Mínimo 8 caracteres"
                                        error={touched.password && errors.password ? errors.password : ''}
                                    />

                                    <CampoPassword
                                        etiqueta="Validar contraseña"
                                        valor={values.confirmar}
                                        onChangeText={handleChange('confirmar')}
                                        onBlur={handleBlur('confirmar')}
                                        placeholder="Repite tu contraseña"
                                        error={touched.confirmar && errors.confirmar ? errors.confirmar : ''}
                                    />

                                    {aviso ? <Text style={estilos.avisoMsg}>{aviso}</Text> : null}
                                    {status && status.error ? (
                                        <Text style={estilos.errorMsg}>{status.error}</Text>
                                    ) : null}

                                    <Boton onPress={handleSubmit} cargando={isSubmitting}>Guardar contraseña</Boton>

                                    <Text style={estilos.enlaceCentrado} onPress={() => router.replace('/login')}>
                                        ‹ Volver
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
