/* Estilos compartidos entre pantallas: botones, campos, mensajes y tarjetas.
   Equivalente a ui.css y formulario.css de la web. */

import { StyleSheet } from 'react-native';
import { colores } from '../theme/tema';

export const estilos = StyleSheet.create({
    /* ---------- Páginas ---------- */
    pagina: {
        flex: 1,
        backgroundColor: colores.fondo,
    },
    contenidoPagina: {
        padding: 18,
        paddingBottom: 48,
        gap: 14,
    },
    tituloPagina: {
        fontSize: 25,
        fontWeight: '700',
        color: colores.texto,
        textAlign: 'center',
    },
    subtituloPagina: {
        fontSize: 15,
        color: colores.textoSuave,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 6,
    },

    /* ---------- Botones ---------- */
    botonPrimario: {
        backgroundColor: colores.primario,
        borderWidth: 2,
        borderColor: colores.primarioOscuro,
        paddingVertical: 14,
        paddingHorizontal: 26,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botonPrimarioDeshabilitado: {
        backgroundColor: colores.primarioDeshabilitado,
        borderColor: colores.primarioDeshabilitado,
        opacity: 1,
    },
    botonContorno: {
        borderWidth: 1,
        borderColor: colores.primario,
        backgroundColor: 'transparent',
        paddingVertical: 14,
        paddingHorizontal: 26,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botonPlano: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoBoton: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    textoBotonContorno: {
        color: colores.texto,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    textoBotonPlano: {
        color: colores.textoMedio,
        fontSize: 13,
        textAlign: 'center',
    },

    /* ---------- Campos de formulario ---------- */
    campo: {
        marginBottom: 14,
    },
    etiquetaCampo: {
        fontSize: 13,
        fontWeight: '600',
        color: colores.textoMedio,
        marginBottom: 6,
    },
    filaCampo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconoCampo: {
        position: 'absolute',
        left: 14,
        top: 15,
        color: colores.textoSuave,
        zIndex: 1,
    },
    input: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colores.borde,
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        fontSize: 15,
        color: colores.texto,
        backgroundColor: '#f8fcfc',
    },
    inputConIcono: {
        paddingLeft: 40,
    },
    inputPassword: {
        paddingRight: 46,
    },
    inputConError: {
        borderColor: colores.errorBorde,
        backgroundColor: colores.errorFondo,
    },
    botonVer: {
        position: 'absolute',
        right: 6,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
    },
    campoError: {
        color: colores.errorTexto,
        fontSize: 12,
        marginTop: 5,
    },

    /* ---------- Mensajes ---------- */
    errorMsg: {
        color: colores.error,
        fontSize: 13,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    avisoMsg: {
        padding: 11,
        marginBottom: 14,
        borderRadius: 10,
        backgroundColor: colores.avisoFondo,
        borderWidth: 1,
        borderColor: colores.borde,
        color: colores.textoMedio,
        fontSize: 13,
        lineHeight: 18,
    },
    infoMsg: {
        padding: 11,
        borderRadius: 10,
        backgroundColor: colores.avisoFondo,
        borderWidth: 1,
        borderColor: colores.borde,
        color: colores.textoMedio,
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        gap: 10,
    },
    emptyStateTexto: {
        color: colores.gris,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },

    /* ---------- Tarjeta genérica ---------- */
    tarjeta: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 18,
        shadowColor: colores.acento,
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    /* ---------- Fondo y tarjeta de autenticación ---------- */
    fondoAuth: {
        flex: 1,
    },
    scrollAuth: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    tarjetaForm: {
        width: '100%',
        maxWidth: 460,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 36,
        paddingHorizontal: 22,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    emblema: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        shadowColor: colores.acento,
        shadowOpacity: 0.4,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    tituloForm: {
        fontSize: 24,
        fontWeight: '700',
        color: colores.texto,
        textAlign: 'center',
        marginBottom: 8,
    },
    subForm: {
        fontSize: 15,
        color: colores.textoSuave,
        textAlign: 'center',
        marginBottom: 26,
        lineHeight: 21,
    },

    /* ---------- Enlaces y pie del formulario ---------- */
    enlaceCentrado: {
        fontSize: 13,
        color: colores.textoMedio,
        textAlign: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    formPie: {
        marginTop: 18,
        fontSize: 13,
        color: colores.textoSuave,
        textAlign: 'center',
        lineHeight: 19,
    },
    enlaceFuerte: {
        color: colores.acento,
        fontWeight: '700',
    },

    /* ---------- Botones sociales ---------- */
    socialSeparador: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 22,
        marginBottom: 16,
    },
    lineaSeparador: {
        flex: 1,
        height: 1,
        backgroundColor: colores.bordeSuave,
    },
    textoSeparador: {
        fontSize: 12,
        color: colores.textoTenue,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    filaSocial: {
        flexDirection: 'row',
        gap: 10,
    },
    botonSocial: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    botonGoogle: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: colores.bordeSuave,
    },
    botonFacebook: {
        backgroundColor: colores.facebook,
        borderWidth: 1.5,
        borderColor: colores.facebook,
    },
    textoSocial: {
        fontSize: 14,
        fontWeight: '600',
    },

    /* ---------- Tarjeta de beneficios ---------- */
    beneficiosTarjeta: {
        marginTop: 30,
        paddingTop: 22,
        borderTopWidth: 1,
        borderTopColor: '#e8f4f4',
    },
    beneficiosTitulo: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: colores.texto,
        marginBottom: 14,
    },
    beneficioFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: 12,
        backgroundColor: '#f8fcfc',
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: colores.primario,
        marginBottom: 10,
    },
    beneficioTexto: {
        flex: 1,
        fontSize: 13,
        color: colores.textoClaro,
        lineHeight: 18,
    },

    /* ---------- Reglas de contraseña ---------- */
    reglaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    reglaTexto: {
        fontSize: 13,
        color: colores.textoMedio,
    },
    reglaTextoOk: {
        color: colores.acento,
        fontWeight: '600',
    },
});
