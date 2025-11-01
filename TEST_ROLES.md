# Guía de Testing - Sistema de Roles

## Configuración de Prueba

### 1. Preparar Datos de Prueba en Firestore

#### Usuario Normal
```javascript
// Colección: usuarios
// Documento: [uid_del_usuario]
{
  "nombre": "Usuario Normal",
  "email": "usuario@test.com",
  "rol": "usuario",
  "fechaRegistro": "2024-01-01",
  "tieneMensualidad": false
}
```

#### Usuario Admin
```javascript
// Colección: usuarios
// Documento: [uid_del_admin]
{
  "nombre": "Administrador",
  "email": "admin@test.com",
  "rol": "admin",
  "fechaRegistro": "2024-01-01",
  "tieneMensualidad": true,
  "tipoMensualidad": "Admin"
}
```

#### Usuario Profesional
```javascript
// Colección: profesionales
// Documento: [uid_del_profesional]
{
  "nombre": "Dr. Veterinario",
  "email": "vet@test.com",
  "tipoProfesional": "veterinario",
  "especialidad": "Medicina General",
  "telefono": "+56912345678",
  "direccion": "Av. Principal 123"
}
```

## Casos de Prueba

### Caso 1: Usuario Normal
**Objetivo**: Verificar que usuarios con rol "usuario" ven el dashboard normal

**Pasos**:
1. Iniciar sesión con usuario normal
2. Navegar a `/dashboard`
3. Verificar que se muestra `Dashboard.jsx`
4. Verificar que NO hay enlace "Admin" en el navbar

**Resultado Esperado**:
- ✅ Dashboard normal visible
- ✅ Funcionalidades de usuario disponibles
- ❌ No hay enlace "Admin" en navbar

### Caso 2: Usuario Admin
**Objetivo**: Verificar que usuarios con rol "admin" ven el dashboard administrativo

**Pasos**:
1. Iniciar sesión con usuario admin
2. Navegar a `/dashboard`
3. Verificar que se muestra `DashboardAdmin.jsx`
4. Verificar que SÍ hay enlace "Admin" en el navbar
5. Hacer clic en enlace "Admin"
6. Verificar que navega a `/dashboard-admin`

**Resultado Esperado**:
- ✅ DashboardAdmin visible
- ✅ Enlace "Admin" en navbar
- ✅ Navegación a `/dashboard-admin` funciona
- ✅ Todas las pestañas administrativas funcionan

### Caso 3: Usuario Sin Rol
**Objetivo**: Verificar comportamiento cuando usuario no tiene rol definido

**Pasos**:
1. Crear usuario sin campo "rol" en Firestore
2. Iniciar sesión
3. Navegar a `/dashboard`
4. Verificar comportamiento

**Resultado Esperado**:
- ✅ Se usa rol por defecto "usuario"
- ✅ Dashboard normal visible

### Caso 4: Acceso Directo a Dashboard Admin
**Objetivo**: Verificar protección de ruta `/dashboard-admin`

**Pasos**:
1. Iniciar sesión con usuario normal
2. Intentar navegar directamente a `/dashboard-admin`
3. Verificar redirección

**Resultado Esperado**:
- ✅ Usuario es redirigido a `/dashboard`
- ✅ No puede acceder al panel admin

### Caso 5: Usuario Profesional
**Objetivo**: Verificar que profesionales ven su dashboard específico

**Pasos**:
1. Iniciar sesión con usuario profesional
2. Navegar a `/dashboardProfesional`
3. Verificar funcionalidades

**Resultado Esperado**:
- ✅ DashboardProfesional visible
- ✅ Funcionalidades de profesional disponibles

## Verificación de Funcionalidades

### DashboardAdmin - Liquidaciones
- [ ] Tarjetas de resumen muestran datos correctos
- [ ] Tabla de liquidaciones es responsive
- [ ] Filtros de fecha funcionan
- [ ] Formateo de moneda correcto

### DashboardAdmin - Gestión de Usuarios
- [ ] Tabla de usuarios muestra datos simulados
- [ ] Filtros funcionan (rol, estado, mensualidad)
- [ ] Badges de colores correctos
- [ ] Botones de acción visibles

### DashboardAdmin - Estadísticas
- [ ] Tarjetas de estadísticas muestran datos
- [ ] Gráfico placeholder visible
- [ ] Responsive design funciona

### Navegación
- [ ] Pestañas cambian correctamente
- [ ] Estado activo se mantiene
- [ ] Transiciones suaves

## Comandos de Verificación

```bash
# Iniciar aplicación
npm run dev

# Verificar que no hay errores en consola
# Abrir DevTools > Console

# Verificar en Red (Network tab)
# - No hay errores 404
# - Firebase connections OK
```

## Debugging

### Verificar Rol en Consola
```javascript
// En DevTools Console
// Verificar datos del usuario
console.log('Datos usuario:', datosUsuario);
console.log('Rol:', datosUsuario?.rol);
```

### Verificar Contexto de Auth
```javascript
// En componente React
const { datosUsuario, isCargando } = useAuth();
console.log('Auth Context:', { datosUsuario, isCargando });
```

### Verificar Rutas
```javascript
// En DevTools Console
// Verificar ruta actual
console.log('Ruta actual:', window.location.pathname);
```

## Problemas Comunes

### 1. Dashboard no cambia
**Causa**: Datos de usuario no se cargan correctamente
**Solución**: Verificar `AuthContext` y `obtenerUsuarioPorUid`

### 2. Enlace Admin no aparece
**Causa**: Rol no es "admin" o datos no cargan
**Solución**: Verificar campo "rol" en Firestore

### 3. Redirección infinita
**Causa**: Lógica de protección de rutas incorrecta
**Solución**: Verificar `ProtectedRouteAdmin`

### 4. Datos simulados no aparecen
**Causa**: Error en renderizado de componentes
**Solución**: Verificar console por errores JavaScript

## Checklist Final

### Funcionalidad
- [ ] Usuario normal ve dashboard normal
- [ ] Usuario admin ve dashboard admin
- [ ] Enlace Admin aparece solo para admins
- [ ] Protección de rutas funciona
- [ ] Redirecciones correctas

### UI/UX
- [ ] Diseño responsive
- [ ] Tema claro/oscuro funciona
- [ ] Loading states correctos
- [ ] Transiciones suaves
- [ ] Iconos y colores apropiados

### Datos
- [ ] Datos simulados se muestran
- [ ] Formateo de moneda correcto
- [ ] Fechas en formato local
- [ ] Tablas responsive

### Navegación
- [ ] Pestañas funcionan
- [ ] Breadcrumbs correctos
- [ ] URLs apropiadas
- [ ] Historial de navegación

## Notas de Testing

- **Navegador**: Probar en Chrome, Firefox, Safari
- **Dispositivos**: Probar en móvil, tablet, desktop
- **Tema**: Probar modo claro y oscuro
- **Conectividad**: Probar con conexión lenta
- **Accesibilidad**: Verificar con lectores de pantalla 