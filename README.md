# 🌍 🐑 💸 LANA - Cross-Border Tourism Payment Platform
### *Democratizando los pagos internacionales, un QR a la vez*

```
╦   ╔═╗  ╔╗╔  ╔═╗
║   ╠═╣  ║║║  ╠═╣   Latin American Network
╩═╝ ╩ ╩  ╝╚╝  ╩ ╩   for Accessible payments
```

<div align="center">

![LANA Logo](./assets/images/logo-LANA-Hackaton.png)

[![Interledger](https://img.shields.io/badge/Powered%20by-Interledger-22C6B7?style=for-the-badge)](https://interledger.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

</div>

---

## La Idea: Rompiendo Barreras Financieras

### El Problema

Imagina ser un turista en un mercado local de México, encontrando productos artesanales únicos, pero enfrentándote a:
- ❌ **Comisiones bancarias del 3-5%** por conversión de moneda
- ❌ **Tiempos de espera de 2-5 días** para que el comerciante reciba su dinero
- ❌ **Tasas de cambio desfavorables** que benefician a los intermediarios
- ❌ **Exclusión financiera** de pequeños comerciantes sin acceso a terminales de pago

**Resultado:** El 67% de los pequeños comerciantes en mercados turísticos pierden ventas por no aceptar pagos digitales internacionales.

### Nuestra Solución: LANA

**LANA** (*Latin American Network for Accessible payments*) es una plataforma de pagos transfronterizos instantáneos que conecta turistas y comerciantes a través del protocolo **Interledger**, eliminando intermediarios y costos excesivos.

#### ¿Cómo funciona?

1. ** El Comerciante** genera un QR code con el monto a cobrar
2. ** El Turista** escanea el QR desde su wallet Interledger
3. ** Transferencia Instantánea** se realiza en segundos, sin intermediarios
4. ** Confirmación Inmediata** - El comerciante recibe su dinero al instante

```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│   Turista   │  Escanea  │ Protocolo    │  Paga     │ Comerciante │
│   (USA)     │────QR────▶│ Interledger  │──────────▶│   (México)  │
│   USD       │           │   ILP Node   │           │    MXN      │
└─────────────┘           └──────────────┘           └─────────────┘
 2-3 segundos                 0.5% fee                  Recibe MXN
```

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React Native)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  QR Scanner  │  │ Payment Flow │  │  Dashboard   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST API
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   API Layer  │  │ Auth Service │  │ QR Generator │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Open Payments API
┌────────────────────────────▼────────────────────────────────────┐
│                    INTERLEDGER PROTOCOL (ILP)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Rafiki Node  │  │  Connectors  │  │   Wallets    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

### Impacto Social

**LANA no es solo tecnología, es inclusión financiera:**

- **Empoderamiento Económico**: Damos acceso a pagos digitales a 2.5M de pequeños comerciantes en LATAM
- **Reducción de Pobreza**: Comerciantes reciben 97% del pago vs. 88% con métodos tradicionales
- **Liquidez Inmediata**: El dinero llega en segundos, no en días - crucial para negocios informales
- **Educación Financiera**: Interfaz simple que introduce a comerciantes a la economía digital
- **Turismo Sostenible**: Facilita el comercio justo directo con comunidades locales

#### Impacto Proyectado (Año 1)

| Métrica | Objetivo |
|---------|----------|
| Comerciantes activos | 50,000 |
| Transacciones mensuales | 1.2M |
| Ahorro acumulado en comisiones | $8.5M USD |
| Países LATAM cubiertos | 8 |
| Tiempo promedio de cobro | < 5 segundos |

---

##  Tecnología

### Stack Tecnológico

**Backend:**
-  **Node.js + Express**: API RESTful escalable
-  **Interledger Protocol**: Pagos transfronterizos instantáneos
-  **Open Payments**: Estándar de pagos abiertos
-  **QR Code Generation**: Códigos QR dinámicos y seguros

**Frontend:**
-  **React Native + Expo**: App nativa iOS/Android
-  **Diseño UX centrado en comerciantes**: Interfaz simple para usuarios no técnicos
-  **Expo Camera**: Escaneo rápido de QR
-  **Multi-idioma**: Español, Inglés, Portugués

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- **Node.js** v18+ ([Descargar aquí](https://nodejs.org/))
- **npm** o **yarn**
- **Expo CLI** (para el frontend móvil)
- **Cuenta Interledger** ([Crear aquí](https://rafiki.money/))

## Cómo Usar la App

### Para Comerciantes:

1. **Registro**: Crea tu cuenta y configura tu negocio
2. **Solicitar Pago**: Ingresa el monto y descripción
3. **Mostrar QR**: Presenta el código QR al turista
4. **Confirmar**: Recibe notificación instantánea del pago

### Para Turistas:

1. ** Escanear QR**: Usa la cámara para escanear el código del comerciante
2. ** Verificar**: Revisa monto y comerciante
3. ** Pagar**: Confirma desde tu wallet Interledger
4. ** ¡Listo!**: Transacción completada en segundos

---

## Aprendizajes

Durante este hackathon intensivo, nuestro equipo experimentó un viaje transformador:

**Técnicos:**
-  **Protocolo Interledger**: Aprendimos a implementar el stack completo de Open Payments, desde grants hasta incoming/outgoing payments. La curva de aprendizaje fue empinada, pero la documentación de la comunidad fue invaluable.
-  **Arquitectura de Pagos en Tiempo Real**: Descubrimos la complejidad de manejar estados de transacciones asíncronas y la importancia de un diseño robusto de manejo de errores.
-  **UX Simplificado**: La mayor lección fue que la tecnología debe ser invisible - diseñar para comerciantes con bajo conocimiento técnico nos obligó a repensar cada interacción.

**Humanos:**
-  **Empatía sobre Tecnología**: Entrevistamos a 15 comerciantes locales y aprendimos que la tecnología más brillante falla si no resuelve problemas reales. Sus historias sobre perder ventas por no aceptar pagos digitales nos motivaron cada noche.
-  **Impacto vs. Innovación**: Balancear innovación técnica con impacto social inmediato cambió nuestra perspectiva sobre qué significa "éxito" en tecnología.
-  **Colaboración Remota**: Coordinar desarrollo distribuido en 3 zonas horarias nos enseñó la importancia de documentación clara y comunicación asíncrona.
