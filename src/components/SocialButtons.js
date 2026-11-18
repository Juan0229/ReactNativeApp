import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../theme/tema';
import { estilos } from '../ui/estilos';

const PROVEEDORES = [
    { id: 'google', texto: 'Google', icono: 'logo-google', caja: estilos.botonGoogle, color: '#3c4043' },
    { id: 'facebook', texto: 'Facebook', icono: 'logo-facebook', caja: estilos.botonFacebook, color: '#fff' }
];

export default function SocialButtons({ onSelect, texto = 'o continúa con' }) {
    return (
        <View>
            <View style={estilos.socialSeparador}>
                <View style={estilos.lineaSeparador} />
                <Text style={estilos.textoSeparador}>{texto}</Text>
                <View style={estilos.lineaSeparador} />
            </View>

            <View style={estilos.filaSocial}>
                {PROVEEDORES.map(p => (
                    <TouchableOpacity
                        key={p.id}
                        style={[estilos.botonSocial, p.caja]}
                        onPress={() => onSelect(p.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={p.icono} size={16} color={p.color} />
                        <Text style={[estilos.textoSocial, { color: p.color }]}>{p.texto}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
