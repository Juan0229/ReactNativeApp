/* Guarda y recupera los datos de la app (mockData) en AsyncStorage.
   Así las cuentas nuevas, las fotos de perfil y las publicaciones no se
   pierden al cerrar la app, igual que en la web con localStorage. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { snapshotDatos, restaurarDatos } from '../data/mockData';

const CLAVE = 'waterseven_datos_v1';

let cargada = false;
let colaGuardado = Promise.resolve();

/* Carga una sola vez al arrancar; si no hay nada guardado se quedan los
   datos de ejemplo que trae mockData. */
export async function cargarDatos() {
    if (cargada) return;
    try {
        const bruto = await AsyncStorage.getItem(CLAVE);
        if (bruto) restaurarDatos(JSON.parse(bruto));
    } catch (e) {
        console.warn('[persistencia] No se pudieron cargar los datos:', e);
    } finally {
        cargada = true;
    }
}

/* Guardado en cola: si llegan varios de golpe se hacen en orden y sin
   pisarse (por ejemplo, publicar y cambiar la foto a la vez). */
export function guardarDatos() {
    if (!cargada) return Promise.resolve();
    colaGuardado = colaGuardado
        .then(() => AsyncStorage.setItem(CLAVE, JSON.stringify(snapshotDatos())))
        .catch((e) => console.warn('[persistencia] No se pudieron guardar los datos:', e));
    return colaGuardado;
}
