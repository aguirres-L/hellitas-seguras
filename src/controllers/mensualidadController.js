import { 
  getAllDataCollection, 
  updateDataCollection 
} from '../data/firebase/firebase';
import { 
  actualizarEstadoUsuario, 
  filtrarUsuariosConMensualidadVencida,
  filtrarUsuariosConMensualidadProximaVencer,
  renovarMensualidad,
  obtenerEstadoMensualidad
} from '../utils/mensualidadUtils';

/**
 * Controlador para gestionar mensualidades y estados de usuarios
 */
export class MensualidadController {
  constructor() {
    this.usuariosConMensualidadVencida = [];
    this.usuariosConMensualidadProximaVencer = [];
    this.estadisticasMensualidades = {
      totalUsuarios: 0,
      mensualidadesActivas: 0,
      mensualidadesVencidas: 0,
      mensualidadesProximasVencer: 0
    };
  }

  /**
   * Carga todos los usuarios y actualiza sus estados de mensualidad
   * @returns {Promise<Object>} Estadísticas de mensualidades
   */
  async cargarYActualizarEstadosUsuarios() {
    try {
      console.log('🔄 Iniciando verificación de mensualidades...');
      
      // Obtener todos los usuarios
      const todosUsuarios = await getAllDataCollection('usuarios');
      
      // Filtrar usuarios comunes (excluyendo superAdmin, admin, profesional)
      const usuariosComunes = todosUsuarios.filter(usuario => 
        usuario.rol !== 'superAdmin' && 
        usuario.rol !== 'admin' && 
        usuario.rol !== 'profesional'
      );

      console.log(`📊 Procesando ${usuariosComunes.length} usuarios comunes...`);

      // Actualizar estados de todos los usuarios
      const usuariosActualizados = usuariosComunes.map(usuario => 
        actualizarEstadoUsuario(usuario)
      );

      // Filtrar usuarios por estado de mensualidad
      this.usuariosConMensualidadVencida = filtrarUsuariosConMensualidadVencida(usuariosActualizados);
      this.usuariosConMensualidadProximaVencer = filtrarUsuariosConMensualidadProximaVencer(usuariosActualizados);

      // Calcular estadísticas
      this.estadisticasMensualidades = {
        totalUsuarios: usuariosComunes.length,
        mensualidadesActivas: usuariosActualizados.filter(u => u.isMember).length,
        mensualidadesVencidas: this.usuariosConMensualidadVencida.length,
        mensualidadesProximasVencer: this.usuariosConMensualidadProximaVencer.length
      };

      console.log('✅ Verificación de mensualidades completada:', this.estadisticasMensualidades);
      
      return {
        usuariosActualizados,
        estadisticas: this.estadisticasMensualidades,
        usuariosVencidos: this.usuariosConMensualidadVencida,
        usuariosProximosVencer: this.usuariosConMensualidadProximaVencer
      };

    } catch (error) {
      console.error('❌ Error al verificar mensualidades:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un usuario específico en la base de datos
   * @param {string} usuarioId - ID del usuario
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  async actualizarUsuarioEnBaseDatos(usuarioId, datosActualizados) {
    try {
      await updateDataCollection('usuarios', usuarioId, datosActualizados);
      console.log(`✅ Usuario ${usuarioId} actualizado en la base de datos`);
      return true;
    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${usuarioId}:`, error);
      return false;
    }
  }

  /**
   * Desactiva usuarios con mensualidades vencidas
   * @returns {Promise<Object>} Resultado de la operación
   */
  async desactivarUsuariosConMensualidadVencida() {
    try {
      console.log('🔒 Desactivando usuarios con mensualidades vencidas...');
      
      const resultados = [];
      
      for (const usuario of this.usuariosConMensualidadVencida) {
        const datosActualizados = {
          isMember: false,
          tipoMensualidad: false,
          fechaDesactivacion: new Date(),
          motivoDesactivacion: 'Mensualidad vencida'
        };

        const actualizado = await this.actualizarUsuarioEnBaseDatos(usuario.id, datosActualizados);
        
        resultados.push({
          usuarioId: usuario.id,
          email: usuario.email,
          nombre: usuario.displayName || usuario.nombre,
          actualizado,
          fechaVencimiento: usuario.fechaVencimientoMensualidad
        });
      }

      console.log(`✅ ${resultados.filter(r => r.actualizado).length} usuarios desactivados`);
      
      return {
        exitoso: true,
        usuariosDesactivados: resultados.filter(r => r.actualizado),
        errores: resultados.filter(r => !r.actualizado)
      };

    } catch (error) {
      console.error('❌ Error al desactivar usuarios:', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }

  /**
   * Renueva la mensualidad de un usuario específico
   * Después del período de gracia, cada renovación es de 1 mes
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Object>} Resultado de la renovación
   */
  async renovarMensualidadUsuario(usuarioId) {
    try {
      console.log(`🔄 Renovando mensualidad para usuario ${usuarioId}...`);
      
      // Obtener usuario actual
      const todosUsuarios = await getAllDataCollection('usuarios');
      const usuario = todosUsuarios.find(u => u.id === usuarioId);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Renovar mensualidad (1 mes desde ahora)
      const usuarioRenovado = renovarMensualidad(usuario);
      
      // Actualizar en base de datos
      const actualizado = await this.actualizarUsuarioEnBaseDatos(usuarioId, {
        isMember: usuarioRenovado.isMember,
        tipoMensualidad: usuarioRenovado.tipoMensualidad,
        fechaVencimientoMensualidad: usuarioRenovado.fechaVencimientoMensualidad,
        fechaUltimaRenovacion: usuarioRenovado.fechaUltimaRenovacion,
        estadoMensualidad: usuarioRenovado.estadoMensualidad,
        esGratis: usuarioRenovado.esGratis,
        tipoPeriodo: usuarioRenovado.tipoPeriodo
      });

      if (actualizado) {
        console.log(`✅ Mensualidad renovada para usuario ${usuarioId} (1 mes)`);
        return {
          exitoso: true,
          usuario: usuarioRenovado,
          mensaje: 'Mensualidad renovada exitosamente por 1 mes'
        };
      } else {
        throw new Error('Error al actualizar en base de datos');
      }

    } catch (error) {
      console.error(`❌ Error al renovar mensualidad para usuario ${usuarioId}:`, error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene alertas de mensualidades
   * @returns {Object} Alertas de mensualidades
   */
  obtenerAlertasMensualidades() {
    return {
      mensualidadesVencidas: {
        cantidad: this.usuariosConMensualidadVencida.length,
        usuarios: this.usuariosConMensualidadVencida.map(u => ({
          id: u.id,
          nombre: u.displayName || u.nombre,
          email: u.email,
          diasVencida: Math.abs(u.diasRestantesMensualidad || 0)
        }))
      },
      mensualidadesProximasVencer: {
        cantidad: this.usuariosConMensualidadProximaVencer.length,
        usuarios: this.usuariosConMensualidadProximaVencer.map(u => ({
          id: u.id,
          nombre: u.displayName || u.nombre,
          email: u.email,
          diasRestantes: u.diasRestantesMensualidad || 0
        }))
      }
    };
  }

  /**
   * Ejecuta verificación completa del sistema
   * @returns {Promise<Object>} Resultado completo de la verificación
   */
  async ejecutarVerificacionCompleta() {
    try {
      console.log('🚀 Iniciando verificación completa del sistema de mensualidades...');
      
      // 1. Cargar y actualizar estados
      const resultadoVerificacion = await this.cargarYActualizarEstadosUsuarios();
      
      // 2. Desactivar usuarios vencidos
      const resultadoDesactivacion = await this.desactivarUsuariosConMensualidadVencida();
      
      // 3. Obtener alertas
      const alertas = this.obtenerAlertasMensualidades();
      
      return {
        verificacion: resultadoVerificacion,
        desactivacion: resultadoDesactivacion,
        alertas,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en verificación completa:', error);
      return {
        exitoso: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// Instancia singleton del controlador
export const mensualidadController = new MensualidadController();
