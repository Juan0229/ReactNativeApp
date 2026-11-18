import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// En la web se usaba localStorage; en React Native el equivalente es AsyncStorage.
const CLAVE_USUARIO = 'usuario';

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al arrancar se recupera la sesión guardada
    useEffect(() => {
        let activo = true;
        AsyncStorage.getItem(CLAVE_USUARIO)
            .then((guardado) => {
                if (activo && guardado) setUsuario(JSON.parse(guardado));
            })
            .catch(() => {})
            .finally(() => {
                if (activo) setCargando(false);
            });
        return () => {
            activo = false;
        };
    }, []);

    // Cada cambio de sesión se guarda (o se borra)
    useEffect(() => {
        if (cargando) return;
        if (usuario) {
            AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario)).catch(() => {});
        } else {
            AsyncStorage.removeItem(CLAVE_USUARIO).catch(() => {});
        }
    }, [usuario, cargando]);

    const login = (datosUsuario) => setUsuario(datosUsuario);
    const logout = () => setUsuario(null);

    /* Actualiza datos de la sesión sin volver a entrar (foto de perfil,
       nombre...). El useEffect de abajo lo guarda en AsyncStorage. */
    const actualizarUsuario = (cambios) =>
        setUsuario(prev => (prev ? { ...prev, ...cambios } : prev));

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout, actualizarUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
