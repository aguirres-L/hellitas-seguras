/**
 * Reglas de contraseña para registro (Huellitas Seguras).
 * Más de 8 caracteres (mínimo 9), al menos una letra mayúscula y un número.
 *
 * @param {string} contrasena
 * @returns {{
 *   esValido: boolean,
 *   longitudAceptable: boolean,
 *   tieneMayuscula: boolean,
 *   tieneNumero: boolean,
 * }}
 */
export function validarPasswordRegistro(contrasena) {
  const texto = contrasena ?? '';
  const longitudAceptable = texto.length > 8;
  const tieneMayuscula = /[A-ZÁÉÍÓÚÑ]/.test(texto);
  const tieneNumero = /\d/.test(texto);

  return {
    esValido: longitudAceptable && tieneMayuscula && tieneNumero,
    longitudAceptable,
    tieneMayuscula,
    tieneNumero,
  };
}
