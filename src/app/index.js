import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Navbar from '../components/Navbar';
import Boton from '../components/Boton';
import { colores } from '../theme/tema';

const ESTADISTICAS = [
    { icono: 'tint', valor: '200M', texto: 'Sin acceso' },
    { icono: 'toilet', valor: '3.500M', texto: 'Sin saneamiento' },
    { icono: 'heartbeat', valor: '1.4M', texto: 'Muertes al año' }
];

const CIFRAS = [
    {
        icono: 'tint',
        titulo: '200 millones',
        texto: 'de personas carecen de acceso a agua potable gestionada de forma segura. **115 millones** beben agua directamente de fuentes superficiales.',
        fuente: 'OMS/UNICEF 2023'
    },
    {
        icono: 'toilet',
        titulo: '3.500 millones',
        texto: 'de personas aún carecen de servicios de saneamiento gestionados de forma segura. **419 millones** practican la defecación al aire libre.',
        fuente: 'OMS/UNICEF 2023'
    },
    {
        icono: 'heartbeat',
        titulo: '1.4 millones',
        texto: 'de personas mueren cada año por enfermedades relacionadas con el agua. **1.000 niños** menores de 5 años mueren cada día.',
        fuente: 'OMS 2023'
    },
    {
        icono: 'industry',
        titulo: '80%',
        texto: 'de las aguas residuales regresa al ecosistema **sin ser tratada ni reutilizada**, contaminando fuentes de agua naturales.',
        fuente: 'ONU-Agua 2018'
    },
    {
        icono: 'globe-americas',
        titulo: '10%',
        texto: 'de la población mundial vive en países con **estrés hídrico alto o crítico**, sin suficiente agua para cubrir sus necesidades básicas.',
        fuente: 'FAO/ONU-Agua'
    },
    {
        icono: 'hand-holding-water',
        titulo: '2 de cada 3',
        texto: 'personas en el mundo viven con **escasez de agua** al menos un mes al año. La crisis afecta desproporcionadamente a zonas rurales.',
        fuente: 'UNESCO 2023'
    }
];

const IMAGENES = [
    {
        img: require('../../assets/imagenes/recolectando-agua.jpg'),
        pie: 'Millones de personas caminan horas cada día para conseguir agua'
    },
    {
        img: require('../../assets/imagenes/agua-contaminada.jpg'),
        pie: 'El 80% de las aguas residuales se vierte sin tratamiento'
    },
    {
        img: require('../../assets/imagenes/sequia.jpg'),
        pie: 'La sequía afecta a comunidades enteras en todo el mundo'
    }
];

const MISION = [
    { icono: 'map-marked-alt', titulo: 'Localizamos', texto: 'fuentes de agua cercanas' },
    { icono: 'book-open', titulo: 'Educamos', texto: 'con guías de purificación' },
    { icono: 'comments', titulo: 'Conectamos', texto: 'comunidades enteras' }
];

/* El texto de las tarjetas usa **negrita** como en la web; aquí se convierte
   en Text anidados, que es como React Native marca el texto en negrita. */
function conNegritas(texto) {
    return texto.split('**').map((parte, i) => (
        <Text key={i} style={i % 2 === 1 ? estilos.negrita : undefined}>{parte}</Text>
    ));
}

export default function Inicio() {
    /* Aviso de bienvenida al iniciar sesión: dice si entraste como
       administrador o como usuario normal (lo manda el login). */
    const parametros = useLocalSearchParams();
    const bienvenida = typeof parametros.bienvenida === 'string' ? parametros.bienvenida : '';
    const [mostrarAviso, setMostrarAviso] = useState(Boolean(bienvenida));
    const esStaffBienvenida = ['super', 'admin', 'moderador'].includes(bienvenida);
    const esSuperBienvenida = bienvenida === 'super' || bienvenida === 'admin';

    const cerrarAviso = () => {
        setMostrarAviso(false);
        router.replace('/');
    };

    return (
        <View style={estilos.pagina}>
            <Navbar />

            <ScrollView contentContainerStyle={estilos.scroll}>
                {/* ---------- Aviso de rol ---------- */}
                {mostrarAviso ? (
                    <View style={[estilos.avisoRol, esStaffBienvenida && estilos.avisoRolAdmin]}>
                        <FontAwesome5
                            name={esSuperBienvenida ? 'user-shield' : esStaffBienvenida ? 'user-check' : 'user'}
                            size={20}
                            color={esStaffBienvenida ? colores.textoOscuro : colores.acento}
                            solid
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={estilos.avisoRolTitulo}>
                                {bienvenida === 'super' || bienvenida === 'admin'
                                    ? 'Has iniciado sesión como Super admin'
                                    : bienvenida === 'moderador'
                                        ? 'Has iniciado sesión como Moderador'
                                        : 'Has iniciado sesión como Usuario normal'}
                            </Text>
                            <Text style={estilos.avisoRolTexto}>
                                {esSuperBienvenida
                                    ? 'Tienes acceso completo: usuarios, publicaciones y fuentes.'
                                    : bienvenida === 'moderador'
                                        ? 'Revisa y aprueba publicaciones desde el panel de gestión.'
                                        : 'Ya puedes publicar, chatear y usar todas las funciones.'}
                            </Text>
                            {esStaffBienvenida ? (
                                <TouchableOpacity onPress={() => router.push('/admin')}>
                                    <Text style={estilos.avisoRolEnlace}>
                                        Abrir panel de gestión →
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            onPress={cerrarAviso}
                            style={estilos.avisoRolCerrar}
                            accessibilityLabel="Cerrar aviso"
                        >
                            <Ionicons name="close" size={16} color={colores.texto} />
                        </TouchableOpacity>
                    </View>
                ) : null}
                {/* ---------- Portada ---------- */}
                <ImageBackground
                    source={require('../../assets/imagenes/fondo_gota.png')}
                    style={estilos.hero}
                >
                    <View style={estilos.heroPanel}>
                        <View style={estilos.badge}>
                            <Text style={estilos.badgeTexto}>AGUA POTABLE PARA TODOS</Text>
                        </View>

                        <Text style={estilos.heroTitulo}>
                            El agua es un <Text style={estilos.resaltado}>derecho</Text>, no un privilegio.
                        </Text>

                        <Text style={estilos.heroTexto}>
                            Water Seven localiza fuentes de agua potable, guía su purificación y
                            conecta comunidades para asegurar el acceso a este recurso vital.
                        </Text>

                        <View style={estilos.heroBotones}>
                            <Boton style={estilos.heroBoton} onPress={() => router.push('/fuentes')}>
                                Encontrar agua
                            </Boton>
                            <Boton
                                variante="contorno"
                                style={estilos.heroBoton}
                                onPress={() => router.push('/registro')}
                            >
                                Únete a la misión
                            </Boton>
                        </View>

                        <View style={estilos.divisor} />

                        <View style={estilos.stats}>
                            {ESTADISTICAS.map(s => (
                                <View key={s.texto} style={estilos.stat}>
                                    <View style={estilos.statIcono}>
                                        <FontAwesome5 name={s.icono} size={17} color={colores.acento} solid />
                                    </View>
                                    <Text style={estilos.statValor}>{s.valor}</Text>
                                    <Text style={estilos.statTexto}>{s.texto}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ImageBackground>

                {/* ---------- La crisis en cifras ---------- */}
                <View style={estilos.problematica}>
                    <Text style={estilos.tituloSeccion}>La crisis del agua en cifras</Text>
                    <Text style={estilos.subtituloSeccion}>
                        Datos reales de la OMS y UNICEF que muestran por qué nace Water Seven
                    </Text>

                    {CIFRAS.map(c => (
                        <View key={c.titulo} style={estilos.cifraCard}>
                            <FontAwesome5 name={c.icono} size={26} color={colores.acento} solid />
                            <Text style={estilos.cifraTitulo}>{c.titulo}</Text>
                            <Text style={estilos.cifraTexto}>{conNegritas(c.texto)}</Text>
                            <Text style={estilos.cifraFuente}>{c.fuente}</Text>
                        </View>
                    ))}

                    <View style={estilos.imagenes}>
                        {IMAGENES.map(m => (
                            <View key={m.pie} style={estilos.imagenCard}>
                                <Image source={m.img} style={estilos.imagen} />
                                <Text style={estilos.imagenPie}>{m.pie}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ---------- Misión ---------- */}
                <View style={estilos.mision}>
                    <Text style={estilos.misionTitulo}>Nuestra misión</Text>
                    <Text style={estilos.misionTexto}>
                        Water Seven nace para enfrentar esta crisis. Usamos tecnología accesible para{' '}
                        <Text style={estilos.negritaClara}>localizar fuentes de agua potable</Text>,
                        brindar <Text style={estilos.negritaClara}>guías de purificación</Text> y
                        conectar comunidades a través de un{' '}
                        <Text style={estilos.negritaClara}>chat de comunicación</Text>. Creemos que el
                        agua es un derecho humano, no un privilegio.
                    </Text>

                    <View style={estilos.misionStats}>
                        {MISION.map(m => (
                            <View key={m.titulo} style={estilos.misionStat}>
                                <FontAwesome5 name={m.icono} size={34} color="#fff" solid />
                                <Text style={estilos.misionStatTitulo}>{m.titulo}</Text>
                                <Text style={estilos.misionStatTexto}>{m.texto}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
    pagina: {
        flex: 1,
        backgroundColor: colores.fondo
    },
    scroll: {
        paddingBottom: 40
    },

    /* Aviso de bienvenida con el rol */
    avisoRol: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginHorizontal: 12,
        marginTop: 12,
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colores.borde,
        shadowColor: colores.acento,
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3
    },
    avisoRolAdmin: {
        backgroundColor: 'rgba(94, 196, 197, 0.14)',
        borderColor: colores.primario
    },
    avisoRolTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: colores.textoOscuro
    },
    avisoRolTexto: {
        fontSize: 13,
        color: colores.textoMedio,
        marginTop: 3,
        lineHeight: 18
    },
    avisoRolEnlace: {
        fontSize: 13,
        fontWeight: '700',
        color: colores.acento,
        marginTop: 8
    },
    avisoRolCerrar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colores.suave
    },

    /* Portada */
    hero: {
        padding: 20,
        paddingTop: 36,
        paddingBottom: 36,
        backgroundColor: '#dff2f2'
    },
    heroPanel: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#10312f',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5
    },
    badge: {
        backgroundColor: 'rgba(94, 196, 197, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(94, 196, 197, 0.35)',
        borderRadius: 30,
        paddingHorizontal: 14,
        paddingVertical: 7
    },
    badgeTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: colores.acento,
        letterSpacing: 1
    },
    heroTitulo: {
        fontSize: 27,
        fontWeight: '700',
        color: colores.texto,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 12,
        lineHeight: 34
    },
    resaltado: {
        color: colores.acento
    },
    heroTexto: {
        fontSize: 15,
        color: '#1f4343',
        textAlign: 'center',
        lineHeight: 23,
        marginBottom: 24
    },
    heroBotones: {
        width: '100%',
        gap: 12
    },
    heroBoton: {
        width: '100%'
    },
    divisor: {
        width: 40,
        height: 2,
        borderRadius: 2,
        backgroundColor: colores.acento,
        marginVertical: 24
    },
    stats: {
        flexDirection: 'row',
        gap: 10,
        width: '100%'
    },
    stat: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    statIcono: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(61, 173, 174, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    statValor: {
        fontSize: 20,
        fontWeight: '800',
        color: colores.textoOscuro,
        marginBottom: 2
    },
    statTexto: {
        fontSize: 12,
        color: colores.textoClaro,
        textAlign: 'center',
        fontWeight: '500'
    },

    /* Cifras */
    problematica: {
        backgroundColor: '#eaf4f4',
        paddingVertical: 38,
        paddingHorizontal: 18
    },
    tituloSeccion: {
        fontSize: 23,
        fontWeight: '700',
        color: colores.texto,
        textAlign: 'center',
        marginBottom: 8
    },
    subtituloSeccion: {
        fontSize: 14,
        color: '#5b9999',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20
    },
    cifraCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 14,
        shadowColor: colores.acento,
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    cifraTitulo: {
        fontSize: 22,
        fontWeight: '700',
        color: colores.texto,
        marginTop: 12,
        marginBottom: 8
    },
    cifraTexto: {
        fontSize: 14,
        color: colores.textoClaro,
        lineHeight: 21
    },
    negrita: {
        fontWeight: '700',
        color: colores.texto
    },
    cifraFuente: {
        fontSize: 12,
        fontStyle: 'italic',
        color: colores.textoSuave,
        marginTop: 10
    },
    imagenes: {
        gap: 14,
        marginTop: 8
    },
    imagenCard: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: colores.acento,
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    imagen: {
        width: '100%',
        height: 180
    },
    imagenPie: {
        padding: 12,
        paddingHorizontal: 15,
        fontSize: 14,
        color: colores.texto,
        lineHeight: 19
    },

    /* Misión */
    mision: {
        backgroundColor: colores.acento,
        paddingVertical: 44,
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    misionTitulo: {
        fontSize: 25,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 18,
        textAlign: 'center'
    },
    misionTexto: {
        fontSize: 15,
        lineHeight: 25,
        color: '#e0f4f4',
        marginBottom: 32,
        textAlign: 'center'
    },
    negritaClara: {
        fontWeight: '700',
        color: '#fff'
    },
    misionStats: {
        gap: 26,
        width: '100%'
    },
    misionStat: {
        alignItems: 'center'
    },
    misionStatTitulo: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        marginTop: 12,
        marginBottom: 4
    },
    misionStatTexto: {
        fontSize: 13,
        color: '#d4f0f0',
        textAlign: 'center'
    }
});
