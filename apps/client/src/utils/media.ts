/**
 * Media and Camera Utilities
 */

/**
 * Returns a user-friendly Spanish error message for camera access errors
 * @param error The error object from navigator.mediaDevices.getUserMedia
 */
export function getCameraErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle specific DOMException names
    if (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError'
    ) {
      return 'Permiso de cámara denegado. Por favor, habilita el acceso en la configuración del navegador.';
    }

    if (
      error.name === 'NotFoundError' ||
      error.name === 'DevicesNotFoundError'
    ) {
      return 'No se encontró ninguna cámara. Por favor, conecta una cámara e intenta de nuevo.';
    }

    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'La cámara está en uso por otra aplicación. Por favor, cierra otras apps que usen la cámara.';
    }

    if (
      error.name === 'OverconstrainedError' ||
      error.name === 'ConstraintNotSatisfiedError'
    ) {
      return 'La cámara no soporta la configuración solicitada.';
    }

    if (error.name === 'SecurityError') {
      return 'Acceso a cámara bloqueado. Esta función requiere HTTPS.';
    }

    // Return the actual error message for other errors if available
    if (error.message) {
      return `Error de cámara: ${error.message}`;
    }
  }

  return 'Error al acceder a la cámara. Por favor, intenta de nuevo.';
}
