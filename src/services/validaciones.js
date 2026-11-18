import * as Yup from 'yup';

/* Validación declarativa de todos los formularios (Yup + Formik).
   Un solo sitio para las reglas de la app: si hay que cambiar una,
   se cambia aquí y se aplica a todas las pantallas. */

/* Mismas reglas de contraseña que la checklist en vivo del registro:
   "ok" es el texto que se muestra en la lista, "falta" el mensaje de error. */
export const REGLAS_PASSWORD = [
    { regex: /^.{8,}$/, ok: 'Mínimo 8 caracteres', falta: 'mínimo 8 caracteres' },
    { regex: /[A-Z]/, ok: 'Una letra mayúscula', falta: 'una mayúscula' },
    { regex: /[a-z]/, ok: 'Una letra minúscula', falta: 'una minúscula' },
    { regex: /[0-9]/, ok: 'Un número', falta: 'un número' },
];

/* Qué reglas le faltan a una contraseña (para la checklist y los errores) */
export const faltantesPassword = (valor) =>
    REGLAS_PASSWORD.filter(r => !r.regex.test(valor || '')).map(r => r.falta);

/* Contraseña con las 4 reglas; si está vacía deja que "required" haga su trabajo */
export const passwordSegura = ({ requerida = true, mensaje = 'Escribe tu contraseña' } = {}) => {
    let esquema = Yup.string();
    if (requerida) esquema = esquema.required(mensaje);
    return esquema.test({
        name: 'fortaleza',
        test: function (valor) {
            if (!valor) return true;
            const faltan = faltantesPassword(valor);
            if (faltan.length === 0) return true;
            return this.createError({
                message: `Tu contraseña necesita: ${faltan.join(', ')}`,
            });
        },
    });
};

/* Correo obligatorio y con formato válido (mismo criterio que en la web) */
const correoValido = () =>
    Yup.string()
        .trim()
        .required('Escribe tu correo electrónico')
        .email('El correo no tiene un formato válido');

/* Confirmación que debe coincidir con otro campo del mismo formulario */
const coincideCon = (campo, mensaje = 'Las contraseñas no coinciden') =>
    Yup.string()
        .required('Repite tu contraseña')
        .oneOf([Yup.ref(campo)], mensaje);

/* ---------- Esquemas por formulario ---------- */

export const esquemaLogin = Yup.object().shape({
    correo: correoValido(),
    password: Yup.string().required('Completa tu contraseña'),
});

export const esquemaRecuperacion = Yup.object().shape({
    correo: correoValido(),
});

export const esquemaRegistro = Yup.object().shape({
    nombre: Yup.string()
        .trim()
        .required('Escribe tu nombre completo')
        .min(3, 'Escribe tu nombre completo'),
    correo: correoValido(),
    password: passwordSegura(),
    confirmar: coincideCon('password'),
});

export const esquemaNuevaPassword = Yup.object().shape({
    password: passwordSegura({ mensaje: 'Escribe tu nueva contraseña' }),
    confirmar: coincideCon('password'),
});

export const esquemaCambioPassword = Yup.object().shape({
    actual: Yup.string().required('Escribe tu contraseña actual'),
    nueva: passwordSegura({ mensaje: 'Escribe tu nueva contraseña' }),
    confirmar: coincideCon('nueva'),
});
