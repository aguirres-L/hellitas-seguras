# Configuración de APIs de IA

Este documento explica cómo configurar las APIs de IA para generar consejos personalizados de cuidado para mascotas.

## APIs Utilizadas

### 1. Hugging Face (Principal)
- **Modelo**: `microsoft/DialoGPT-medium`
- **Costo**: Gratuito (30,000 requests/mes)
- **Uso**: Generación de consejos de cuidado personalizados

### 2. Cohere (Fallback)
- **Modelo**: `command`
- **Costo**: 100K tokens gratis/mes
- **Uso**: Respaldo cuando Hugging Face no está disponible

## Configuración

### Paso 1: Obtener Tokens de API

#### Hugging Face
1. Ve a [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Crea un nuevo token con permisos de lectura
3. Copia el token

#### Cohere
1. Ve a [Cohere Dashboard](https://dashboard.cohere.ai/)
2. Crea una cuenta o inicia sesión
3. Ve a la sección "API Keys"
4. Genera una nueva API key
5. Copia la API key

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Hugging Face API Token
VITE_HUGGING_FACE_TOKEN=tu_token_aqui

# Cohere API Key
VITE_COHERE_API_KEY=tu_api_key_aqui
```

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
```

## Funcionamiento

### Flujo de Generación de Consejos

1. **Usuario hace clic en "Generar Consejos"**
2. **Verificación de cache**: Se verifica si ya existen consejos para esa raza
3. **Llamada a Hugging Face**: Si no hay cache, se intenta con Hugging Face
4. **Fallback a Cohere**: Si Hugging Face falla, se usa Cohere
5. **Consejos predefinidos**: Si ambas APIs fallan, se usan consejos predefinidos
6. **Cache**: La respuesta se guarda en cache por 24 horas

### Tipos de Consejos Generados

#### Para Perros Mestizos
- Alimentación adaptada al tamaño y actividad
- Ejercicio según nivel de energía
- Salud general y prevención
- Comportamiento y socialización

#### Para Razas Específicas
- Características particulares de la raza
- Necesidades específicas de cuidado
- Problemas de salud comunes
- Comportamiento típico

## Monitoreo y Debugging

### Verificar Configuración
```javascript
import { verificarConfiguracionAPIs } from './src/config/apiKeys';

// En la consola del navegador
verificarConfiguracionAPIs();
```

### Logs de Debug
Los errores y llamadas a API se registran en la consola del navegador.

## Limitaciones

### Hugging Face
- 30,000 requests/mes gratis
- Puede tener latencia variable
- Modelo básico de generación de texto

### Cohere
- 100K tokens gratis/mes
- Mejor calidad de texto
- Más estable

## Troubleshooting

### Error: "API token no configurado"
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor de desarrollo

### Error: "API error: 401"
- Verifica que el token/API key sea correcto
- Asegúrate de que la API key tenga los permisos necesarios

### Error: "API error: 429"
- Has excedido el límite de requests
- Espera hasta el próximo mes o considera upgrade

### Consejos no se generan
- Verifica la conexión a internet
- Revisa la consola para errores específicos
- Los consejos predefinidos siempre están disponibles como fallback

## Mejoras Futuras

- [ ] Implementar más modelos de IA
- [ ] Agregar métricas de uso
- [ ] Implementar cache persistente
- [ ] Agregar más idiomas
- [ ] Personalización por ubicación geográfica
