import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { estilos } from '../ui/estilos';

/* Fondo degradado + tarjeta blanca de las pantallas de autenticación
   (.auth-background y .form-container de la web). */
export default function FormAuth({ children }) {
    return (
        <LinearGradient
            colors={['#e0f7fa', '#b2ebf2', '#80deea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.fondoAuth}
        >
            <KeyboardAvoidingView
                style={estilos.fondoAuth}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={estilos.scrollAuth}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={estilos.tarjetaForm}>{children}</View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}
