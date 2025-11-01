# Sistema de Roles - Huellitas Seguras

## Descripción General

El sistema implementa un control de acceso basado en roles (RBAC) que determina qué dashboard y funcionalidades puede acceder cada usuario.

## Roles Disponibles

### 1. **usuario** (Rol por defecto)
- **Dashboard**: `Dashboard.jsx` (Dashboard normal)
- **Funcionalidades**:
  - Gestión de mascotas
  - Agendar citas veterinarias y de peluquería
  - Ver historial de citas
  - Acceso a tiendas
  - Configuración de perfil

### 2. **admin** (Rol administrativo)
- **Dashboard**: `DashboardAdmin.jsx` (Panel administrativo)
- **Funcionalidades**:
  - Liquidaciones mensuales
  - Gestión de usuarios
  - Estadísticas generales
  - Control de acceso administrativo
  - Todas las funcionalidades de usuario normal

### 3. **profesional** (Rol para veterinarios/peluqueros)
- **Dashboard**: `DashboardProfesional.jsx` (Dashboard profesional)
- **Funcionalidades**:
  - Búsqueda de mascotas por chip
  - Gestión de citas
  - Historial de atenciones
  - Gestión de tienda (si aplica)

## Implementación Técnica

### Componentes Principales

#### 1. `DashboardSelector.jsx`
```typescript
// Determina qué dashboard mostrar basado en el rol
const rol = datosUsuario?.rol || 'usuario';

switch (rol) {
  case 'admin':
    return <DashboardAdmin />;
  case 'usuario':
  default:
    return <Dashboard />;
}
```

#### 2. `ProtectedRouteAdmin.jsx`
```typescript
// Protege rutas que solo pueden acceder administradores
if (datosUsuario?.rol !== 'admin') {
  return <Navigate to="/dashboard" replace />;
}
```

#### 3. `AuthContext.jsx`
```typescript
// Proporciona datos del usuario incluyendo el rol
const valor = {
  usuario,
  datosUsuario, // Incluye el campo 'rol'
  tipoUsuario,
  // ... otros valores
};
```

### Rutas Configuradas

```jsx
// Ruta principal que selecciona automáticamente el dashboard
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardSelector />
  </ProtectedRoute>
} />

// Ruta específica para administradores
<Route path="/dashboard-admin" element={
  <ProtectedRouteAdmin>
    <DashboardAdmin />
  </ProtectedRouteAdmin>
} />
```

## Estructura de Datos

### Campo `rol` en Firestore
```javascript
// Documento de usuario en Firestore
{
  uid: "user123",
  nombre: "Juan Pérez",
  email: "juan@email.com",
  rol: "admin", // ← Campo que determina el rol
  // ... otros campos
}
```

### Valores Posibles del Rol
- `"usuario"` - Usuario normal (por defecto)
- `"admin"` - Administrador
- `"profesional"` - Veterinario/Peluquero

## Navegación

### Enlace en Navbar
Los usuarios con rol `admin` ven un enlace adicional en el navbar:
```jsx
{datosUsuario?.rol === 'admin' && (
  <Link to="/dashboard-admin">
    <svg>...</svg>
    Admin
  </Link>
)}
```

## Seguridad

### Protección de Rutas
1. **Autenticación**: Todas las rutas requieren estar autenticado
2. **Autorización**: Rutas específicas verifican el rol del usuario
3. **Redirección**: Usuarios sin permisos son redirigidos automáticamente

### Validación en Cliente y Servidor
- **Cliente**: Verificación inmediata para UX
- **Servidor**: Validación en Firebase Security Rules (recomendado)

## Datos Simulados

### Liquidaciones Mensuales
```javascript
const liquidacionesMensuales = [
  {
    mes: 'Enero 2024',
    ingresosTotales: 1250000,
    gastosOperacionales: 450000,
    comisiones: 125000,
    gananciaNeta: 675000,
    usuariosNuevos: 45,
    citasRealizadas: 234
  }
  // ... más datos
];
```

### Usuarios Simulados
```javascript
const usuariosSimulados = [
  {
    id: '1',
    nombre: 'María González',
    email: 'maria@email.com',
    rol: 'usuario',
    tieneMensualidad: true,
    tipoMensualidad: 'Premium',
    estado: 'activo'
  }
  // ... más usuarios
];
```

## Próximos Pasos

### 1. Implementar Firebase Security Rules
```javascript
// Ejemplo de reglas de seguridad
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo admins pueden leer todos los usuarios
    match /usuarios/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin');
    }
  }
}
```

### 2. Conectar Datos Reales
- Reemplazar datos simulados con consultas a Firestore
- Implementar funciones para liquidaciones reales
- Crear sistema de gestión de usuarios

### 3. Funcionalidades Adicionales
- Gestión de permisos granulares
- Logs de auditoría
- Notificaciones por rol
- Dashboard personalizable

## Testing

### Casos de Prueba
1. **Usuario normal**: Debe ver Dashboard normal
2. **Admin**: Debe ver DashboardAdmin y enlace en navbar
3. **Sin rol**: Debe usar rol por defecto "usuario"
4. **Rol inválido**: Debe redirigir a dashboard normal

### Comandos de Prueba
```bash
# Verificar que el sistema funciona
npm run dev
# Probar diferentes roles en Firestore
```

## Notas Importantes

- El rol se lee desde `datosUsuario.rol` en el contexto de autenticación
- Si no hay rol definido, se usa "usuario" por defecto
- Los cambios de rol requieren actualizar Firestore manualmente
- El sistema es escalable para agregar nuevos roles 