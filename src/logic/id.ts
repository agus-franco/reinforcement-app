/** Id local simple, sin dependencias. No necesita ser criptográficamente único: solo
 * distinguir registros dentro del storage de un mismo dispositivo. */
export function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
