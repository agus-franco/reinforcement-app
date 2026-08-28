# TESTEO.md — Cómo probar Rewire en un dispositivo real

Esto no lo puede hacer un modelo/agente por vos: `eas login` necesita tu cuenta de
Expo (gratis) y tu contraseña. El resto de los pasos sí se pueden pedir a un modelo
una vez que estés logueado.

## Android — APK instalable directo

```bash
npm i -g eas-cli
eas login
```

Desde `rewire/`:

```bash
eas build --profile preview --platform android
```

Tarda unos minutos (se buildea en la nube de Expo, gratis en el tier free). Al
terminar te da un link de descarga del `.apk`. Ese link:

- Se lo pasás a quien quieras testear (WhatsApp, mail, lo que sea).
- En el celular Android, hay que permitir "instalar apps de orígenes desconocidos"
  la primera vez (Android lo pide solo).
- Cada vez que haya cambios de código, correr el mismo comando de nuevo pide un
  nuevo APK. Como esto es Fase 0 (sin código nativo custom), en la mayoría de los
  casos alcanza con `eas update` (ver abajo) en vez de rebuildear todo.

## iOS — Expo Go (sin pagar cuenta de Apple)

No existe un ".apk para iOS" — Apple no permite instalar por fuera de sus canales.
Para testeo interno alcanza con Expo Go:

1. El tester instala "Expo Go" gratis desde el App Store.
2. Vos corrés, desde `rewire/`:
   ```bash
   npx expo start
   ```
   y le pasás el link/QR que aparece (o publicás una versión fija con `eas update`,
   ver abajo, así no depende de que tengas la terminal abierta).
3. Lo abre escaneando el QR con la cámara del iPhone (Expo Go se abre solo).

Esto funciona porque en Fase 0 no usamos ningún módulo nativo custom — todo corre en
el cliente estándar de Expo Go. El día que agreguemos algo como el bloqueo de apps
(Fase 3), esto deja de alcanzar y hace falta TestFlight + cuenta de desarrollador
Apple (USD 99/año).

## Actualizar sin rebuildear (`eas update`)

Para cambios de JS/TS (la enorme mayoría en Fase 0), no hace falta un build nuevo:

```bash
eas update --branch preview -m "descripción del cambio"
```

Esto empuja el cambio a quienes ya tienen el APK instalado o el proyecto abierto en
Expo Go — lo reciben solos la próxima vez que abran la app. Mucho más rápido que un
build completo.

## Qué anotar del testeo

Todo el feedback (bugs, cosas que no se entienden, ideas, "esto se siente raro") va
en [`FEEDBACK.md`](../FEEDBACK.md), en la carpeta del plan (no acá adentro). Fecha +
quién lo dijo + qué pasó. Ese archivo alimenta la Fase 1.

## Verificaciones pendientes en device real

Hechas por código, pero sin confirmar todavía en un dispositivo físico:

- [ ] La notificación diaria llega a la hora configurada (Android y iOS).
- [ ] Compartir genera una imagen que se ve bien al subirla a una story y al
      mandarla por WhatsApp.
- [ ] Los haptics se sienten bien (no muy fuertes/débiles) al tipear.
- [ ] El teclado de Android no muestra sugerencias de autocompletar durante la
      escritura (era el motivo del `keyboardType="visible-password"` en
      `sesion.tsx` — confirmar que sigue haciendo falta con el SDK actual).
