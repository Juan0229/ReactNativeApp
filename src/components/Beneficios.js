import { Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colores } from '../theme/tema';
import { estilos } from '../ui/estilos';

const BENEFICIOS = [
    { icono: 'map-marked-alt', texto: 'Localiza fuentes de agua potable cerca de ti' },
    { icono: 'book-open', texto: 'Guías de purificación de agua' },
    { icono: 'comments', texto: 'Chat con comunidades para compartir alertas' }
];

/* Tarjeta "¿Por qué unirte a Water Seven?" de los formularios. */
export default function Beneficios() {
    return (
        <View style={estilos.beneficiosTarjeta}>
            <Text style={estilos.beneficiosTitulo}>¿Por qué unirte a Water Seven?</Text>

            {BENEFICIOS.map(b => (
                <View key={b.texto} style={estilos.beneficioFila}>
                    <FontAwesome5 name={b.icono} size={14} color={colores.acento} solid />
                    <Text style={estilos.beneficioTexto}>{b.texto}</Text>
                </View>
            ))}
        </View>
    );
}
