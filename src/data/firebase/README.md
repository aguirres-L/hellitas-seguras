# Firebase Integration - Chapita Solidaria

## 📁 Estructura de Archivos

```
src/data/firebase/
├── firebaseConfig.js    # Configuración de Firebase
├── firebase.js          # Funciones CRUD
├── index.js             # Exportaciones centralizadas
├── ejemplos.js          # Ejemplos de uso
└── README.md           # Esta documentación
```

## 🔧 Configuración

### firebaseConfig.js
Contiene la configuración inicial de Firebase con:
- Firebase App
- Authentication
- Firestore Database

## 🚀 Funciones CRUD Disponibles

### 1. Crear Colección
```javascript
import { createCollectionFirebase } from '../data/firebase';

const id = await createCollectionFirebase('mascotas', {
  nombre: 'Luna',
  tipo: 'Perro',
  edad: 3
});
```

### 2. Añadir Datos
```javascript
import { addDataCollection } from '../data/firebase';

const id = await addDataCollection('mascotas', {
  nombre: 'Max',
  tipo: 'Gato',
  edad: 2
});
```

### 3. Eliminar Datos
```javascript
import { deleteDataCollection } from '../data/firebase';

await deleteDataCollection('mascotas', 'idDelDocumento');
```

### 4. Actualizar Datos
```javascript
import { updateDataCollection } from '../data/firebase';

await updateDataCollection('mascotas', 'idDelDocumento', {
  edad: 4,
  peso: 5.2
});
```

### 5. Obtener Todos los Datos
```javascript
import { getAllDataCollection } from '../data/firebase';

const mascotas = await getAllDataCollection('mascotas');
```

### 6. Obtener por ID
```javascript
import { getDataById } from '../data/firebase';

const mascota = await getDataById('mascotas', 'idDelDocumento');
```

### 7. Buscar por Campo
```javascript
import { searchDataByField } from '../data/firebase';

const mascotas = await searchDataByField('mascotas', 'propietario', 'usuario123');
```

### 8. Obtener Ordenados
```javascript
import { getDataOrdered } from '../data/firebase';

const mascotas = await getDataOrdered('mascotas', 'fechaCreacion', 'desc', 10);
```

## 🔐 Firebase Authentication

### Registro de Usuario
```javascript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, addDataCollection } from '../data/firebase';

// Crear usuario
const userCredential = await createUserWithEmailAndPassword(
  auth, 
  email, 
  password
);

// Actualizar perfil
await updateProfile(userCredential.user, {
  displayName: nombre
});

// Guardar datos adicionales en Firestore
await addDataCollection('usuarios', {
  uid: userCredential.user.uid,
  nombre: nombre,
  email: email,
  rol: 'usuario'
});
```

### Inicio de Sesión
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../data/firebase';

const userCredential = await signInWithEmailAndPassword(
  auth, 
  email, 
  password
);
```

## 📊 Estructura de Datos Recomendada

### Colección: usuarios
```javascript
{
  uid: "string",           // ID de Firebase Auth
  nombre: "string",
  email: "string",
  rol: "usuario|veterinario|peluquero",
  fechaRegistro: "timestamp",
  fechaActualizacion: "timestamp"
}
```

### Colección: mascotas
```javascript
{
  nombre: "string",
  tipo: "Perro|Gato|Otro",
  edad: "number",
  raza: "string",
  peso: "number",
  propietario: "string",   // uid del usuario
  fechaCreacion: "timestamp",
  fechaActualizacion: "timestamp"
}
```

### Colección: citas
```javascript
{
  mascotaId: "string",     // ID de la mascota
  veterinarioId: "string", // uid del veterinario
  fecha: "timestamp",
  motivo: "string",
  estado: "programada|completada|cancelada",
  notas: "string",
  fechaCreacion: "timestamp",
  fechaActualizacion: "timestamp"
}
```

## ⚠️ Mejores Prácticas

1. **Manejo de Errores**: Siempre usa try-catch en las operaciones async
2. **Validaciones**: Valida datos antes de enviar a Firebase
3. **Timestamps**: Usa `fechaCreacion` y `fechaActualizacion` automáticamente
4. **Seguridad**: Configura reglas de Firestore apropiadas
5. **Performance**: Usa `limit()` para consultas grandes

## 🔍 Ejemplos de Uso

Revisa el archivo `ejemplos.js` para ver ejemplos completos de:
- Gestión de mascotas
- Sistema de citas
- Validaciones
- Manejo de errores

## 📝 Notas Importantes

- Todas las funciones son asíncronas (async/await)
- Los timestamps se añaden automáticamente
- Los IDs de Firestore se generan automáticamente
- Las funciones incluyen logging para debugging 