// Solo assets usados por `datosSlides` (el archivo anterior importaba decenas de imágenes sin uso)
import uno from '../../../assets/7.png';
import dos from '../../../assets/8.png';
import tres from '../../../assets/9.png';
import cuatro from '../../../assets/10.png';
import cinco from '../../../assets/11.png';
import seis from '../../../assets/12.png';
import siete from '../../../assets/13.png';
import ocho from '../../../assets/14.png';
import videoChapita from '../../../assets/chapita-v.mp4';
import pet from '../../../assets/pets/slider.png';
import pet1 from '../../../assets/pets/slider1.png';
import pet2 from '../../../assets/pets/slider2.png';
import pet3 from '../../../assets/pets/slider3.png';
import pet4 from '../../../assets/pets/slider4.png';
import pet5 from '../../../assets/pets/slider5.png';
import pet6 from '../../../assets/pets/slider6.png';
import pet8 from '../../../assets/pets/slider8.png';
import rescate1 from '../../../assets/121.PNG';
import rescate2 from '../../../assets/aa.PNG';
import rescate3 from '../../../assets/cc.PNG';

import milo from '../../../assets/model_IA/milo.jpeg';
import milo2 from '../../../assets/model_IA/milo2.jpeg';
import nicky from '../../../assets/model_IA/nicky.jpeg';
import nicky2 from '../../../assets/model_IA/nicky2.jpeg';
import rocco from '../../../assets/model_IA/roco.jpeg';
import rocco2 from '../../../assets/model_IA/roco2.jpeg';
import lore from '../../../assets/model_IA/lore.jpeg';
import lore2 from '../../../assets/model_IA/lore2.jpeg';


const modelosWithIA = [milo2 , nicky , rocco , lore, milo, nicky2, rocco2, lore2];
const urlPlacasLáser = [uno, cinco, dos, seis, tres, siete, cuatro, ocho];
const urlVideoQr = videoChapita;
const urlPets = [pet, pet1, pet2, pet3, pet4, pet5, pet6, pet8];
const urlRescate = [rescate1, rescate2, rescate3];

export const datosSlides = [
  {
    id: 1,
    titulo: 'Identidad para quien más querés',
    descripcion:
      'Placas únicas grabadas con láser, donde el nombre y la silueta de tu mascota se convierten en arte.',
    caracteristicas: [
      'Personalización exacta: Transformamos una foto en una ilustración grabada para siempre.',
      'Durabilidad premium: Materiales resistentes a agua, sol y arañazos.',
      'Más que un accesorio: un tributo a su esencia.',
    ],
    imagenUrl: modelosWithIA,
    isVideo: false,
    imagenAlt: 'Placa grabada con láser personalizada',
  },
  {
    id: 2,
    titulo: 'Reencuentros más rápidos, menos preocupaciones',
    descripcion:
      'Cada placa incluye un código QR indestructible que conecta al perfil digital de tu mascota.',
    caracteristicas: [
      'Datos vitales en crisis: Contacto del dueño disponible al instante cuando más se necesita.',
      'Actualización instantánea: Modifica la información en segundos sin cambiar la placa física.',
      'Tecnología avanzada que protege lo que más amas en todo momento.',
    ],
    imagenUrl: urlVideoQr,
    isVideo: true,
    imagenAlt: 'Persona escaneando QR de la placa',
  },
  {
    id: 3,
    titulo: 'Cuidado completo en una plataforma',
    descripcion: 'Acceso a nuestro sistema de citas con profesionales registrados en nuestra plataforma.',
    caracteristicas: [
      'Consejos con IA: Recibe recomendaciones personalizadas para el cuidado de tu mascota.',
      'Citas profesionales: Agenda con veterinarios y peluqueros registrados en la plataforma.',
      'Tienda virtual: Explora y compra productos de petshop con descuentos exclusivos.',
    ],
    imagenUrl: urlPets,
    isVideo: false,
    imagenAlt: 'App mostrando agenda de citas veterinarias',
  },
  {
    id: 4,
    titulo: 'Cuando ganan, todos ganamos',
    descripcion: 'Elegir nuestras placas es sumarse a un círculo virtuoso de ayuda.',
    caracteristicas: [
      'Parte de cada compra se transforma en ayuda directa para animales necesitados.',
      'Juntos hacemos que cada rastro lleve a casa de forma segura y confiable.',
      'Tu compra impulsa proyectos de bienestar animal en toda la comunidad.',
    ],
    imagenUrl: urlRescate,
    isVideo: false,
    imagenAlt: 'Placa con huellas y símbolo de corazón',
  },
];
