import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../theme/tema';
import { estilos } from '../ui/estilos';

/* Círculo con degradado y icono que encabeza los formularios (.form-emblema). */
export default function Emblema({ icono }) {
    return (
        <LinearGradient
            colors={[colores.primario, colores.acento]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.emblema}
        >
            <Ionicons name={icono} size={28} color="#fff" />
        </LinearGradient>
    );
}
