# Sistema de Control de Mensualidades - Huellitas Seguras

## 📋 Descripción General

El sistema de control de mensualidades permite gestionar automáticamente el acceso de los usuarios a la plataforma basándose en un **período de gracia de 3 meses gratis** seguido de **cobros mensuales de 1 mes**. El sistema calcula fechas de vencimiento, controla estados y proporciona alertas para usuarios con mensualidades vencidas o próximas a vencer.

## 🎯 Características Principales

### 1. **Período de Gracia de 3 Meses Gratis**
- Los primeros 3 meses desde el registro son completamente gratis
- No se requiere pago durante este período
- El usuario mantiene acceso completo a la plataforma

### 2. **Cobros Mensuales Después del Período de Gracia**
- Después de los 3 meses gratis, cada renovación es de 1 mes
- Se requiere pago mensual para mantener el acceso
- Maneja diferentes formatos de fecha (Firebase Timestamp, Date, string)

### 3. **Control de Estados**
- **Período de Gracia**: Usuario en los primeros 3 meses gratis
- **Activa**: Usuario con mensualidad vigente (después del período de gracia)
- **Próxima a vencer**: Mensualidad que vence en 7 días o menos
- **Vencida**: Mensualidad que ya expiró

### 4. **Alertas Automáticas**
- Identifica usuarios en período de gracia
- Identifica usuarios con mensualidades vencidas
- Identifica usuarios con mensualidades próximas a vencer
- Proporciona contadores visuales en el dashboard

### 5. **Gestión de Usuarios**
- Desactivación automática de usuarios con mensualidades vencidas
- Renovación manual de mensualidades (1 mes por renovación)
- Actualización automática de estados en la base de datos

## 🛠️ Archivos del Sistema

### `src/utils/mensualidadUtils.js`
Contiene todas las funciones utilitarias para el manejo de mensualidades:

- `calcularFechaVencimiento()`: Calcula fecha de vencimiento (3 meses gratis + 1 mes cobro)
- `verificarPeriodoGracia()`: Verifica si está en período de gracia
- `esMensualidadVencida()`: Verifica si está vencida
- `esMensualidadProximaVencer()`: Verifica si está próxima a vencer
- `calcularDiasRestantes()`: Calcula días restantes
- `obtenerEstadoMensualidad()`: Obtiene estado completo con colores
- `actualizarEstadoUsuario()`: Actualiza estado del usuario
- `renovarMensualidad()`: Renueva mensualidad (1 mes)

### `src/controllers/mensualidadController.js`
Controlador principal que gestiona todas las operaciones:

- `cargarYActualizarEstadosUsuarios()`: Carga y actualiza estados
- `desactivarUsuariosConMensualidadVencida()`: Desactiva usuarios vencidos
- `renovarMensualidadUsuario()`: Renueva mensualidad específica
- `ejecutarVerificacionCompleta()`: Ejecuta verificación completa del sistema

## 🎮 Cómo Usar el Sistema

### 1. **Verificación Manual de Mensualidades**
```javascript
// En el DashboardSuperAdmin, hacer clic en "Verificar Mensualidades"
// Esto ejecutará:
const resultado = await mensualidadController.ejecutarVerificacionCompleta();
```

### 2. **Renovación de Mensualidad**
```javascript
// Renovar mensualidad de un usuario específico (1 mes)
await mensualidadController.renovarMensualidadUsuario(usuarioId);
```

### 3. **Verificación de Estado de Usuario**
```javascript
import { obtenerEstadoMensualidad } from '../utils/mensualidadUtils';

const estado = obtenerEstadoMensualidad(usuario);
console.log(estado.estado); // 'periodo_gracia', 'activa', 'proxima_vencer', 'vencida'
console.log(estado.diasRestantes); // días restantes
console.log(estado.color); // clases CSS para UI
console.log(estado.esGratis); // true si está en período de gracia
```

## 📊 Interfaz de Usuario

### Panel de Control de Mensualidades
- **Ubicación**: DashboardSuperAdmin, parte superior
- **Funcionalidades**:
  - Contador de usuarios en período de gracia (3 meses gratis)
  - Contador de mensualidades vencidas
  - Contador de mensualidades próximas a vencer
  - Lista de usuarios que requieren atención
  - Botón de verificación manual
  - Botones de renovación rápida (1 mes)

### Tabla de Usuarios
- **Columna "Mensualidad"**: Muestra estado con colores
  - 🔵 Azul: Período de gracia (3 meses gratis)
  - 🟢 Verde: Activa (después del período de gracia)
  - 🟡 Amarillo: Próxima a vencer  
  - 🔴 Rojo: Vencida
- **Columna "Acciones"**: Botón "Renovar" para usuarios con problemas (1 mes)

## 🔧 Configuración

### Duración de Período de Gracia
```javascript
// El período de gracia está fijo en 3 meses
// No se puede cambiar sin modificar el código
const periodoGracia = verificarPeriodoGracia(fechaRegistro);
```

### Días de Alerta
```javascript
// Cambiar días antes del vencimiento para alertar
const estaProximaVencer = esMensualidadProximaVencer(fechaVencimiento, 14); // 14 días
```

### Días de Gracia
```javascript
// Cambiar días de gracia antes de desactivar
const estaVencida = esMensualidadVencida(fechaVencimiento, 3); // 3 días de gracia
```

## 🚨 Alertas y Notificaciones

### Tipos de Alertas
1. **Período de Gracia**: Usuarios en los primeros 3 meses gratis
2. **Mensualidades Vencidas**: Usuarios que deben ser desactivados
3. **Próximas a Vencer**: Usuarios que requieren renovación pronto

### Colores de Estado
- **Azul**: `bg-blue-100 text-blue-800` - Período de gracia (3 meses gratis)
- **Verde**: `bg-green-100 text-green-800` - Mensualidad activa
- **Amarillo**: `bg-yellow-100 text-yellow-800` - Próxima a vencer
- **Rojo**: `bg-red-100 text-red-800` - Vencida

## 📈 Flujo de Trabajo Recomendado

### Diario
1. Revisar el panel de alertas en el dashboard
2. Verificar usuarios con mensualidades próximas a vencer
3. Contactar usuarios con mensualidades vencidas

### Semanal
1. Ejecutar verificación completa del sistema
2. Revisar y actualizar estados de usuarios
3. Procesar renovaciones pendientes

### Mensual
1. Revisar estadísticas generales
2. Analizar patrones de renovación
3. Optimizar procesos de cobranza

## 🔒 Seguridad y Validaciones

- Todas las operaciones incluyen validación de datos
- Los errores se registran en la consola
- Las actualizaciones en la base de datos son atómicas
- Se mantiene un log de todas las operaciones

## 🐛 Solución de Problemas

### Error: "Usuario no encontrado"
- Verificar que el ID del usuario sea correcto
- Confirmar que el usuario existe en la colección 'usuarios'

### Error: "Error al actualizar en base de datos"
- Verificar permisos de Firebase
- Confirmar que la función `updateDocument` esté funcionando

### Estados no se actualizan
- Ejecutar verificación manual desde el dashboard
- Verificar que las fechas de registro sean válidas

## 📝 Notas Importantes

1. **Fechas de Registro**: El sistema usa `fechaRegistro` o `fechaCreacion` como base para calcular vencimientos
2. **Usuarios Excluidos**: SuperAdmin, Admin y Profesionales no están sujetos al sistema de mensualidades
3. **Actualizaciones**: Los cambios se reflejan inmediatamente en la UI
4. **Backup**: Siempre hacer backup antes de ejecutar verificaciones masivas

## 🔄 Futuras Mejoras

- [ ] Notificaciones por email automáticas
- [ ] Integración con sistema de pagos
- [ ] Reportes de mensualidades
- [ ] Configuración de períodos de gracia por usuario
- [ ] Historial de renovaciones
- [ ] Alertas push para administradores
