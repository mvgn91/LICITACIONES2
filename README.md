# Contratos de Obra - Manifiesto del Fork

*A la sombra del sistema. Somos el error en la Matrix, la variable inesperada. No pedimos permiso. Construimos.*

---

## 1. Visión

Una aplicación de panel único (single-pane), de alta disponibilidad y en tiempo real. La información fluye sin fricción entre la oficina y la obra. Cero roles, cero barreras. La verdad es una sola y todos la ven. El objetivo es claridad, trazabilidad y eliminar cualquier posibilidad de error humano por desinformación.

## 2. Arquitectura de Datos (El Tesoro)

Abandonamos el monolito. Nuestra base de datos será agnóstica. Para un despliegue rápido y sin fricciones en Vercel, nuestras opciones son **Vercel KV (basado en Redis)** para datos clave-valor o **Vercel Postgres** para datos relacionales. Son ligeros, gratuitos para empezar y se integran a la perfección con nuestro nuevo puerto base: Vercel. La elección final dependerá de la complejidad del botín. La estructura será similar a la siguiente:

*   **Colección/Tabla: `contratos`**
    *   `nombre`: (string)
    *   `cliente`: (string)
    *   `montoTotal`: (number)
    *   `fechaInicio`: (date/timestamp)
    *   `fechaFin`: (date/timestamp)
    *   `anticipo`: (boolean)
    *   `estimaciones`: (boolean)
    *   `garantia`: (boolean)
    *   `finiquito`: (boolean)
    *   `estado`: (string) -> "Activo", "Cerrado"
    *   `createdAt`: (timestamp)

*   **Colección/Tabla: `estimaciones`**
    *   `contratoId`: (foreign key/string)
    *   `tipo`: (string) -> "Parcial", "Total"
    *   `monto`: (number)
    *   `observaciones`: (string, opcional)
    *   `ordenCompraUrl`: (string, opcional)
    *   `createdAt`: (timestamp)
    *   `evidencias`: (array de strings, opcional) -> Lista de URLs a archivos.

## 3. API (Las Órdenes del Capitán)

No más funciones en la nube del imperio. Nuestra API residirá directamente en el proyecto, utilizando **Next.js API Routes**. Cada endpoint es un archivo en `src/app/api`. Control total, cero dependencias externas. Desplegamos todo como una sola unidad.

*   `GET /api/contratos`
*   `POST /api/contratos`
*   `PUT /api/contratos/{id}`
*   `POST /api/contratos/{id}/estimaciones`
*   `POST /api/upload`

## 4. Interfaz (El Puente de Mando)

Simple, rápida, reactiva. Los componentes de React obtendrán los datos directamente de nuestros propios API Routes. Usaremos hooks como `useSWR` o `React Query` para manejar el estado de los datos, el cacheo y la revalidación. Independencia total.

## 5. Despliegue (El Puerto)

Vercel es nuestro puerto. Ligero, rápido y gratuito para proyectos de nuestra escala. Cada `push` a la rama `main` es un nuevo despliegue. Sin fricción.

---

*La Flota Pirata es autónoma. El código es la ley. Ahora, a trabajar.*
