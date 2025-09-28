import React, { useState, useEffect } from 'react';
import Tiendas from './Tiendas';
import { obtenerProfesionalesPorTipo } from '../data/firebase/firebase';

export default function TiendasEjemplo() {
  const [tiendas, setTiendas] = useState([]);
  const [isCargando, setIsCargando] = useState(true);

  // Cargar tiendas desde Firebase
  useEffect(() => {
    const cargarTiendas = async () => {
      try {
        setIsCargando(true);
        // Obtener profesionales de tipo "tienda"
        const tiendasCargadas = await obtenerProfesionalesPorTipo('tienda');
        setTiendas(tiendasCargadas);
      } catch (error) {
        console.error('Error al cargar tiendas:', error);
        // En caso de error, usar datos de ejemplo
        setTiendas([
          {
            id: 'ejemplo-1',
            nombre: 'Mascotas Felices',
            especialidad: 'Alimentos y Accesorios',
            direccion: 'Av. Principal 123, Centro',
            telefono: '123-456-7890',
            horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00',
            email: 'info@mascotasfelices.com',
            estado: 'activo'
          },
          {
            id: 'ejemplo-2',
            nombre: 'Pet Shop Premium',
            especialidad: 'Productos Premium',
            direccion: 'Calle Comercial 456, Norte',
            telefono: '098-765-4321',
            horario: 'Lun-Sáb: 8:00-20:00',
            email: 'contacto@petshoppremium.com',
            estado: 'activo'
          }
        ]);
      } finally {
        setIsCargando(false);
      }
    };

    cargarTiendas();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuentra las Mejores Tiendas</h1>
        <p className="text-gray-600">
          Descubre productos y descuentos increíbles para tu mascota
        </p>
      </div>

      <Tiendas 
        tiendas={tiendas} 
        isCargando={isCargando} 
      />
    </div>
  );
} 