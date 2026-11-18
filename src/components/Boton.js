import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { colores } from '../theme/tema';
import { estilos } from '../ui/estilos';

/* Botón compartido con tres variantes: primario, contorno y plano.
   Mismos estilos que .btn-primary, .btn-outline y los enlaces de la web. */
export default function Boton({
    children,
    onPress,
    variante = 'primario',
    deshabilitado = false,
    cargando = false,
    style
}) {
    const caja = variante === 'contorno'
        ? estilos.botonContorno
        : variante === 'plano'
            ? estilos.botonPlano
            : estilos.botonPrimario;

    const texto = variante === 'contorno'
        ? estilos.textoBotonContorno
        : variante === 'plano'
            ? estilos.textoBotonPlano
            : estilos.textoBoton;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={deshabilitado || cargando}
            activeOpacity={0.8}
            style={[
                caja,
                variante === 'primario' && deshabilitado && estilos.botonPrimarioDeshabilitado,
                style
            ]}
        >
            {cargando ? (
                <ActivityIndicator color={variante === 'primario' ? '#fff' : colores.acento} />
            ) : (
                <Text style={texto}>{children}</Text>
            )}
        </TouchableOpacity>
    );
}
