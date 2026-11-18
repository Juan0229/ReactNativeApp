import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { colores } from '../theme/tema';

/* Estructura raíz de la app: sesión + navegación por archivos (Expo Router).
   Cada pantalla vive en src/app/*.js y todas comparten el Navbar. */
export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="dark" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colores.fondo },
                        animation: 'slide_from_right'
                    }}
                />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
