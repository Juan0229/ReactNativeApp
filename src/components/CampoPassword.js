import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../theme/tema';
import { estilos } from '../ui/estilos';

/* Campo de contraseña con botón para mostrar/ocultar (igual que en la web). */
export default function CampoPassword({
    etiqueta,
    valor,
    onChangeText,
    placeholder,
    error,
    ...resto
}) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={estilos.campo}>
            {etiqueta ? <Text style={estilos.etiquetaCampo}>{etiqueta}</Text> : null}

            <View style={estilos.filaCampo}>
                <TextInput
                    style={[
                        estilos.input,
                        estilos.inputPassword,
                        error && estilos.inputConError
                    ]}
                    value={valor}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ab5b5"
                    secureTextEntry={!visible}
                    {...resto}
                />

                <TouchableOpacity
                    style={estilos.botonVer}
                    onPress={() => setVisible(v => !v)}
                    accessibilityLabel={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                    <Ionicons
                        name={visible ? 'eye-off-outline' : 'eye-outline'}
                        size={19}
                        color={colores.textoMedio}
                    />
                </TouchableOpacity>
            </View>

            {error ? <Text style={estilos.campoError}>{error}</Text> : null}
        </View>
    );
}
