// Función para generar QR code usando QR Server API (más confiable)
const generarQRCode = (url, mascotaNombre) => {
    // QR Server es gratuito y confiable
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrUrl;
  };
  
  // Función para descargar el QR code
  export const descargarQRCode = (mascotaNombre, mascotaId) => {
    const urlPerfil = `https://huellitas-seguras.online/pet/${mascotaId}`;
    const qrUrl = generarQRCode(urlPerfil, mascotaNombre);
    
    // Crear un elemento temporal para descargar
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${mascotaNombre}-${mascotaId}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Función adicional para mostrar preview del QR
  export const mostrarPreviewQR = (mascotaNombre, mascotaId) => {
    const urlPerfil = `https://huellitas-seguras.online/pet/${mascotaId}`;
    const qrUrl = generarQRCode(urlPerfil, mascotaNombre);
    
    return {
      url: qrUrl,
      mascotaNombre,
      mascotaId,
      urlPerfil
    };
  };