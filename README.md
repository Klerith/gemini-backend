# Proyecto de API con NestJS y Google Gemini

Este README proporciona instrucciones para configurar y ejecutar el proyecto en un entorno de desarrollo local, así como una descripción de las tecnologías utilizadas.

## Prerrequisitos

Asegúrate de tener Node.js y npm (Node Package Manager) instalados en tu sistema. Puedes descargarlos e instalarlos desde [https://nodejs.org/](https://nodejs.org/).

## Pasos para ejecutar en local

Sigue estos pasos para poner en marcha el proyecto:

1.  **Clonar el repositorio:**
    Ejecuta el siguiente comando en tu terminal, reemplazando `<URL_DEL_REPOSITORIO>` con la URL real del repositorio y `<NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO>` con el nombre que desees para el directorio local:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO>
    ```

2.  **Crear y configurar el archivo de variables de entorno (`.env`):**
    Copia el archivo `.env.template` a un nuevo archivo llamado `.env`. Este archivo contendrá las variables de entorno específicas para tu configuración.
    ```bash
    cp .env.template .env
    ```
    Luego, abre el archivo `.env` con un editor de texto y actualiza las variables de entorno según sea necesario. Es **crucial** configurar la variable `GOOGLE_API_KEY` con tu clave de API válida de Google.

3.  **Instalar dependencias del proyecto:**
    Navega a la raíz del directorio del proyecto (si no estás ya allí) y ejecuta el siguiente comando para instalar todas las dependencias listadas en el archivo `package.json`:
    ```bash
    npm install
    ```

4.  **Ejecutar el servidor de desarrollo:**
    Una vez que todas las dependencias se hayan instalado correctamente, puedes iniciar el servidor de desarrollo con el siguiente comando:
    ```bash
    npm run start:dev
    ```

5.  **Acceder a la aplicación:**
    Si todo ha ido bien, la aplicación estará corriendo y accesible en tu navegador web a través de la siguiente dirección: `http://localhost:3000`.

## Stack Tecnológico Utilizado

Este proyecto se ha construido utilizando las siguientes tecnologías principales:

*   **[NestJS](https://nestjs.com/)**: Un framework progresivo de Node.js diseñado para construir aplicaciones del lado del servidor eficientes, confiables y escalables. En este proyecto, NestJS se utiliza como la estructura fundamental para desarrollar la API REST y gestionar la lógica de negocio.
*   **[TypeScript](https://www.typescriptlang.org/)**: Un superconjunto tipado de JavaScript que compila a JavaScript simple y plano. TypeScript se emplea para mejorar la calidad del código, facilitar la mantenibilidad a largo plazo y optimizar la experiencia de desarrollo mediante el tipado estático.
*   **[Google Gemini API](https://ai.google.dev/)**: Un modelo de lenguaje de última generación desarrollado por Google AI. En este proyecto, se integra para potenciar funcionalidades que requieren capacidades avanzadas de inteligencia artificial generativa.
