import { Image, StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme/tema';

/* Avatar circular compartido: muestra la foto de perfil si existe y si no,
   las iniciales del nombre (con el color de fondo que se le pida, por
   defecto el verde agua de la app). */
export default function Avatar({ uri, nombre = '', tamano = 40, fondo, colorTexto }) {
    const iniciales = String(nombre)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0).toUpperCase())
        .join('');

    const caja = {
        width: tamano,
        height: tamano,
        borderRadius: tamano / 2,
    };

    if (uri) {
        return <Image source={{ uri }} style={[estilos.imagen, caja]} />;
    }

    return (
        <View style={[estilos.iniciales, caja, fondo ? { backgroundColor: fondo } : null]}>
            <Text style={[estilos.textoInicial, { fontSize: tamano * 0.38 }, colorTexto ? { color: colorTexto } : null]}>
                {iniciales || '?'}
            </Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    imagen: {
        backgroundColor: colores.suave,
    },
    iniciales: {
        backgroundColor: 'rgba(61, 173, 174, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoInicial: {
        color: colores.acento,
        fontWeight: '700',
    },
});
