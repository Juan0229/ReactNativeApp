/* Servicio de correo adaptado a React Native.
   En la web se usa @emailjs/browser, pero ese SDK solo funciona dentro de un
   navegador. Aquí se llama a la API REST de EmailJS con fetch, que funciona
   igual desde la app (mismas credenciales y misma plantilla).

   Solo se envía el correo de recuperación de contraseña: no hay código de
   verificación, así que no se genera ni se comprueba ningún código. */

const CREDENCIALES = {
    serviceId: 'service_1gni7ur',
    templateId: 'template_7zt83t2',
    publicKey: 'iprlsAmd7EMfq8ESB'
};

const API_REST = 'https://api.emailjs.com/api/v1.0/email/send';

/* Formato básico de correo: algo@algo.algo, sin espacios */
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function correoValido(correo) {
    return PATRON_CORREO.test(String(correo ?? '').trim());
}

/* fetch con tiempo máximo: si EmailJS no responde, se corta la petición */
function fetchConTimeout(url, opciones, ms) {
    const controlador = new AbortController();
    const reloj = setTimeout(() => controlador.abort(), ms);
    return fetch(url, { ...opciones, signal: controlador.signal }).finally(() => clearTimeout(reloj));
}

export async function enviarCodigo({ correo, nombre, tipo }) {
    const correoLimpio = String(correo ?? '').trim();
    const nombreLimpio = String(nombre ?? '').trim();

    // Validación previa: no se llama a EmailJS si el correo no tiene formato válido
    if (!correoValido(correoLimpio)) {
        console.error('[EmailJS] Correo inválido antes de enviar:', correoLimpio);
        return { error: 'El correo no tiene un formato válido' };
    }

    const templateParams = {
        correo_destino: correoLimpio,
        // Alias por si la plantilla de EmailJS usa otro nombre en el campo "To Email"
        to_email: correoLimpio,
        email: correoLimpio,
        to: correoLimpio,
        reply_to: correoLimpio,
        nombre_usuario: nombreLimpio || correoLimpio.split('@')[0],
        // Sin código de verificación: la variable queda vacía por si la
        // plantilla la incluye en el texto.
        codigo_verificacion: '',
        tipo_mensaje: tipo === 'recuperacion'
            ? 'Recuperación de contraseña'
            : 'Verificación de correo',
        mensaje: tipo === 'recuperacion'
            ? 'Solicitaste restablecer tu contraseña en Water Seven. Vuelve a la app para crear una nueva.'
            : 'Confirma tu correo electrónico en Water Seven.'
    };

    const cuerpo = JSON.stringify({
        service_id: CREDENCIALES.serviceId,
        template_id: CREDENCIALES.templateId,
        user_id: CREDENCIALES.publicKey,
        template_params: templateParams
    });

    const MAX_INTENTOS = 3;
    let ultimoError = null;

    for (let intento = 1; intento <= MAX_INTENTOS; intento += 1) {
        try {
            const respuesta = await fetchConTimeout(API_REST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: cuerpo
            }, 15000);

            if (respuesta.ok) {
                if (intento > 1) {
                    console.log(`[EmailJS] Correo enviado en el intento ${intento}/${MAX_INTENTOS}`);
                }
                return { ok: true };
            }

            const detalle = await respuesta.text();
            ultimoError = { status: respuesta.status, text: detalle };
            console.error(`[EmailJS] Error ${respuesta.status} (intento ${intento}/${MAX_INTENTOS}):`, detalle);

            // Error del cliente (4xx): repetirlo no va a ayudar
            if (respuesta.status < 500 && respuesta.status !== 429) break;
        } catch (error) {
            // Sin respuesta: problema de red o tiempo de espera agotado
            ultimoError = { status: 0, text: String(error?.message ?? error) };
            console.error(`[EmailJS] Sin conexión (intento ${intento}/${MAX_INTENTOS}):`, ultimoError.text);
        }

        if (intento < MAX_INTENTOS) {
            await new Promise(resolver => setTimeout(resolver, intento * 1200));
        }
    }

    if (!ultimoError || ultimoError.status === 0) {
        return { error: 'No pudimos conectar con EmailJS en este momento. Intenta de nuevo en unos minutos.' };
    }

    return { error: 'No pudimos enviar el correo en este momento. Intenta de nuevo en unos minutos.' };
}
