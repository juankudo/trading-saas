# Bitácora de Trading Pro — SaaS Web

Plataforma web cloud para traders: bitácora de operaciones, métricas avanzadas, gestión de cuentas de fondeo y calculadora de lotaje con modelo de suscripción recurrente y autenticación de usuarios.

---

## 🎯 Visión y Objetivos

Este repositorio contiene la versión **SaaS Web** de la Bitácora de Trading Pro:
- **Acceso web multiplataforma**: Accesible desde cualquier navegador sin instalación previa.
- **Autenticación y Cuentas de Usuario**: Sistema de registro, login (email/contraseña y Google OAuth) y recuperación de contraseña.
- **Persistencia en la Nube**: Base de datos multi-tenant en PostgreSQL (vía Supabase / backend API) con Row Level Security (RLS) para que cada usuario acceda exclusivamente a su información.
- **Monetización**: Sistema de suscripciones recurrentes (mensual / anual) integrado con pasarelas de pago (Stripe / Lemon Squeezy).
- **Herramientas incluidas**:
  - Bitácora de Trading (cuentas reales, backtesting, fases de fondeo, métricas globales).
  - Calculadora de Lotaje Pro (`calculadora/`).

---

## 🏗️ Arquitectura Técnica

1. **Frontend**:
   - `index.html`: Shell principal de la Bitácora.
   - `js/app.js`: Lógica de métricas, gráficos, filtros y operaciones.
   - `css/styles.css`: Estilos de la aplicación con soporte para tema claro/oscuro.
   - `calculadora/`: Calculadora de lotaje independiente.
2. **Backend & Base de Datos**:
   - **Base de Datos**: PostgreSQL gestionado (Supabase).
   - **Auth**: Gestión de sesiones seguras y tokens JWT.
   - **Storage**: Tablas `profiles`, `accounts`, `account_groups`, `trades` y `balance_snapshots`.
3. **Facturación**:
   - Checkout con Stripe / Lemon Squeezy.
   - Webhook para activación y suspensión automática de acceso según el estado del pago.

---

## 🚀 Inicio Rápido

*(En fase de configuración y desacople del almacenamiento local)*
