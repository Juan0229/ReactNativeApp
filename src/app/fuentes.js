import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker, UrlTile } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Boton from '../components/Boton';
import { colores } from '../theme/tema';
import { buscarFuentes, geocodificar, UBICACION_DEFAULT } from '../services/fuentesService';
import { estilos } from '../ui/estilos';

const etiquetas = {
    drinking_water: 'Fuente de agua potable',
    water_point: 'Punto de agua',
    watering_place: 'Bebedero',
    water_tower: 'Tanque de agua'
};

const formatoRadio = (r) => (r >= 1000 ? `${(r / 1000).toFixed(1)} km` : `${r} m`);

/* Zona visible del mapa: a mayor radio, más territorio en pantalla */
function regionDe(centro, radio) {
    const delta = Math.max(0.02, (radio * 2.4) / 111000);
    return {
        latitude: centro.lat,
        longitude: centro.lng,
        latitudeDelta: delta,
        longitudeDelta: delta
    };
}

export default function Fuentes() {
    const [pos, setPos] = useState(UBICACION_DEFAULT);
    const [busqueda, setBusqueda] = useState('');
    const [fuentes, setFuentes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [nota, setNota] = useState('');
    const [radio, setRadio] = useState(3000); // 3km por defecto

    const mapaRef = useRef(null);
    const inicioRef = useRef(false);
    const radioTimer = useRef(null);

    const centrar = (centro, r) => {
        const nueva = regionDe(centro, r);
        mapaRef.current?.animateToRegion(nueva, 1200);
    };

    const buscar = async (centro, r) => {
        setCargando(true);
        setError('');
        setPos(centro);
        centrar(centro, r);
        try {
            const resultado = await buscarFuentes({ lat: centro.lat, lng: centro.lng, radio: r });
            setFuentes(resultado);
            if (!resultado.length) {
                setError(`No se encontraron fuentes en ${formatoRadio(r)} a la redonda.`);
            }
        } catch {
            setError('El servicio de fuentes de agua no está disponible en este momento. Intenta de nuevo en unos segundos.');
        } finally {
            setCargando(false);
        }
    };

    // Auto-ubicación al abrir la pantalla: pide permiso y busca cerca del usuario.
    // Si algo falla, la pantalla nunca queda vacía: se buscan fuentes en Bogotá.
    useEffect(() => {
        if (inicioRef.current) return undefined;
        inicioRef.current = true;

        (async () => {
            try {
                const permiso = await Location.requestForegroundPermissionsAsync();
                if (permiso.status !== 'granted') {
                    setNota('No diste permiso de ubicación. Mostramos fuentes cerca de Bogotá.');
                    await buscar(UBICACION_DEFAULT, 3000);
                    return;
                }
                const ubicacion = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
                await buscar({
                    lat: ubicacion.coords.latitude,
                    lng: ubicacion.coords.longitude,
                    nombre: 'Tu ubicación'
                }, 3000);
            } catch {
                setNota('No se pudo obtener tu ubicación. Mostramos fuentes cerca de Bogotá.');
                await buscar(UBICACION_DEFAULT, 3000);
            }
        })();

        return undefined;
    }, []);

    const usarMiUbicacion = async () => {
        setNota('');
        setError('');
        setCargando(true);
        try {
            const permiso = await Location.requestForegroundPermissionsAsync();
            if (permiso.status !== 'granted') {
                setError('No nos diste permiso de ubicación. Actívalo en los ajustes del teléfono.');
                setCargando(false);
                return;
            }
            const ubicacion = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });
            await buscar({
                lat: ubicacion.coords.latitude,
                lng: ubicacion.coords.longitude,
                nombre: 'Tu ubicación'
            }, Math.round(radio));
        } catch {
            setError('No se pudo obtener tu ubicación. Activa el GPS.');
            setCargando(false);
        }
    };

    const buscarDireccion = async () => {
        if (!busqueda.trim()) return;
        setNota('');
        setCargando(true);
        setError('');
        try {
            const centro = await geocodificar(busqueda.trim());
            await buscar(centro, Math.round(radio));
        } catch (err) {
            setError(err.message);
            setCargando(false);
        }
    };

    // El deslizador dispara un evento por cada paso: sin espera, arrastrarlo
    // lanzaría una consulta a OpenStreetMap tras otra.
    const cambiarRadio = (valor) => {
        const nuevo = Math.round(valor);
        setRadio(nuevo);

        if (radioTimer.current) clearTimeout(radioTimer.current);
        radioTimer.current = setTimeout(() => {
            radioTimer.current = null;
            buscar(pos, nuevo);
        }, 700);
    };

    useEffect(() => () => {
        if (radioTimer.current) clearTimeout(radioTimer.current);
    }, []);

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <ScrollView contentContainerStyle={estilos.contenidoPagina}>
                <Text style={estilos.tituloPagina}>Encontrar agua cerca de ti</Text>
                <Text style={estilos.subtituloPagina}>
                    Fuentes de agua potable registradas en OpenStreetMap, actualizadas por la comunidad
                </Text>

                {/* ---------- Buscador ---------- */}
                <View style={propio.buscador}>
                    <View style={propio.filaBusqueda}>
                        <Ionicons name="search-outline" size={17} color={colores.textoSuave} />
                        <TextInput
                            style={propio.inputBusqueda}
                            placeholder="Busca una dirección, barrio o ciudad"
                            placeholderTextColor={colores.textoTenue}
                            value={busqueda}
                            onChangeText={setBusqueda}
                            onSubmitEditing={buscarDireccion}
                            returnKeyType="search"
                        />
                    </View>

                    <View style={propio.filaAcciones}>
                        <Boton
                            variante="contorno"
                            onPress={usarMiUbicacion}
                            deshabilitado={cargando}
                            style={propio.botonAccion}
                        >
                            Mi ubicación
                        </Boton>
                        <Boton
                            onPress={() => buscar(pos, Math.round(radio))}
                            cargando={cargando}
                            style={propio.botonAccion}
                        >
                            Buscar en {formatoRadio(radio)}
                        </Boton>
                    </View>

                    <View style={propio.filaRadio}>
                        <Text style={propio.radioEtiqueta}>Radio: {formatoRadio(radio)}</Text>
                        <Slider
                            style={propio.slider}
                            minimumValue={500}
                            maximumValue={8000}
                            step={500}
                            value={radio}
                            onValueChange={cambiarRadio}
                            minimumTrackTintColor={colores.acento}
                            maximumTrackTintColor={colores.borde}
                            thumbTintColor={colores.acento}
                        />
                    </View>
                </View>

                {nota ? <Text style={estilos.avisoMsg}>{nota}</Text> : null}

                {/* ---------- Mapa ---------- */}
                <View style={propio.mapaContenedor}>
                    <MapView
                        ref={mapaRef}
                        style={propio.mapa}
                        initialRegion={regionDe(UBICACION_DEFAULT, 3000)}
                    >
                        {/* Mosaicos de OpenStreetMap, como en la web */}
                        <UrlTile
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maximumZ={19}
                            flipY={false}
                        />

                        <Circle
                            center={{ latitude: pos.lat, longitude: pos.lng }}
                            radius={Math.round(radio)}
                            fillColor="rgba(94, 196, 197, 0.10)"
                            strokeColor="#5ec4c5"
                            strokeWidth={2}
                        />

                        <Marker
                            coordinate={{ latitude: pos.lat, longitude: pos.lng }}
                            title={pos.nombre || 'Tu ubicación'}
                            pinColor="#3dadae"
                            zIndex={2}
                        />

                        {fuentes.map(f => (
                            <Marker
                                key={f.id}
                                coordinate={{ latitude: f.lat, longitude: f.lng }}
                                title={etiquetas[f.tipo] || 'Fuente de agua'}
                                description={[f.nombre, f.operador ? `Operado por: ${f.operador}` : null]
                                    .filter(Boolean)
                                    .join(' · ')}
                                pinColor="#5ec4c5"
                            />
                        ))}
                    </MapView>
                </View>

                {/* ---------- Panel de resultados ---------- */}
                <View style={propio.panel}>
                    <View style={propio.panelTituloFila}>
                        <Text style={propio.panelTitulo}>
                            Fuentes encontradas en {formatoRadio(radio)}
                        </Text>
                        {!cargando && fuentes.length > 0 ? (
                            <View style={propio.contador}>
                                <Text style={propio.contadorTexto}>{fuentes.length}</Text>
                            </View>
                        ) : null}
                    </View>

                    {cargando ? (
                        <View style={estilos.emptyState}>
                            <Ionicons name="hourglass-outline" size={40} color="#b9d8d5" />
                            <Text style={estilos.emptyStateTexto}>Consultando OpenStreetMap...</Text>
                        </View>
                    ) : error ? (
                        <View style={estilos.emptyState}>
                            <Ionicons name="map-outline" size={42} color="#b9d8d5" />
                            <Text style={estilos.emptyStateTexto}>{error}</Text>
                        </View>
                    ) : fuentes.length === 0 ? (
                        <View style={estilos.emptyState}>
                            <Ionicons name="map-outline" size={42} color="#b9d8d5" />
                            <Text style={estilos.emptyStateTexto}>
                                No se encontraron fuentes en este radio. Intenta ampliar la búsqueda.
                            </Text>
                        </View>
                    ) : (
                        <View style={propio.lista}>
                            {fuentes.map(f => (
                                <View key={f.id} style={propio.item}>
                                    <FontAwesome5 name="droplet" size={16} color={colores.acento} solid />
                                    <View style={propio.itemContenido}>
                                        <Text style={propio.itemTitulo}>
                                            {etiquetas[f.tipo] || 'Fuente de agua'}
                                        </Text>
                                        {f.nombre ? <Text style={propio.itemNombre}>{f.nombre}</Text> : null}
                                        <Text style={propio.itemMeta}>
                                            Acceso: {f.acceso} · Costo: {f.fee}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const propio = StyleSheet.create({
    buscador: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 14,
        gap: 12,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    filaBusqueda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f8fcfc'
    },
    inputBusqueda: {
        flex: 1,
        paddingVertical: 11,
        fontSize: 15,
        color: colores.texto
    },
    filaAcciones: {
        flexDirection: 'row',
        gap: 10
    },
    botonAccion: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10
    },
    filaRadio: {
        gap: 2
    },
    radioEtiqueta: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio
    },
    slider: {
        width: '100%',
        height: 34
    },

    mapaContenedor: {
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colores.acento,
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3
    },
    mapa: {
        width: '100%',
        height: '100%'
    },

    panel: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        shadowColor: colores.acento,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    panelTituloFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10
    },
    panelTitulo: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: colores.texto
    },
    contador: {
        backgroundColor: colores.suave,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 11
    },
    contadorTexto: {
        fontSize: 13,
        fontWeight: '700',
        color: colores.acento
    },
    lista: {
        gap: 10
    },
    item: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        backgroundColor: '#f8fcfc',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: colores.primario
    },
    itemContenido: {
        flex: 1,
        minWidth: 0
    },
    itemTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: colores.texto
    },
    itemNombre: {
        fontSize: 13,
        color: colores.textoClaro,
        marginTop: 2
    },
    itemMeta: {
        fontSize: 12,
        color: colores.textoSuave,
        marginTop: 4
    }
});
