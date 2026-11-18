import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { estilos } from '../ui/estilos';

/* Campo de texto con etiqueta opcional e icono opcional a la izquierda. */
export default function CampoTexto({
    etiqueta,
    icono,
    valor,
    onChangeText,
    placeholder,
    error,
    ...resto
}) {
    return (
        <View style={estilos.campo}>
            {etiqueta ? <Text style={estilos.etiquetaCampo}>{etiqueta}</Text> : null}

            <View style={estilos.filaCampo}>
                {icono ? <Ionicons name={icono} size={17} style={estilos.iconoCampo} /> : null}

                <TextInput
                    style={[
                        estilos.input,
                        icono && estilos.inputConIcono,
                        error && estilos.inputConError
                    ]}
                    value={valor}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ab5b5"
                    {...resto}
                />
            </View>

            {error ? <Text style={estilos.campoError}>{error}</Text> : null}
        </View>
    );
}
