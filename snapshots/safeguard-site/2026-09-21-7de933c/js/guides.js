// ── Guide content (bilingual EN/ES) ─────────────────────────
// Each guide: id, category, icon, updated, title, subtitle, sections[]
// Section: heading, paragraphs[] (each {en,es}), steps[], tip?, warning?, link?

export const categories = ['apple', 'google', 'passwords', 'mobile', 'browser', 'network', 'data', 'travel'];

export const guides = [
  // ─── 1. Apple / iCloud Account Hardening ───────────────────
  {
    id: 'apple-account',
    category: 'apple',
    icon: 'apple',
    updated: '2026-03',
    title: {
      en: 'Secure Your Apple Account',
      es: 'Protege Tu Cuenta de Apple',
    },
    subtitle: {
      en: 'Recovery contacts, trusted devices, 2FA, security keys, and Find My',
      es: 'Contactos de recuperacion, dispositivos de confianza, 2FA, llaves de seguridad y Buscar',
    },
    sections: [
      {
        heading: { en: 'Recovery Contact', es: 'Contacto de Recuperacion' },
        paragraphs: [
          {
            en: 'Add a trusted person (partner, family member) as your [recovery contact](https://support.apple.com/en-us/102631). If you lose access to all your devices, this person can verify your identity and help you regain access without waiting days.',
            es: 'Agrega a una persona de confianza (pareja, familiar) como [contacto de recuperacion](https://support.apple.com/es-es/102631). Si pierdes acceso a todos tus dispositivos, esta persona puede verificar tu identidad y ayudarte a recuperar acceso sin esperar dias.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > Sign-In & Security > Account Recovery', es: 'Ajustes > [tu nombre] > Inicio de sesion y seguridad > Recuperacion de la cuenta' },
          { en: 'Tap "Add Recovery Contact"', es: 'Toca "Agregar contacto de recuperacion"' },
          { en: 'Choose a contact and send the request', es: 'Elige un contacto y envia la solicitud' },
        ],
        tip: {
          en: 'Pick someone who also uses Apple devices, they need iOS 15+ or macOS Monterey+ to accept.',
          es: 'Elige a alguien que tambien use dispositivos Apple, necesitan iOS 15+ o macOS Monterey+ para aceptar.',
        },
      },
      {
        heading: { en: 'Trusted Phone Number', es: 'Numero de Telefono de Confianza' },
        paragraphs: [
          {
            en: 'Apple sends verification codes to your trusted phone number when you sign in on a new device. Add a backup number (a family member\'s works) so losing your main phone doesn\'t lock you out.',
            es: 'Apple envia codigos de verificacion a tu numero de confianza cuando inicias sesion en un dispositivo nuevo. Agrega un numero de respaldo (el de un familiar sirve) para que perder tu telefono principal no te deje sin acceso.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > Sign-In & Security > Two-Factor Authentication', es: 'Ajustes > [tu nombre] > Inicio de sesion y seguridad > Autenticacion de dos factores' },
          { en: 'Tap "Edit" next to Trusted Phone Numbers', es: 'Toca "Editar" junto a Numeros de telefono de confianza' },
          { en: 'Add a secondary number', es: 'Agrega un numero secundario' },
        ],
      },
      {
        heading: { en: 'Trusted Devices', es: 'Dispositivos de Confianza' },
        paragraphs: [
          {
            en: 'Any Apple device where you\'re signed in can display verification codes and approve sign-in requests. Even an old iPad at home gives you a second way to prove your identity.',
            es: 'Cualquier dispositivo Apple donde tengas sesion iniciada puede mostrar codigos de verificacion y aprobar solicitudes de inicio de sesion. Incluso un iPad viejo en casa te da una segunda forma de verificar tu identidad.',
          },
        ],
        tip: {
          en: 'Keep a secondary device at home, even if you rarely use it. It is your safety net.',
          es: 'Manten un dispositivo secundario en casa, aunque lo uses poco. Es tu red de seguridad.',
        },
      },
      {
        heading: { en: 'iCloud Backup', es: 'Respaldo de iCloud' },
        paragraphs: [
          {
            en: 'Turn on automatic iCloud backups so your data survives a lost or broken phone. Confirm backups are running, not just toggled on.',
            es: 'Activa los respaldos automaticos de iCloud para que tus datos sobrevivan a un telefono perdido o danado. Confirma que los respaldos estan corriendo, no solo activados.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > iCloud > iCloud Backup', es: 'Ajustes > [tu nombre] > iCloud > Respaldo de iCloud' },
          { en: 'Toggle on "Back Up This iPhone"', es: 'Activa "Respaldo de este iPhone"' },
          { en: 'Tap "Back Up Now" to run one immediately', es: 'Toca "Respaldar ahora" para ejecutar uno de inmediato' },
        ],
        warning: {
          en: 'Free iCloud only gives 5 GB. If your backup fails silently, you might have no recent copy. Check Settings > iCloud > Manage Storage to confirm.',
          es: 'iCloud gratuito solo da 5 GB. Si tu respaldo falla silenciosamente, podrias no tener una copia reciente. Revisa Ajustes > iCloud > Gestionar almacenamiento para confirmar.',
        },
      },
      {
        heading: { en: 'Find My iPhone', es: 'Buscar mi iPhone' },
        paragraphs: [
          {
            en: 'Find My lets you locate, lock, or erase your device remotely. Enable "Send Last Location" so Apple saves your device\'s position when the battery gets critically low.',
            es: 'Buscar permite localizar, bloquear o borrar tu dispositivo de forma remota. Activa "Enviar ultima ubicacion" para que Apple guarde la posicion de tu dispositivo cuando la bateria este criticamente baja.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > Find My > Find My iPhone', es: 'Ajustes > [tu nombre] > Buscar > Buscar mi iPhone' },
          { en: 'Enable "Find My iPhone" and "Find My network"', es: 'Activa "Buscar mi iPhone" y "Red de Buscar"' },
          { en: 'Enable "Send Last Location"', es: 'Activa "Enviar ultima ubicacion"' },
        ],
      },
      {
        heading: { en: 'Security Keys (Advanced)', es: 'Llaves de Seguridad (Avanzado)' },
        paragraphs: [
          {
            en: 'A hardware key like [YubiKey](https://www.yubico.com/) replaces SMS codes with a physical tap. Phishing and SIM-swap attacks become impossible.',
            es: 'Una llave de hardware como [YubiKey](https://www.yubico.com/) reemplaza los codigos SMS con un toque fisico. Los ataques de phishing y SIM-swap se vuelven imposibles.',
          },
          {
            en: 'You need at least two keys (one backup). Keep the backup in a safe place, not with your daily carry.',
            es: 'Necesitas al menos dos llaves (una de respaldo). Guarda el respaldo en un lugar seguro, no con tus cosas de uso diario.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > Sign-In & Security > Two-Factor Authentication', es: 'Ajustes > [tu nombre] > Inicio de sesion y seguridad > Autenticacion de dos factores' },
          { en: 'Tap "Security Keys" > "Add Security Keys"', es: 'Toca "Llaves de seguridad" > "Agregar llaves de seguridad"' },
          { en: 'Follow the prompts to register your key (NFC or USB-C)', es: 'Sigue las instrucciones para registrar tu llave (NFC o USB-C)' },
        ],
        warning: {
          en: 'No key, no access. Without it you cannot sign in to iCloud on new devices, password or not. Put an AirTag on your keychain.',
          es: 'Sin llave, sin acceso. Sin ella no podras iniciar sesion en iCloud en dispositivos nuevos, con contrasena o sin ella. Pon un AirTag en tu llavero.',
        },
      },
    ],
  },

  // ─── 2. Gmail Security & Organization ──────────────────────
  {
    id: 'gmail-security',
    category: 'google',
    icon: 'gmail',
    updated: '2026-03',
    title: {
      en: 'Secure Your Gmail Account',
      es: 'Protege Tu Cuenta de Gmail',
    },
    subtitle: {
      en: '2FA, recovery codes, security checkup, labels, and app passwords',
      es: '2FA, codigos de recuperacion, revision de seguridad, etiquetas y contrasenas de aplicaciones',
    },
    sections: [
      {
        heading: { en: 'Google Security Checkup', es: 'Revision de Seguridad de Google' },
        paragraphs: [
          {
            en: 'Start with the [Security Checkup](https://myaccount.google.com/security-checkup). Google flags active sessions, third-party app access, and recent security events. Review it every few months.',
            es: 'Comienza con la [Revision de seguridad](https://myaccount.google.com/security-checkup). Google senala sesiones activas, acceso de apps de terceros y eventos de seguridad recientes. Revisalo cada pocos meses.',
          },
        ],
        tip: {
          en: 'Revoke anything you don\'t recognize. Investigate later.',
          es: 'Revoca lo que no reconozcas. Investiga despues.',
        },
      },
      {
        heading: { en: 'Two-Factor Authentication', es: 'Autenticacion de Dos Factores' },
        paragraphs: [
          {
            en: 'Enable 2FA with Google Authenticator or a hardware key. Avoid SMS-only 2FA when possible, SIM swaps are real.',
            es: 'Activa 2FA con Google Authenticator o una llave de hardware. Evita 2FA solo por SMS cuando sea posible, los SIM swaps son reales.',
          },
        ],
        steps: [
          { en: 'Go to [Google 2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)', es: 'Ve a [Verificacion en 2 pasos de Google](https://myaccount.google.com/signinoptions/two-step-verification)' },
          { en: 'Choose "Authenticator app" and scan the QR code', es: 'Elige "App de autenticacion" y escanea el codigo QR' },
          { en: 'Save the backup codes (see next section)', es: 'Guarda los codigos de respaldo (siguiente seccion)' },
        ],
      },
      {
        heading: { en: 'Backup Codes', es: 'Codigos de Respaldo' },
        paragraphs: [
          {
            en: 'When you enable 2FA, Google gives you 10 single-use backup codes. Print them or store them in your password manager. Never save them in your email.',
            es: 'Al activar 2FA, Google te da 10 codigos de respaldo de un solo uso. Imprimalos o guardalos en tu gestor de contrasenas. Nunca los guardes en tu correo.',
          },
        ],
        steps: [
          { en: 'Go to [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)', es: 'Ve a [Verificacion en 2 pasos](https://myaccount.google.com/signinoptions/two-step-verification)' },
          { en: 'Scroll to "Backup codes" and click "Show codes"', es: 'Desplazate a "Codigos de respaldo" y haz clic en "Mostrar codigos"' },
          { en: 'Download or print them. Store securely offline.', es: 'Descargalos o imprimalos. Guardalos de forma segura fuera de linea.' },
        ],
        warning: {
          en: 'If you have already used most codes, generate a new set. Old codes are invalidated when you regenerate.',
          es: 'Si ya usaste la mayoria de los codigos, genera un nuevo conjunto. Los codigos viejos se invalidan al regenerar.',
        },
      },
      {
        heading: { en: 'Recovery Email & Phone', es: 'Correo y Telefono de Recuperacion' },
        paragraphs: [
          {
            en: 'Add a recovery email (not your Gmail) and a recovery phone. Google uses these when you forget your password or get locked out. Keep both current.',
            es: 'Agrega un correo de recuperacion (no tu Gmail) y un telefono de recuperacion. Google los usa cuando olvidas tu contrasena o te bloquean. Manten ambos actualizados.',
          },
        ],
        steps: [
          { en: 'Google Account > Security > Ways we can verify it\'s you', es: 'Cuenta de Google > Seguridad > Formas en que podemos verificar que eres tu' },
          { en: 'Add or update recovery email and phone', es: 'Agrega o actualiza correo y telefono de recuperacion' },
        ],
      },
      {
        heading: { en: 'Labels & Filters for Organization', es: 'Etiquetas y Filtros para Organizacion' },
        paragraphs: [
          {
            en: 'Labels and filters auto-sort your inbox. Create a "Security" label filtered to no-reply@accounts.google.com so real alerts stand out from noise.',
            es: 'Las etiquetas y filtros organizan tu bandeja automaticamente. Crea una etiqueta "Seguridad" filtrada a no-reply@accounts.google.com para que las alertas reales se destaquen del ruido.',
          },
        ],
        steps: [
          { en: 'Gmail > Settings gear > See all settings > Filters and Blocked Addresses', es: 'Gmail > Engranaje de ajustes > Ver todos los ajustes > Filtros y direcciones bloqueadas' },
          { en: 'Click "Create a new filter"', es: 'Haz clic en "Crear un nuevo filtro"' },
          { en: 'Set From field, choose "Apply the label" and pick your label', es: 'Configura el campo De, elige "Aplicar la etiqueta" y selecciona tu etiqueta' },
        ],
      },
    ],
  },

  // ─── 3. Password Managers ──────────────────────────────────
  {
    id: 'password-managers',
    category: 'passwords',
    icon: 'key',
    updated: '2026-03',
    title: {
      en: 'Set Up a Password Manager',
      es: 'Configura un Gestor de Contrasenas',
    },
    subtitle: {
      en: 'Bitwarden and 1Password setup, cross-device sync, and features people skip',
      es: 'Configuracion de Bitwarden y 1Password, sincronizacion entre dispositivos y funciones que la gente ignora',
    },
    sections: [
      {
        heading: { en: 'Why a Password Manager', es: 'Por Que un Gestor de Contrasenas' },
        paragraphs: [
          {
            en: 'You only need to remember one strong master password. The manager generates and stores unique passwords for every site. If one site gets breached, your other accounts stay safe.',
            es: 'Solo necesitas recordar una contrasena maestra fuerte. El gestor genera y almacena contrasenas unicas para cada sitio. Si un sitio sufre una brecha, tus otras cuentas siguen seguras.',
          },
          {
            en: '[Bitwarden](https://bitwarden.com/) is free and open-source. [1Password](https://1password.com/) is a paid option with a polished UI and family sharing. Both are solid choices.',
            es: '[Bitwarden](https://bitwarden.com/) es gratis y de codigo abierto. [1Password](https://1password.com/) es una opcion de pago con interfaz pulida y compartir en familia. Ambas son buenas opciones.',
          },
        ],
      },
      {
        heading: { en: 'Initial Setup', es: 'Configuracion Inicial' },
        steps: [
          { en: 'Create an account at bitwarden.com or 1password.com', es: 'Crea una cuenta en bitwarden.com o 1password.com' },
          { en: 'Choose a strong master password (4+ random words, e.g. "correct horse battery staple")', es: 'Elige una contrasena maestra fuerte (4+ palabras aleatorias, ej. "gato piano nube reloj")' },
          { en: 'Install the browser extension (Chrome/Firefox/Safari)', es: 'Instala la extension del navegador (Chrome/Firefox/Safari)' },
          { en: 'Install the mobile app and enable autofill', es: 'Instala la app movil y activa el autocompletado' },
        ],
        tip: {
          en: 'Write your master password on paper and store it somewhere safe (not your wallet). If you forget it, there is no recovery for most managers.',
          es: 'Escribe tu contrasena maestra en papel y guardalo en un lugar seguro (no tu billetera). Si la olvidas, no hay recuperacion en la mayoria de gestores.',
        },
      },
      {
        heading: { en: 'Replace Your Default Autofill', es: 'Reemplaza el Autocompletado por Defecto' },
        paragraphs: [
          {
            en: 'On iPhone: Settings > Passwords > Password Options. Switch AutoFill from iCloud Keychain to your manager. Now it fills credentials across all apps, not just Safari.',
            es: 'En iPhone: Ajustes > Contrasenas > Opciones de contrasenas. Cambia el autocompletado de Llavero de iCloud a tu gestor. Ahora llena credenciales en todas las apps, no solo Safari.',
          },
        ],
      },
      {
        heading: { en: 'Features People Skip', es: 'Funciones que la Gente Ignora' },
        paragraphs: [
          {
            en: '**Emergency access** (Bitwarden) or **family vault sharing** (1Password) lets a trusted person open your vault if you\'re incapacitated. Two minutes to set up.',
            es: '**Acceso de emergencia** (Bitwarden) o **boveda familiar compartida** (1Password) permite que una persona de confianza abra tu boveda si quedas incapacitado. Dos minutos para configurar.',
          },
          {
            en: '**Breach reports** check your stored emails against known data leaks. Run this monthly. Both Bitwarden and 1Password include it.',
            es: '**Reportes de brechas** revisan tus correos guardados contra filtraciones conocidas. Ejecutalo mensualmente. Bitwarden y 1Password lo incluyen.',
          },
          {
            en: '**Secure notes** store recovery codes, Wi-Fi passwords, software licenses, anything that needs encryption but isn\'t a login.',
            es: '**Notas seguras** guardan codigos de recuperacion, contrasenas de Wi-Fi, licencias de software, todo lo que necesite cifrado pero no sea un login.',
          },
        ],
      },
      {
        heading: { en: 'Cross-Device Recovery', es: 'Recuperacion entre Dispositivos' },
        paragraphs: [
          {
            en: 'If your phone dies, a computer or tablet already logged into your manager still has every password. Keep at least one extra device signed in at home.',
            es: 'Si tu telefono muere, una computadora o tablet con sesion iniciada en tu gestor aun tiene todas tus contrasenas. Manten al menos un dispositivo extra con sesion iniciada en casa.',
          },
        ],
        tip: {
          en: 'Bitwarden also has a web vault at vault.bitwarden.com. You can access it from any browser without installing anything.',
          es: 'Bitwarden tambien tiene una boveda web en vault.bitwarden.com. Puedes acceder desde cualquier navegador sin instalar nada.',
        },
      },
    ],
  },

  // ─── 4. iPhone Extra Security ──────────────────────────────
  {
    id: 'iphone-security',
    category: 'mobile',
    icon: 'phone',
    updated: '2026-03',
    title: {
      en: 'iPhone Security Beyond the Basics',
      es: 'Seguridad del iPhone Mas Alla de lo Basico',
    },
    subtitle: {
      en: 'Stolen Device Protection, app locks, Screen Time restrictions, and lock screen protection',
      es: 'Proteccion de dispositivo robado, bloqueo de apps, restricciones de Screen Time y pantalla de bloqueo',
    },
    sections: [
      {
        heading: { en: 'Stolen Device Protection', es: 'Proteccion de Dispositivo Robado' },
        paragraphs: [
          {
            en: 'iOS 17.3+ delays critical changes (password, Face ID, disabling Find My) by one hour when you\'re away from familiar locations. A thief who forces you to unlock still faces a one-hour wall before taking over.',
            es: 'iOS 17.3+ retrasa cambios criticos (contrasena, Face ID, desactivar Buscar) una hora cuando estas lejos de ubicaciones familiares. Un ladron que te obligue a desbloquear aun enfrenta una hora de espera antes de tomar control.',
          },
        ],
        steps: [
          { en: 'Settings > Face ID & Passcode > enter your passcode', es: 'Ajustes > Face ID y codigo > ingresa tu codigo' },
          { en: 'Scroll to "Stolen Device Protection" and enable it', es: 'Desplazate a "Proteccion de dispositivo robado" y activalo' },
          { en: 'Choose "Always" for maximum protection (delays even at familiar locations)', es: 'Elige "Siempre" para maxima proteccion (retrasa incluso en ubicaciones familiares)' },
        ],
      },
      {
        heading: { en: 'Lock Apps with Face ID', es: 'Bloquear Apps con Face ID' },
        paragraphs: [
          {
            en: 'iOS 18+ lets you require Face ID to open individual apps. Long-press an app icon and tap "Require Face ID". Use this for banking apps, email, messaging, and your password manager.',
            es: 'iOS 18+ permite requerir Face ID para abrir apps individuales. Manten presionado el icono de una app y toca "Requerir Face ID". Usalo para apps bancarias, correo, mensajeria y tu gestor de contrasenas.',
          },
        ],
        tip: {
          en: 'You can also hide apps from your home screen entirely. Long-press > Require Face ID > Hide and Require Face ID. The app moves to a hidden folder in App Library.',
          es: 'Tambien puedes ocultar apps de la pantalla de inicio completamente. Manten presionado > Requerir Face ID > Ocultar y requerir Face ID. La app se mueve a una carpeta oculta en la Biblioteca de Apps.',
        },
      },
      {
        heading: { en: 'Screen Time Restrictions', es: 'Restricciones de Screen Time' },
        paragraphs: [
          {
            en: 'Screen Time doubles as a security layer. Set a separate passcode and restrict account changes, app installs, and app deletions. Past the lock screen, a thief still can\'t install malware or delete Find My.',
            es: 'Screen Time funciona como capa de seguridad. Configura un codigo separado y restringe cambios de cuenta, instalacion de apps y eliminacion de apps. Pasada la pantalla de bloqueo, un ladron aun no puede instalar malware ni eliminar Buscar.',
          },
        ],
        steps: [
          { en: 'Settings > Screen Time > Lock Screen Time Settings (set a separate passcode)', es: 'Ajustes > Screen Time > Bloquear ajustes de Screen Time (establece un codigo separado)' },
          { en: 'Content & Privacy Restrictions > toggle on', es: 'Restricciones de contenido y privacidad > activa' },
          { en: 'Under Allowed Changes: set "Account Changes", "Passcode Changes" and "Cellular Data Changes" to "Don\'t Allow"', es: 'En Cambios permitidos: configura "Cambios de cuenta", "Cambios de codigo" y "Cambios de datos celulares" a "No permitir"' },
        ],
        warning: {
          en: 'If you forget your Screen Time passcode, resetting it requires your Apple ID, which creates a circular dependency. Write it down.',
          es: 'Si olvidas tu codigo de Screen Time, restablecerlo requiere tu Apple ID, lo que crea una dependencia circular. Anotalo.',
        },
      },
      {
        heading: { en: 'Lock Screen Protection', es: 'Proteger la Pantalla de Bloqueo' },
        paragraphs: [
          {
            en: 'Disable Notification Center, Control Center, Siri, Reply with Message, and USB accessories from the lock screen. Every feature exposed while locked is an attack surface.',
            es: 'Desactiva Centro de Notificaciones, Centro de Control, Siri, Responder con mensaje y accesorios USB desde la pantalla de bloqueo. Cada funcion expuesta con el telefono bloqueado es una superficie de ataque.',
          },
        ],
        steps: [
          { en: 'Settings > Face ID & Passcode', es: 'Ajustes > Face ID y codigo' },
          { en: 'Under "Allow Access When Locked", disable everything you do not strictly need', es: 'En "Permitir acceso con bloqueo", desactiva todo lo que no necesites estrictamente' },
        ],
      },
    ],
  },

  // ─── 5. Android Hardening for Family ───────────────────────
  {
    id: 'android-family',
    category: 'mobile',
    icon: 'android',
    updated: '2026-03',
    title: {
      en: 'Set Up a Safe Android Phone for Family',
      es: 'Configura un Android Seguro para la Familia',
    },
    subtitle: {
      en: 'Remove bloatware and ads, lock apps, set up a recovery email, and simplify the screen',
      es: 'Elimina bloatware y anuncios, bloquea apps, configura un correo de recuperacion y simplifica la pantalla',
    },
    sections: [
      {
        heading: { en: 'Factory Reset First', es: 'Reseteo de Fabrica Primero' },
        paragraphs: [
          {
            en: 'Start with a factory reset. Budget Android phones ship with pre-installed apps that show ads and collect data. A reset wipes them clean.',
            es: 'Comienza con un reseteo de fabrica. Los telefonos Android economicos vienen con apps preinstaladas que muestran anuncios y recolectan datos. Un reset los limpia por completo.',
          },
        ],
        steps: [
          { en: 'Settings > System > Reset Options > Erase all data (factory reset)', es: 'Ajustes > Sistema > Opciones de restablecimiento > Borrar todos los datos' },
          { en: 'During initial setup, sign in with a Google account you control', es: 'Durante la configuracion inicial, inicia sesion con una cuenta de Google que tu controles' },
        ],
        tip: {
          en: 'Sign in with a Google account you control. You can then remotely manage the device, reset passwords, and locate it if lost.',
          es: 'Inicia sesion con una cuenta de Google que tu controles. Asi puedes gestionar el dispositivo remotamente, restablecer contrasenas y localizarlo si se pierde.',
        },
      },
      {
        heading: { en: 'Remove Bloatware and Ads', es: 'Eliminar Bloatware y Anuncios' },
        paragraphs: [
          {
            en: 'Uninstall every app that came with the phone: carrier apps, game stores, news widgets. If it won\'t uninstall, disable it. Then install a browser with built-in ad blocking.',
            es: 'Desinstala cada app que vino con el telefono: apps del operador, tiendas de juegos, widgets de noticias. Si no se puede desinstalar, desactivala. Luego instala un navegador con bloqueo de anuncios integrado.',
          },
        ],
        steps: [
          { en: 'Settings > Apps > tap each unwanted app > "Disable" or "Uninstall"', es: 'Ajustes > Aplicaciones > toca cada app no deseada > "Desactivar" o "Desinstalar"' },
          { en: 'Install a clean browser like Firefox and enable its built-in tracking protection', es: 'Instala un navegador limpio como Firefox y activa su proteccion contra rastreo integrada' },
          { en: 'In Chrome: Settings > Privacy > turn on "Block third-party cookies"', es: 'En Chrome: Configuracion > Privacidad > activa "Bloquear cookies de terceros"' },
        ],
      },
      {
        heading: { en: 'App Lock with Pattern or PIN', es: 'Bloqueo de Apps con Patron o PIN' },
        paragraphs: [
          {
            en: 'Samsung, Xiaomi, and OPPO include built-in app locks. These add a second barrier for sensitive apps. If yours lacks one, install [Norton App Lock](https://play.google.com/store/apps/details?id=com.symantec.applock) (free).',
            es: 'Samsung, Xiaomi y OPPO incluyen bloqueo de apps integrado. Estos agregan una segunda barrera para apps sensibles. Si el tuyo no lo tiene, instala [Norton App Lock](https://play.google.com/store/apps/details?id=com.symantec.applock) (gratis).',
          },
        ],
        steps: [
          { en: 'Samsung: Settings > Biometrics and security > Secure Folder', es: 'Samsung: Ajustes > Biometria y seguridad > Carpeta segura' },
          { en: 'Xiaomi: Settings > Apps > App lock', es: 'Xiaomi: Ajustes > Aplicaciones > Bloqueo de apps' },
          { en: 'Lock at minimum: WhatsApp, Gmail, Gallery, Settings, Play Store', es: 'Bloquea al menos: WhatsApp, Gmail, Galeria, Ajustes, Play Store' },
        ],
      },
      {
        heading: { en: 'Simplify the Home Screen', es: 'Simplificar la Pantalla de Inicio' },
        paragraphs: [
          {
            en: 'A clean home screen reduces confusion. Increase icon and font size, remove unused widgets, and keep only essential apps on the first page.',
            es: 'Una pantalla de inicio limpia reduce la confusion. Aumenta el tamano de iconos y fuentes, elimina widgets sin usar y deja solo apps esenciales en la primera pagina.',
          },
        ],
        steps: [
          { en: 'Settings > Display > Font size and Display size: set both to "Large" or "Largest"', es: 'Ajustes > Pantalla > Tamano de fuente y Tamano de visualizacion: configura ambos en "Grande" o "El mas grande"' },
          { en: 'Long-press unused apps on the home screen > Remove', es: 'Manten presionadas las apps no usadas en la pantalla de inicio > Eliminar' },
          { en: 'Keep only: Phone, Messages, WhatsApp, Camera, Gallery, Browser, Settings', es: 'Deja solo: Telefono, Mensajes, WhatsApp, Camara, Galeria, Navegador, Ajustes' },
        ],
        tip: {
          en: 'Samsung has an "Easy mode" (Settings > Display > Easy mode) that makes everything larger and simplifies the layout with a single swipe.',
          es: 'Samsung tiene un "Modo facil" (Ajustes > Pantalla > Modo facil) que agranda todo y simplifica el diseno con un solo deslizamiento.',
        },
      },
      {
        heading: { en: 'Find My Device & Backup', es: 'Encontrar mi Dispositivo y Respaldo' },
        paragraphs: [
          {
            en: 'Turn on Find My Device and automatic Google backup. From any browser you can then locate, lock, or erase the phone.',
            es: 'Activa Encontrar mi dispositivo y el respaldo automatico de Google. Desde cualquier navegador puedes luego localizar, bloquear o borrar el telefono.',
          },
        ],
        steps: [
          { en: 'Settings > Security > Find My Device > enable', es: 'Ajustes > Seguridad > Encontrar mi dispositivo > activar' },
          { en: 'Settings > System > Backup > enable "Back up to Google Drive"', es: 'Ajustes > Sistema > Respaldo > activar "Respaldar en Google Drive"' },
        ],
      },
    ],
  },

  // ─── 5b. Phone Setup for an Older Adult ────────────────────
  {
    id: 'elderly-phone',
    category: 'mobile',
    icon: 'heart',
    updated: '2026-06',
    title: {
      en: 'Set Up a Phone an Older Adult Can Use Safely',
      es: 'Configura un Telefono que un Adulto Mayor Pueda Usar con Seguridad',
    },
    subtitle: {
      en: 'Lock screen, app lock, notifications, text size, and emergency contacts in one guide',
      es: 'Pantalla de bloqueo, bloqueo de apps, notificaciones, tamano de texto y contactos de emergencia en una guia',
    },
    sections: [
      {
        heading: { en: 'Start with the Lock Screen', es: 'Empieza por la Pantalla de Bloqueo' },
        paragraphs: [
          {
            en: 'A clean lock screen prevents accidental calls, stops strangers from opening the camera or wallet, and keeps notifications private. The goal is fewer buttons, not more locks.',
            es: 'Una pantalla de bloqueo limpia evita llamadas accidentales, impide que desconocidos abran la camara o billetera, y mantiene las notificaciones privadas. El objetivo es menos botones, no mas candados.',
          },
        ],
        steps: [
          { en: 'iPhone: Settings > Face ID & Passcode > under "Allow Access When Locked", turn off Control Center, Notification Center, Siri, Reply with Message, and Wallet', es: 'iPhone: Ajustes > Face ID y codigo > en "Permitir acceso con bloqueo", desactiva Centro de Control, Centro de Notificaciones, Siri, Responder con mensaje y Billetera' },
          { en: 'Android: Settings > Lock screen > turn off lock-screen shortcuts and notification details', es: 'Android: Ajustes > Pantalla de bloqueo > desactiva accesos directos y detalles de notificaciones' },
          { en: 'Choose a simple wallpaper and keep only the clock and emergency button visible', es: 'Elige un fondo de pantalla sencillo y deja solo el reloj y el boton de emergencia visibles' },
        ],
        tip: {
          en: 'Use a 4-6 digit PIN instead of a pattern. Patterns are harder to remember and easier for someone nearby to guess.',
          es: 'Usa un PIN de 4-6 digitos en lugar de un patron. Los patrones son mas dificiles de recordar y mas faciles de adivinar para alguien cerca.',
        },
      },
      {
        heading: { en: 'Lock the Apps That Matter', es: 'Bloquea las Apps Importantes' },
        paragraphs: [
          {
            en: 'App locks protect banking, messages, photos, and email if someone else picks up the phone. They also stop accidental deletions or purchases.',
            es: 'El bloqueo de apps protege banca, mensajes, fotos y correo si alguien mas toma el telefono. Tambien evita borrados o compras accidentales.',
          },
        ],
        steps: [
          { en: 'iPhone (iOS 18+): long-press the app icon > Require Face ID or Touch ID', es: 'iPhone (iOS 18+): manten presionado el icono de la app > Requerir Face ID o Touch ID' },
          { en: 'Samsung: Settings > Biometrics and security > Secure Folder', es: 'Samsung: Ajustes > Biometria y seguridad > Carpeta segura' },
          { en: 'Xiaomi / OPPO: Settings > Apps > App lock', es: 'Xiaomi / OPPO: Ajustes > Aplicaciones > Bloqueo de apps' },
          { en: 'Lock at minimum: Phone/SMS, WhatsApp, banking, email, Gallery/Photos, and Settings', es: 'Bloquea al menos: Telefono/SMS, WhatsApp, banca, correo, Galeria/Fotos y Ajustes' },
        ],
        tip: {
          en: 'If the phone has no built-in app lock, install [Norton App Lock](https://play.google.com/store/apps/details?id=com.symantec.applock) from the Play Store.',
          es: 'Si el telefono no tiene bloqueo de apps integrado, instala [Norton App Lock](https://play.google.com/store/apps/details?id=com.symantec.applock) desde Play Store.',
        },
      },
      {
        heading: { en: 'Turn Down the Noise', es: 'Baja el Ruido de Notificaciones' },
        paragraphs: [
          {
            en: 'Too many notifications hide the important ones and make the phone feel overwhelming. Keep only the essentials: calls, messages, calendar, and weather.',
            es: 'Demasiadas notificaciones ocultan las importantes y hacen que el telefono se sienta abrumador. Manten solo lo esencial: llamadas, mensajes, calendario y clima.',
          },
        ],
        steps: [
          { en: 'Settings > Notifications > turn off all apps except Phone, Messages, WhatsApp, Calendar, and Weather', es: 'Ajustes > Notificaciones > desactiva todas las apps excepto Telefono, Mensajes, WhatsApp, Calendario y Clima' },
          { en: 'Disable notification badges/dots for games, shopping, news, and social apps', es: 'Desactiva los puntos de notificacion para juegos, compras, noticias y redes sociales' },
          { en: 'Set a Do Not Disturb schedule overnight, but allow calls from favorites', es: 'Configura No molestar por la noche, pero permite llamadas de favoritos' },
        ],
        tip: {
          en: 'Schedule Do Not Disturb from 9pm to 8am, and set calls from favorites or emergency contacts to bypass it.',
          es: 'Programa No molestar de 9pm a 8am, y configura que las llamadas de favoritos o contactos de emergencia lo ignoren.',
        },
      },
      {
        heading: { en: 'Remove What Is Not Needed', es: 'Elimina lo que No se Necesita' },
        paragraphs: [
          {
            en: 'Pre-installed games, shopping apps, and "cleaner" tools confuse users and often show ads. Uninstall or disable anything that is not part of the daily routine.',
            es: 'Juegos preinstalados, apps de compras y "limpiadores" confunden y suelen mostrar anuncios. Desinstala o desactiva todo lo que no sea parte de la rutina diaria.',
          },
        ],
        steps: [
          { en: 'Uninstall games, shopping apps, third-party keyboards, and "phone cleaner" apps', es: 'Desinstala juegos, apps de compras, teclados de terceros y apps "limpiadoras"' },
          { en: 'iPhone: Settings > Screen Time > Content & Privacy Restrictions > disable installing/deleting apps', es: 'iPhone: Ajustes > Screen Time > Restricciones de contenido y privacidad > desactiva instalar/eliminar apps' },
          { en: 'Android: Settings > Apps > tap each unwanted pre-installed app > Disable or Uninstall', es: 'Android: Ajustes > Aplicaciones > toca cada app preinstalada no deseada > Desactivar o Desinstalar' },
        ],
        warning: {
          en: 'Do not disable Phone, Messages, Settings, Find My iPhone, or Find My Device. Those must stay active.',
          es: 'No desactives Telefono, Mensajes, Ajustes, Buscar mi iPhone ni Encontrar mi dispositivo. Estas deben permanecer activas.',
        },
      },
      {
        heading: { en: 'Make It Easier to See and Tap', es: 'Hazlo Mas Facil de Ver y Tocar' },
        paragraphs: [
          {
            en: 'Small text and tiny icons lead to mistakes. Increase font size, enlarge display elements, and reduce visual motion.',
            es: 'El texto pequeno y los iconos diminutos generan errores. Aumenta el tamano de fuente, agranda los elementos en pantalla y reduce el movimiento visual.',
          },
        ],
        steps: [
          { en: 'iPhone: Settings > Display & Brightness > Text Size (larger) and Bold Text', es: 'iPhone: Ajustes > Pantalla y brillo > Tamano de texto (mas grande) y Texto en negrita' },
          { en: 'iPhone: Settings > Accessibility > Display & Text Size > Larger Accessibility Sizes', es: 'iPhone: Ajustes > Accesibilidad > Pantalla y tamano de texto > Tamanos de accesibilidad mas grandes' },
          { en: 'Android: Settings > Display > Font size and Display size > Large or Largest', es: 'Android: Ajustes > Pantalla > Tamano de fuente y Tamano de visualizacion > Grande o El mas grande' },
          { en: 'Enable Reduce Motion / Remove animations in accessibility settings', es: 'Activa Reducir movimiento / Eliminar animaciones en ajustes de accesibilidad' },
          { en: 'On Android, consider a simple launcher such as Big Launcher or Simple Launcher', es: 'En Android, considera un launcher sencillo como Big Launcher o Simple Launcher' },
        ],
        tip: {
          en: 'Keep only 4-6 essential apps on the home screen: Phone, Messages, WhatsApp, Camera, Gallery, and Weather.',
          es: 'Deja solo 4-6 apps esenciales en la pantalla de inicio: Telefono, Mensajes, WhatsApp, Camara, Galeria y Clima.',
        },
      },
      {
        heading: { en: 'Set Up Emergency Help', es: 'Configura Ayuda de Emergencia' },
        paragraphs: [
          {
            en: 'Emergency information on the lock screen can save minutes in a crisis. Set it up once and review it every six months.',
            es: 'La informacion de emergencia en la pantalla de bloqueo puede ahorrar minutos en una crisis. Configurala una vez y revisala cada seis meses.',
          },
        ],
        steps: [
          { en: 'iPhone: Health app > Medical ID > add emergency contacts, conditions, allergies, and blood type; enable "Show When Locked"', es: 'iPhone: app Salud > ID Medica > agrega contactos de emergencia, condiciones, alergias y tipo de sangre; activa "Mostrar con bloqueo"' },
          { en: 'Android: Settings > Safety & emergency > Emergency contacts + Medical information; enable "Show on lock screen"', es: 'Android: Ajustes > Seguridad y emergencia > Contactos de emergencia + Informacion medica; activa "Mostrar en pantalla de bloqueo"' },
          { en: 'Add ICE contacts to favorites and allow them to bypass Do Not Disturb', es: 'Agrega contactos ICE a favoritos y permitiles ignorar No molestar' },
          { en: 'Write emergency info on paper and keep it in the phone case or wallet', es: 'Escribe la informacion de emergencia en papel y guardala en la funda del telefono o billetera' },
        ],
      },
      {
        heading: { en: 'Final Walk-Through and Cheat Sheet', es: 'Revision Final y Hoja de Referencia' },
        paragraphs: [
          {
            en: 'Test the whole setup while sitting together. Then print a one-page cheat sheet the person can keep near the charger.',
            es: 'Prueba toda la configuracion sentados juntos. Luego imprime una hoja de referencia de una pagina que la persona pueda tener cerca del cargador.',
          },
        ],
        steps: [
          { en: 'Unlock the phone, open each essential app, make a test call, and send a message', es: 'Desbloquea el telefono, abre cada app esencial, haz una llamada de prueba y envia un mensaje' },
          { en: 'Confirm emergency info appears on the lock screen', es: 'Confirma que la informacion de emergencia aparece en la pantalla de bloqueo' },
          { en: 'Print a cheat sheet: how to answer a call, how to call the emergency contact, how to charge, and the unlock PIN hint (keep the actual PIN separate)', es: 'Imprime una hoja de referencia: como contestar una llamada, como llamar al contacto de emergencia, como cargar y una pista del PIN (guarda el PIN real aparte)' },
          { en: 'Schedule a monthly check-in to update apps and review notifications', es: 'Programa una revision mensual para actualizar apps y revisar notificaciones' },
        ],
        tip: {
          en: 'Use large print (16 pt+) and keep the cheat sheet in one place, taped to the wall near the charger works well.',
          es: 'Usa letra grande (16 pt+) y manten la hoja en un solo lugar, pegada en la pared cerca del cargador funciona bien.',
        },
      },
    ],
  },

  // ─── 6. WhatsApp Security ──────────────────────────────────
  {
    id: 'whatsapp-security',
    category: 'mobile',
    icon: 'whatsapp',
    updated: '2026-03',
    title: {
      en: 'Secure Your WhatsApp',
      es: 'Protege Tu WhatsApp',
    },
    subtitle: {
      en: '2FA PIN, encrypted backups, linked devices audit, and chat lock',
      es: 'PIN de 2FA, respaldos cifrados, auditar dispositivos vinculados y bloqueo de chats',
    },
    sections: [
      {
        heading: { en: 'Enable the 2FA PIN', es: 'Activa el PIN de 2FA' },
        paragraphs: [
          {
            en: 'WhatsApp\'s two-step verification requires a 6-digit PIN when you register your number on a new phone. Without it, anyone with your SIM can take over your account in seconds.',
            es: 'La verificacion en dos pasos de WhatsApp requiere un PIN de 6 digitos cuando registras tu numero en un telefono nuevo. Sin el, cualquiera con tu SIM puede tomar control de tu cuenta en segundos.',
          },
        ],
        steps: [
          { en: 'Settings > Account > Two-step verification > Enable', es: 'Ajustes > Cuenta > Verificacion en dos pasos > Activar' },
          { en: 'Choose a 6-digit PIN (not your birthday or 123456)', es: 'Elige un PIN de 6 digitos (no tu cumpleanos ni 123456)' },
          { en: 'Add a recovery email in case you forget the PIN', es: 'Agrega un correo de recuperacion por si olvidas el PIN' },
        ],
        warning: {
          en: 'If you forget your PIN and have no recovery email, you must wait 7 days before you can reset it. During those 7 days, nobody can verify your number.',
          es: 'Si olvidas tu PIN y no tienes correo de recuperacion, debes esperar 7 dias para restablecerlo. Durante esos 7 dias, nadie puede verificar tu numero.',
        },
      },
      {
        heading: { en: 'Turn On Encrypted Backups', es: 'Activa los Respaldos Cifrados' },
        paragraphs: [
          {
            en: 'By default, WhatsApp backups to Google Drive or iCloud are **not encrypted**. Anyone who accesses your cloud account can read every message. Turn on end-to-end encrypted backups.',
            es: 'Por defecto, los respaldos de WhatsApp en Google Drive o iCloud **no estan cifrados**. Cualquiera que acceda a tu cuenta en la nube puede leer cada mensaje. Activa los respaldos cifrados de extremo a extremo.',
          },
        ],
        steps: [
          { en: 'Settings > Chats > Chat backup > End-to-end encrypted backup', es: 'Ajustes > Chats > Copia de seguridad > Copia cifrada de extremo a extremo' },
          { en: 'Choose "Create password" or "Use 64-digit encryption key"', es: 'Elige "Crear contrasena" o "Usar clave de cifrado de 64 digitos"' },
          { en: 'Store the password/key in your password manager', es: 'Guarda la contrasena/clave en tu gestor de contrasenas' },
        ],
        tip: {
          en: 'Choose the password option. The 64-digit key is more secure but almost impossible to remember or type.',
          es: 'Elige la opcion de contrasena. La clave de 64 digitos es mas segura pero casi imposible de recordar o escribir.',
        },
      },
      {
        heading: { en: 'Audit Linked Devices', es: 'Auditar Dispositivos Vinculados' },
        paragraphs: [
          {
            en: 'WhatsApp Web and desktop apps stay linked until you remove them. Check regularly for devices you don\'t recognize.',
            es: 'WhatsApp Web y las apps de escritorio quedan vinculadas hasta que las elimines. Revisa regularmente si hay dispositivos que no reconoces.',
          },
        ],
        steps: [
          { en: 'Settings > Linked devices', es: 'Ajustes > Dispositivos vinculados' },
          { en: 'Review each device and its "Last active" timestamp', es: 'Revisa cada dispositivo y su marca de tiempo "Ultima actividad"' },
          { en: 'Tap any device you don\'t recognize and select "Log out"', es: 'Toca cualquier dispositivo que no reconozcas y selecciona "Cerrar sesion"' },
        ],
      },
      {
        heading: { en: 'Chat Lock', es: 'Bloqueo de Chats' },
        paragraphs: [
          {
            en: 'Lock individual conversations behind Face ID or fingerprint. Locked chats move to a "Locked Chats" folder that only you can open.',
            es: 'Bloquea conversaciones individuales con Face ID o huella digital. Los chats bloqueados se mueven a una carpeta "Chats bloqueados" que solo tu puedes abrir.',
          },
        ],
        steps: [
          { en: 'Open the chat > tap the contact name at the top', es: 'Abre el chat > toca el nombre del contacto arriba' },
          { en: 'Scroll down to "Chat lock" and enable it', es: 'Desplazate hacia abajo a "Bloqueo de chat" y activalo' },
        ],
      },
      {
        heading: { en: 'Silence Unknown Callers', es: 'Silenciar Llamadas Desconocidas' },
        paragraphs: [
          {
            en: 'WhatsApp calls from unknown numbers are often spam or social engineering attempts. Silence them so they never ring.',
            es: 'Las llamadas de WhatsApp de numeros desconocidos suelen ser spam o intentos de ingenieria social. Silencialas para que nunca suenen.',
          },
        ],
        steps: [
          { en: 'Settings > Privacy > Calls > Silence unknown callers', es: 'Ajustes > Privacidad > Llamadas > Silenciar llamadas desconocidas' },
        ],
        tip: {
          en: 'Silenced calls still appear in your call log. You can return legitimate calls without answering scam ones.',
          es: 'Las llamadas silenciadas aun aparecen en tu registro. Puedes devolver llamadas legitimas sin contestar las de estafa.',
        },
      },
    ],
  },

  // ─── 7. SIM Swap Protection ────────────────────────────────
  {
    id: 'sim-swap',
    category: 'mobile',
    icon: 'sim',
    updated: '2026-03',
    title: {
      en: 'Protect Against SIM Swap Attacks',
      es: 'Protegete Contra Ataques de SIM Swap',
    },
    subtitle: {
      en: 'Carrier PIN, port-out protection, and reducing your SMS 2FA exposure',
      es: 'PIN del operador, proteccion contra portabilidad y reducir tu exposicion a 2FA por SMS',
    },
    sections: [
      {
        heading: { en: 'What Is a SIM Swap', es: 'Que Es un SIM Swap' },
        paragraphs: [
          {
            en: 'An attacker calls your carrier, pretends to be you, and transfers your phone number to their SIM card. They receive your SMS codes and reset passwords on your email, bank, and social accounts. The whole attack takes under 10 minutes.',
            es: 'Un atacante llama a tu operador, se hace pasar por ti y transfiere tu numero a su tarjeta SIM. Recibe tus codigos SMS y restablece contrasenas en tu correo, banco y redes sociales. Todo el ataque toma menos de 10 minutos.',
          },
        ],
      },
      {
        heading: { en: 'Set a Carrier PIN', es: 'Configura un PIN del Operador' },
        paragraphs: [
          {
            en: 'Every major carrier lets you set a PIN or passcode you must provide before making account changes. Call your carrier or do it online.',
            es: 'Cada operador importante te permite configurar un PIN o codigo que debes proporcionar antes de hacer cambios en la cuenta. Llama a tu operador o hazlo en linea.',
          },
        ],
        steps: [
          { en: 'T-Mobile: Account > Security > SIM protection + Account PIN', es: 'T-Mobile: Cuenta > Seguridad > Proteccion de SIM + PIN de cuenta' },
          { en: 'AT&T: myAT&T > Profile > Sign-in info > Wireless passcode', es: 'AT&T: myAT&T > Perfil > Info de inicio de sesion > Codigo inalambrico' },
          { en: 'Verizon: My Verizon > Account > Security > Account PIN', es: 'Verizon: My Verizon > Cuenta > Seguridad > PIN de cuenta' },
          { en: 'Claro/Movistar: Call customer service and request a security PIN for port-out', es: 'Claro/Movistar: Llama a servicio al cliente y solicita un PIN de seguridad para portabilidad' },
        ],
        warning: {
          en: 'Some carriers set a default PIN like 0000 or the last 4 digits of your SSN. Change it to something unique immediately.',
          es: 'Algunos operadores configuran un PIN por defecto como 0000 o los ultimos 4 digitos de tu identificacion. Cambialo a algo unico de inmediato.',
        },
      },
      {
        heading: { en: 'Enable Port-Out Protection', es: 'Activa la Proteccion contra Portabilidad' },
        paragraphs: [
          {
            en: 'T-Mobile calls it "SIM protection", AT&T has "Extra security". These features block number transfers unless you physically verify at a store or provide your PIN.',
            es: 'T-Mobile lo llama "Proteccion de SIM", AT&T tiene "Seguridad extra". Estas funciones bloquean transferencias de numero a menos que verifiques fisicamente en una tienda o proporciones tu PIN.',
          },
        ],
        tip: {
          en: 'After enabling, try calling your carrier from a different phone and request a SIM swap. If they ask for your PIN, the protection works.',
          es: 'Despues de activarlo, intenta llamar a tu operador desde otro telefono y solicita un SIM swap. Si piden tu PIN, la proteccion funciona.',
        },
      },
      {
        heading: { en: 'Move Away from SMS 2FA', es: 'Alejate del 2FA por SMS' },
        paragraphs: [
          {
            en: 'SMS codes are the weakest form of 2FA. Switch every account to an authenticator app (Google Authenticator, Authy) or a hardware key. Start with email, banking, and cloud storage.',
            es: 'Los codigos SMS son la forma mas debil de 2FA. Cambia cada cuenta a una app de autenticacion (Google Authenticator, Authy) o una llave de hardware. Empieza con correo, banca y almacenamiento en la nube.',
          },
        ],
        steps: [
          { en: 'Audit your accounts: email, bank, social media, cloud storage', es: 'Audita tus cuentas: correo, banco, redes sociales, almacenamiento en la nube' },
          { en: 'For each: go to Security settings > 2FA > switch from SMS to authenticator app', es: 'Para cada una: ve a Ajustes de seguridad > 2FA > cambia de SMS a app de autenticacion' },
          { en: 'Save the backup codes for each service in your password manager', es: 'Guarda los codigos de respaldo de cada servicio en tu gestor de contrasenas' },
        ],
      },
    ],
  },

  // ─── 8. Spot Phishing Before You Click ─────────────────────
  {
    id: 'phishing',
    category: 'browser',
    icon: 'hook',
    updated: '2026-03',
    title: {
      en: 'Spot Phishing Before You Click',
      es: 'Detecta Phishing Antes de Hacer Clic',
    },
    subtitle: {
      en: 'Read URLs, verify senders, recognize urgency tactics, and recover if you already clicked',
      es: 'Lee URLs, verifica remitentes, reconoce tacticas de urgencia y recuperate si ya hiciste clic',
    },
    sections: [
      {
        heading: { en: 'Read the URL, Not the Button', es: 'Lee la URL, No el Boton' },
        paragraphs: [
          {
            en: 'Hover over any link before clicking. The real destination appears at the bottom of your browser or in a tooltip. Watch for misspellings (app1e.com), extra subdomains (apple.account-verify.com), and character substitutions (using 0 instead of o).',
            es: 'Pasa el cursor sobre cualquier enlace antes de hacer clic. El destino real aparece en la parte inferior del navegador o en un tooltip. Busca errores ortograficos (app1e.com), subdominios extra (apple.account-verify.com) y sustituciones de caracteres (usando 0 en vez de o).',
          },
        ],
        tip: {
          en: 'The domain that matters is the one right before the TLD. In "security.apple.com" the domain is apple.com (safe). In "apple.security-check.com" the domain is security-check.com (phishing).',
          es: 'El dominio que importa es el que esta justo antes del TLD. En "security.apple.com" el dominio es apple.com (seguro). En "apple.security-check.com" el dominio es security-check.com (phishing).',
        },
      },
      {
        heading: { en: 'Check the Sender', es: 'Verifica el Remitente' },
        paragraphs: [
          {
            en: 'The display name can say "Apple Support" but the email address might be support@apple-id-recovery.net. Always expand the sender to see the actual address. Legitimate companies send from their own domain.',
            es: 'El nombre visible puede decir "Soporte Apple" pero la direccion de correo podria ser support@apple-id-recovery.net. Siempre expande el remitente para ver la direccion real. Las empresas legitimas envian desde su propio dominio.',
          },
        ],
        steps: [
          { en: 'In Gmail: click the small arrow next to "to me" to expand sender details', es: 'En Gmail: haz clic en la flecha pequena junto a "para mi" para expandir los detalles del remitente' },
          { en: 'In Apple Mail: click the contact name to reveal the full address', es: 'En Apple Mail: haz clic en el nombre del contacto para revelar la direccion completa' },
          { en: 'Compare the domain to the company\'s real domain (google.com, apple.com, not google-support.com)', es: 'Compara el dominio con el dominio real de la empresa (google.com, apple.com, no google-support.com)' },
        ],
      },
      {
        heading: { en: 'Recognize Urgency Tactics', es: 'Reconoce las Tacticas de Urgencia' },
        paragraphs: [
          {
            en: 'Phishing emails manufacture panic: "Your account will be suspended in 24 hours", "Unusual sign-in detected, act now", "Your payment failed". Real companies rarely demand immediate action by email. When in doubt, type the URL yourself.',
            es: 'Los correos de phishing fabrican panico: "Tu cuenta sera suspendida en 24 horas", "Inicio de sesion inusual detectado, actua ahora", "Tu pago fallo". Las empresas reales rara vez exigen accion inmediata por correo. En caso de duda, escribe la URL tu mismo.',
          },
        ],
      },
      {
        heading: { en: 'SMS and WhatsApp Phishing', es: 'Phishing por SMS y WhatsApp' },
        paragraphs: [
          {
            en: 'Phishing moved beyond email. Watch for SMS messages about failed deliveries, banking alerts from unknown numbers, or WhatsApp messages with shortened URLs. No bank or delivery company sends account links via WhatsApp.',
            es: 'El phishing va mas alla del correo. Cuidado con SMS sobre entregas fallidas, alertas bancarias de numeros desconocidos o mensajes de WhatsApp con URLs acortadas. Ningun banco ni empresa de entregas envia enlaces de cuenta por WhatsApp.',
          },
        ],
        tip: {
          en: 'If an SMS claims to be from your bank, call the number on the back of your card, not the one in the message.',
          es: 'Si un SMS dice ser de tu banco, llama al numero del reverso de tu tarjeta, no al del mensaje.',
        },
      },
      {
        heading: { en: 'Already Clicked? Do This Now', es: 'Ya Hiciste Clic? Haz Esto Ahora' },
        paragraphs: [
          {
            en: 'If you entered credentials on a phishing page, act fast. Change the password on the real site immediately, enable 2FA if you haven\'t, and check for unauthorized sessions or forwarding rules in your email.',
            es: 'Si ingresaste credenciales en una pagina de phishing, actua rapido. Cambia la contrasena en el sitio real de inmediato, activa 2FA si no lo has hecho, y revisa si hay sesiones no autorizadas o reglas de reenvio en tu correo.',
          },
        ],
        steps: [
          { en: 'Change the compromised password immediately', es: 'Cambia la contrasena comprometida de inmediato' },
          { en: 'Check active sessions and revoke unknown ones', es: 'Revisa sesiones activas y revoca las desconocidas' },
          { en: 'In Gmail: Settings > Forwarding > confirm no unknown forwarding addresses', es: 'En Gmail: Ajustes > Reenvio > confirma que no hay direcciones de reenvio desconocidas' },
          { en: 'Enable 2FA on the affected account', es: 'Activa 2FA en la cuenta afectada' },
          { en: 'Run a breach check on your email at haveibeenpwned.com', es: 'Ejecuta una verificacion de brechas en tu correo en haveibeenpwned.com' },
        ],
        warning: {
          en: 'Check email forwarding rules. Attackers often add a silent forwarding rule so they keep receiving your emails even after you change your password.',
          es: 'Revisa las reglas de reenvio de correo. Los atacantes suelen agregar una regla de reenvio silenciosa para seguir recibiendo tus correos incluso despues de que cambies tu contrasena.',
        },
      },
    ],
  },

  // ─── 9. Mac Hardening ──────────────────────────────────────
  {
    id: 'mac-hardening',
    category: 'apple',
    icon: 'apple',
    updated: '2026-03',
    title: {
      en: 'Secure Your Mac',
      es: 'Protege Tu Mac',
    },
    subtitle: {
      en: 'FileVault, firewall, Gatekeeper, Find My Mac, and firmware password',
      es: 'FileVault, firewall, Gatekeeper, Buscar mi Mac y contrasena de firmware',
    },
    sections: [
      {
        heading: { en: 'FileVault Disk Encryption', es: 'Cifrado de Disco FileVault' },
        paragraphs: [
          {
            en: 'FileVault encrypts your entire startup disk. If someone steals your Mac, they cannot read your data without your login password or recovery key.',
            es: 'FileVault cifra todo tu disco de arranque. Si alguien roba tu Mac, no puede leer tus datos sin tu contrasena de inicio de sesion o clave de recuperacion.',
          },
        ],
        steps: [
          { en: 'System Settings > Privacy & Security > FileVault > Turn On', es: 'Ajustes del Sistema > Privacidad y seguridad > FileVault > Activar' },
          { en: 'Choose to store the recovery key with your Apple account or write it down', es: 'Elige almacenar la clave de recuperacion con tu cuenta de Apple o anotarla' },
        ],
        warning: {
          en: 'If you lose both your login password and recovery key, your data is gone permanently. Store the recovery key in your password manager.',
          es: 'Si pierdes tanto tu contrasena de inicio como tu clave de recuperacion, tus datos se pierden permanentemente. Guarda la clave en tu gestor de contrasenas.',
        },
      },
      {
        heading: { en: 'Firewall', es: 'Firewall' },
        paragraphs: [
          {
            en: 'macOS ships with the firewall off. Turn it on to block unwanted incoming connections. It has zero impact on daily use.',
            es: 'macOS viene con el firewall desactivado. Activalo para bloquear conexiones entrantes no deseadas. No tiene impacto en el uso diario.',
          },
        ],
        steps: [
          { en: 'System Settings > Network > Firewall > Turn On', es: 'Ajustes del Sistema > Red > Firewall > Activar' },
          { en: 'Click Options > enable "Block all incoming connections" if you want maximum protection', es: 'Haz clic en Opciones > activa "Bloquear todas las conexiones entrantes" si quieres maxima proteccion' },
        ],
      },
      {
        heading: { en: 'Gatekeeper and App Security', es: 'Gatekeeper y Seguridad de Apps' },
        paragraphs: [
          {
            en: 'Gatekeeper prevents unsigned apps from running. Keep it set to "App Store and identified developers". Never disable it permanently to install one app.',
            es: 'Gatekeeper previene la ejecucion de apps sin firmar. Mantenlo en "App Store y desarrolladores identificados". Nunca lo desactives permanentemente para instalar una app.',
          },
        ],
        steps: [
          { en: 'System Settings > Privacy & Security > Allow apps from: App Store and identified developers', es: 'Ajustes del Sistema > Privacidad y seguridad > Permitir apps de: App Store y desarrolladores identificados' },
        ],
        tip: {
          en: 'If you need to open a specific unsigned app once, right-click it > Open instead of disabling Gatekeeper.',
          es: 'Si necesitas abrir una app sin firmar una vez, haz clic derecho > Abrir en lugar de desactivar Gatekeeper.',
        },
      },
      {
        heading: { en: 'Find My Mac', es: 'Buscar mi Mac' },
        paragraphs: [
          {
            en: 'Enable Find My Mac to locate, lock, or erase your laptop remotely. Combined with FileVault, a stolen Mac is a brick to the thief.',
            es: 'Activa Buscar mi Mac para localizar, bloquear o borrar tu laptop remotamente. Combinado con FileVault, un Mac robado es un ladrillo para el ladron.',
          },
        ],
        steps: [
          { en: 'System Settings > [your name] > iCloud > Find My Mac > Turn On', es: 'Ajustes del Sistema > [tu nombre] > iCloud > Buscar mi Mac > Activar' },
        ],
      },
      {
        heading: { en: 'Automatic Updates', es: 'Actualizaciones Automaticas' },
        paragraphs: [
          {
            en: 'Security patches fix vulnerabilities that attackers actively exploit. Enable automatic updates so you don\'t fall behind.',
            es: 'Los parches de seguridad corrigen vulnerabilidades que los atacantes explotan activamente. Activa las actualizaciones automaticas para no quedarte atras.',
          },
        ],
        steps: [
          { en: 'System Settings > General > Software Update > Automatic Updates > enable all toggles', es: 'Ajustes del Sistema > General > Actualizacion de software > Actualizaciones automaticas > activa todas las opciones' },
        ],
      },
    ],
  },

  // ─── 10. Browser Hardening ─────────────────────────────────
  {
    id: 'browser-hardening',
    category: 'browser',
    icon: 'globe',
    updated: '2026-03',
    title: {
      en: 'Secure Your Browser',
      es: 'Protege Tu Navegador',
    },
    subtitle: {
      en: 'HTTPS-only, cookie settings, safe extensions, and disabling browser autofill',
      es: 'Solo HTTPS, configuracion de cookies, extensiones seguras y desactivar autocompletado del navegador',
    },
    sections: [
      {
        heading: { en: 'HTTPS-Only Mode', es: 'Modo Solo HTTPS' },
        paragraphs: [
          {
            en: 'Force your browser to use encrypted connections. Pages that only serve HTTP will show a warning before loading.',
            es: 'Fuerza a tu navegador a usar conexiones cifradas. Las paginas que solo sirven HTTP mostraran una advertencia antes de cargar.',
          },
        ],
        steps: [
          { en: 'Chrome: Settings > Privacy and security > Security > Always use secure connections', es: 'Chrome: Configuracion > Privacidad y seguridad > Seguridad > Usar siempre conexiones seguras' },
          { en: 'Firefox: Settings > Privacy & Security > HTTPS-Only Mode > Enable in all windows', es: 'Firefox: Ajustes > Privacidad y seguridad > Modo solo HTTPS > Activar en todas las ventanas' },
          { en: 'Safari: enabled by default since Safari 15', es: 'Safari: activado por defecto desde Safari 15' },
        ],
      },
      {
        heading: { en: 'Cookie Settings', es: 'Configuracion de Cookies' },
        paragraphs: [
          {
            en: 'Block third-party cookies. They exist only to track you across sites. First-party cookies (login sessions) still work fine.',
            es: 'Bloquea las cookies de terceros. Solo existen para rastrearte entre sitios. Las cookies propias (sesiones de inicio) siguen funcionando.',
          },
        ],
        steps: [
          { en: 'Chrome: Settings > Privacy > Third-party cookies > Block third-party cookies', es: 'Chrome: Configuracion > Privacidad > Cookies de terceros > Bloquear cookies de terceros' },
          { en: 'Firefox: Settings > Privacy > Enhanced Tracking Protection > Strict', es: 'Firefox: Ajustes > Privacidad > Proteccion mejorada contra rastreo > Estricto' },
          { en: 'Safari: blocks third-party cookies by default', es: 'Safari: bloquea cookies de terceros por defecto' },
        ],
      },
      {
        heading: { en: 'Extensions: What to Install', es: 'Extensiones: Que Instalar' },
        paragraphs: [
          {
            en: 'Install [uBlock Origin](https://ublockorigin.com/) for ad/tracker blocking and your password manager extension. That\'s it. Every extra extension increases your attack surface.',
            es: 'Instala [uBlock Origin](https://ublockorigin.com/) para bloquear anuncios/rastreadores y la extension de tu gestor de contrasenas. Eso es todo. Cada extension extra aumenta tu superficie de ataque.',
          },
        ],
        warning: {
          en: 'Remove extensions you don\'t actively use. Browser extensions can read all page content, including passwords and banking data. Only install from official stores.',
          es: 'Elimina extensiones que no uses activamente. Las extensiones pueden leer todo el contenido de la pagina, incluidas contrasenas y datos bancarios. Solo instala desde tiendas oficiales.',
        },
      },
      {
        heading: { en: 'Disable Browser Autofill for Cards', es: 'Desactiva el Autocompletado de Tarjetas del Navegador' },
        paragraphs: [
          {
            en: 'Browsers store credit card numbers in plaintext (or with weak OS-level protection). Use your password manager for payment data instead.',
            es: 'Los navegadores almacenan numeros de tarjeta en texto plano (o con proteccion debil del sistema operativo). Usa tu gestor de contrasenas para datos de pago.',
          },
        ],
        steps: [
          { en: 'Chrome: Settings > Autofill and passwords > Payment methods > turn off "Save and fill payment methods"', es: 'Chrome: Configuracion > Autocompletado y contrasenas > Metodos de pago > desactiva "Guardar y completar metodos de pago"' },
          { en: 'Firefox: Settings > Privacy > Autofill > uncheck "Credit cards"', es: 'Firefox: Ajustes > Privacidad > Autocompletado > desmarca "Tarjetas de credito"' },
        ],
      },
    ],
  },

  // ─── 11. Home Wi-Fi Hardening ──────────────────────────────
  {
    id: 'home-wifi',
    category: 'network',
    icon: 'wifi',
    updated: '2026-03',
    title: {
      en: 'Secure Your Home Wi-Fi',
      es: 'Protege Tu Wi-Fi del Hogar',
    },
    subtitle: {
      en: 'Router admin password, WPA3, guest network, DNS, and firmware updates',
      es: 'Contrasena admin del router, WPA3, red de invitados, DNS y actualizaciones de firmware',
    },
    sections: [
      {
        heading: { en: 'Change the Router Admin Password', es: 'Cambia la Contrasena Admin del Router' },
        paragraphs: [
          {
            en: 'Most routers ship with admin/admin or admin/password. Anyone on your network can access the admin panel and change settings. Change it immediately.',
            es: 'La mayoria de los routers vienen con admin/admin o admin/password. Cualquiera en tu red puede acceder al panel de administracion y cambiar configuraciones. Cambialo de inmediato.',
          },
        ],
        steps: [
          { en: 'Open 192.168.1.1 or 192.168.0.1 in your browser (check the sticker on your router)', es: 'Abre 192.168.1.1 o 192.168.0.1 en tu navegador (revisa la etiqueta en tu router)' },
          { en: 'Log in with the default credentials', es: 'Inicia sesion con las credenciales por defecto' },
          { en: 'Find Administration or System > change the admin password to something strong', es: 'Busca Administracion o Sistema > cambia la contrasena admin a algo fuerte' },
        ],
      },
      {
        heading: { en: 'Use WPA3 (or WPA2 at Minimum)', es: 'Usa WPA3 (o WPA2 como Minimo)' },
        paragraphs: [
          {
            en: 'WPA3 is the latest Wi-Fi security standard. If your router supports it, enable WPA3-Personal. If not, WPA2-Personal (AES) is acceptable. Never use WEP or "Open".',
            es: 'WPA3 es el estandar de seguridad Wi-Fi mas reciente. Si tu router lo soporta, activa WPA3-Personal. Si no, WPA2-Personal (AES) es aceptable. Nunca uses WEP o "Abierto".',
          },
        ],
        steps: [
          { en: 'Router admin > Wireless > Security > select WPA3-Personal or WPA2/WPA3 mixed', es: 'Admin del router > Inalambrico > Seguridad > selecciona WPA3-Personal o WPA2/WPA3 mixto' },
          { en: 'Set a strong Wi-Fi password (12+ characters)', es: 'Configura una contrasena Wi-Fi fuerte (12+ caracteres)' },
        ],
      },
      {
        heading: { en: 'Disable WPS', es: 'Desactiva WPS' },
        paragraphs: [
          {
            en: 'Wi-Fi Protected Setup lets devices connect with a PIN or button press. The PIN is brute-forceable in hours. Turn it off.',
            es: 'Wi-Fi Protected Setup permite conectar dispositivos con un PIN o presion de boton. El PIN se puede forzar en horas. Desactivalo.',
          },
        ],
        steps: [
          { en: 'Router admin > Wireless > WPS > Disable', es: 'Admin del router > Inalambrico > WPS > Desactivar' },
        ],
      },
      {
        heading: { en: 'Create a Guest Network', es: 'Crea una Red de Invitados' },
        paragraphs: [
          {
            en: 'A guest network isolates visitors and IoT devices (smart speakers, cameras, lights) from your main devices. Guests get internet access but cannot see your computers or NAS.',
            es: 'Una red de invitados aisla visitantes y dispositivos IoT (parlantes inteligentes, camaras, luces) de tus dispositivos principales. Los invitados tienen acceso a internet pero no pueden ver tus computadoras o NAS.',
          },
        ],
        steps: [
          { en: 'Router admin > Guest Network > Enable', es: 'Admin del router > Red de invitados > Activar' },
          { en: 'Set a different password from your main network', es: 'Configura una contrasena diferente a tu red principal' },
          { en: 'Connect all IoT devices to the guest network', es: 'Conecta todos los dispositivos IoT a la red de invitados' },
        ],
        tip: {
          en: 'Smart TVs, robot vacuums, and voice assistants only need internet access. Keep them off your main network.',
          es: 'Smart TVs, aspiradoras robot y asistentes de voz solo necesitan acceso a internet. Mantenlos fuera de tu red principal.',
        },
      },
      {
        heading: { en: 'Change DNS to a Secure Provider', es: 'Cambia el DNS a un Proveedor Seguro' },
        paragraphs: [
          {
            en: 'Your ISP\'s default DNS can be slow and logs your browsing. Switch to Cloudflare (1.1.1.1) or Quad9 (9.9.9.9) for faster lookups and built-in malware domain blocking.',
            es: 'El DNS por defecto de tu ISP puede ser lento y registra tu navegacion. Cambia a Cloudflare (1.1.1.1) o Quad9 (9.9.9.9) para consultas mas rapidas y bloqueo de dominios maliciosos integrado.',
          },
        ],
        steps: [
          { en: 'Router admin > Network/WAN > DNS > set Primary: 1.1.1.1, Secondary: 1.0.0.1', es: 'Admin del router > Red/WAN > DNS > configura Primario: 1.1.1.1, Secundario: 1.0.0.1' },
          { en: 'Or use Quad9: Primary: 9.9.9.9, Secondary: 149.112.112.112', es: 'O usa Quad9: Primario: 9.9.9.9, Secundario: 149.112.112.112' },
        ],
      },
      {
        heading: { en: 'Update Router Firmware', es: 'Actualiza el Firmware del Router' },
        paragraphs: [
          {
            en: 'Researchers discover new router vulnerabilities regularly. Check for firmware updates every few months. Some routers offer auto-update.',
            es: 'Los investigadores descubren nuevas vulnerabilidades de routers regularmente. Busca actualizaciones de firmware cada pocos meses. Algunos routers ofrecen auto-actualizacion.',
          },
        ],
        steps: [
          { en: 'Router admin > System/Administration > Firmware Update > Check for updates', es: 'Admin del router > Sistema/Administracion > Actualizacion de firmware > Buscar actualizaciones' },
        ],
      },
    ],
  },

  // ─── 12. The 3-2-1 Backup Rule ─────────────────────────────
  {
    id: 'backup-321',
    category: 'data',
    icon: 'backup',
    updated: '2026-03',
    title: {
      en: 'The 3-2-1 Backup Rule',
      es: 'La Regla de Respaldo 3-2-1',
    },
    subtitle: {
      en: 'Three copies, two media types, one offsite. Protect against hardware failure, theft, and ransomware',
      es: 'Tres copias, dos tipos de medio, una fuera de sitio. Protege contra fallas de hardware, robo y ransomware',
    },
    sections: [
      {
        heading: { en: 'The Rule Explained', es: 'La Regla Explicada' },
        paragraphs: [
          {
            en: '**3** copies of your data. **2** different storage types (e.g. SSD + cloud). **1** copy offsite (so a fire or theft doesn\'t destroy everything). If any one copy fails, you still have two.',
            es: '**3** copias de tus datos. **2** tipos de almacenamiento diferentes (ej. SSD + nube). **1** copia fuera de sitio (para que un incendio o robo no destruya todo). Si una copia falla, aun tienes dos.',
          },
        ],
      },
      {
        heading: { en: 'Copy 1: Your Device', es: 'Copia 1: Tu Dispositivo' },
        paragraphs: [
          {
            en: 'This is your working copy. The files on your Mac, PC, or phone. It\'s the fastest to access but the most fragile: a spilled coffee, a stolen laptop, or a failing drive can destroy it.',
            es: 'Esta es tu copia de trabajo. Los archivos en tu Mac, PC o telefono. Es la mas rapida de acceder pero la mas fragil: un cafe derramado, un laptop robado o un disco danado pueden destruirla.',
          },
        ],
      },
      {
        heading: { en: 'Copy 2: External Drive', es: 'Copia 2: Disco Externo' },
        paragraphs: [
          {
            en: 'Use Time Machine (Mac) or File History (Windows) with an external SSD or hard drive. Plug it in weekly and let it back up automatically.',
            es: 'Usa Time Machine (Mac) o Historial de archivos (Windows) con un SSD o disco duro externo. Conectalo semanalmente y deja que respalde automaticamente.',
          },
        ],
        steps: [
          { en: 'Mac: System Settings > General > Time Machine > Add Backup Disk', es: 'Mac: Ajustes del Sistema > General > Time Machine > Agregar disco de respaldo' },
          { en: 'Windows: Settings > Update & Security > Backup > Add a drive', es: 'Windows: Configuracion > Actualizacion y seguridad > Respaldo > Agregar una unidad' },
        ],
        tip: {
          en: 'A 1TB external SSD costs around $60 and can save years of irreplaceable data. Worth it.',
          es: 'Un SSD externo de 1TB cuesta alrededor de $60 y puede salvar anos de datos irremplazables. Vale la pena.',
        },
      },
      {
        heading: { en: 'Copy 3: Cloud Backup', es: 'Copia 3: Respaldo en la Nube' },
        paragraphs: [
          {
            en: 'iCloud, Google Drive, or a dedicated backup service like Backblaze ($7/month for unlimited). This is your offsite copy that survives theft, fire, or hardware failure at home.',
            es: 'iCloud, Google Drive o un servicio de respaldo dedicado como Backblaze ($7/mes por ilimitado). Esta es tu copia fuera de sitio que sobrevive robo, incendio o falla de hardware en casa.',
          },
        ],
      },
      {
        heading: { en: 'Verify Your Backups', es: 'Verifica Tus Respaldos' },
        paragraphs: [
          {
            en: 'A backup you\'ve never tested is not a backup. Once a quarter, try restoring a file from each backup source. Check that your cloud backup is current, not months stale.',
            es: 'Un respaldo que nunca has probado no es un respaldo. Una vez por trimestre, intenta restaurar un archivo de cada fuente de respaldo. Verifica que tu respaldo en la nube este actualizado, no con meses de atraso.',
          },
        ],
      },
    ],
  },

  // ─── 13. Email Aliases ─────────────────────────────────────
  {
    id: 'email-aliases',
    category: 'google',
    icon: 'email',
    updated: '2026-03',
    title: {
      en: 'Use Email Aliases to Protect Your Identity',
      es: 'Usa Alias de Correo para Proteger Tu Identidad',
    },
    subtitle: {
      en: 'Hide My Email, SimpleLogin, and plus-addressing to track who leaks your data',
      es: 'Hide My Email, SimpleLogin y direcciones plus para rastrear quien filtra tus datos',
    },
    sections: [
      {
        heading: { en: 'Why Aliases', es: 'Por Que Alias' },
        paragraphs: [
          {
            en: 'Give every service a unique email address. When one leaks in a breach, you know exactly which service sold or lost your data, and you can kill that alias without affecting the rest.',
            es: 'Dale a cada servicio una direccion de correo unica. Cuando una se filtra en una brecha, sabes exactamente cual servicio vendio o perdio tus datos, y puedes eliminar ese alias sin afectar el resto.',
          },
        ],
      },
      {
        heading: { en: 'Apple Hide My Email', es: 'Apple Hide My Email' },
        paragraphs: [
          {
            en: 'If you have iCloud+, Apple generates random @icloud.com addresses that forward to your real inbox. Create one per service during sign-up.',
            es: 'Si tienes iCloud+, Apple genera direcciones @icloud.com aleatorias que reenvian a tu bandeja real. Crea una por servicio al registrarte.',
          },
        ],
        steps: [
          { en: 'On sign-up forms: tap the email field > "Hide My Email"', es: 'En formularios de registro: toca el campo de correo > "Ocultar mi correo"' },
          { en: 'Manage aliases: Settings > [your name] > iCloud > Hide My Email', es: 'Gestionar alias: Ajustes > [tu nombre] > iCloud > Ocultar mi correo' },
        ],
      },
      {
        heading: { en: 'SimpleLogin or AnonAddy', es: 'SimpleLogin o AnonAddy' },
        paragraphs: [
          {
            en: '[SimpleLogin](https://simplelogin.io/) (free tier: 10 aliases) works with any email provider. Create aliases like shop-amazon@yourdomain.com. If spam starts, disable that alias.',
            es: '[SimpleLogin](https://simplelogin.io/) (gratis: 10 alias) funciona con cualquier proveedor de correo. Crea alias como shop-amazon@tudominio.com. Si llega spam, desactiva ese alias.',
          },
        ],
      },
      {
        heading: { en: 'Gmail Plus Addressing', es: 'Direcciones Plus de Gmail' },
        paragraphs: [
          {
            en: 'Gmail ignores everything after a + sign. you@gmail.com and you+netflix@gmail.com both reach the same inbox. Use it to tag services and create filters.',
            es: 'Gmail ignora todo despues del signo +. tu@gmail.com y tu+netflix@gmail.com llegan a la misma bandeja. Usalo para etiquetar servicios y crear filtros.',
          },
        ],
        tip: {
          en: 'Plus addressing is free but visible. Some services strip the + part. For real privacy, use Hide My Email or SimpleLogin.',
          es: 'Las direcciones plus son gratis pero visibles. Algunos servicios eliminan la parte +. Para privacidad real, usa Hide My Email o SimpleLogin.',
        },
      },
    ],
  },

  // ─── 14. Digital Estate Plan ───────────────────────────────
  {
    id: 'digital-estate',
    category: 'passwords',
    icon: 'estate',
    updated: '2026-03',
    title: {
      en: 'Plan Your Digital Estate',
      es: 'Planifica Tu Herencia Digital',
    },
    subtitle: {
      en: 'What happens to your accounts if you can\'t access them. Legacy contacts, inactive account managers, and vault access',
      es: 'Que pasa con tus cuentas si no puedes acceder a ellas. Contactos de legado, gestores de inactividad y acceso a bovedas',
    },
    sections: [
      {
        heading: { en: 'Apple Legacy Contact', es: 'Contacto de Legado Apple' },
        paragraphs: [
          {
            en: 'A Legacy Contact can request access to your Apple account after you pass away. They receive your photos, messages, notes, and files. Without one, Apple locks the account permanently.',
            es: 'Un Contacto de legado puede solicitar acceso a tu cuenta de Apple despues de tu fallecimiento. Reciben tus fotos, mensajes, notas y archivos. Sin uno, Apple bloquea la cuenta permanentemente.',
          },
        ],
        steps: [
          { en: 'Settings > [your name] > Sign-In & Security > Legacy Contact > Add Legacy Contact', es: 'Ajustes > [tu nombre] > Inicio de sesion y seguridad > Contacto de legado > Agregar contacto de legado' },
        ],
      },
      {
        heading: { en: 'Google Inactive Account Manager', es: 'Gestor de Cuenta Inactiva de Google' },
        paragraphs: [
          {
            en: 'Google lets you decide what happens after 3, 6, 12, or 18 months of inactivity. You can notify trusted contacts automatically and share specific data (Gmail, Drive, Photos), or delete everything.',
            es: 'Google te permite decidir que pasa despues de 3, 6, 12 o 18 meses de inactividad. Puedes notificar contactos de confianza automaticamente y compartir datos especificos (Gmail, Drive, Fotos), o borrar todo.',
          },
        ],
        steps: [
          { en: 'Go to [Inactive Account Manager](https://myaccount.google.com/inactive)', es: 'Ve a [Gestor de cuenta inactiva](https://myaccount.google.com/inactive)' },
          { en: 'Set your inactivity period (recommend 6 months)', es: 'Configura tu periodo de inactividad (se recomiendan 6 meses)' },
          { en: 'Add trusted contacts and choose what data to share', es: 'Agrega contactos de confianza y elige que datos compartir' },
        ],
      },
      {
        heading: { en: 'Password Manager Emergency Access', es: 'Acceso de Emergencia del Gestor de Contrasenas' },
        paragraphs: [
          {
            en: 'Bitwarden\'s Emergency Access lets a trusted person request your vault after a waiting period you choose (1-30 days). If you don\'t reject the request, they get access. Set this up now.',
            es: 'El Acceso de Emergencia de Bitwarden permite que una persona de confianza solicite tu boveda despues de un periodo de espera que tu eliges (1-30 dias). Si no rechazas la solicitud, obtienen acceso. Configuralo ahora.',
          },
        ],
        steps: [
          { en: 'Bitwarden: Settings > Emergency Access > Add trusted contact', es: 'Bitwarden: Ajustes > Acceso de emergencia > Agregar contacto de confianza' },
          { en: '1Password: share a Family vault or use the Emergency Kit', es: '1Password: comparte una boveda Familiar o usa el Kit de Emergencia' },
        ],
        tip: {
          en: 'Have the "hit by a bus" conversation with your partner or a trusted family member. Give them a sealed envelope with your master password and 2FA recovery codes.',
          es: 'Ten la conversacion de "si me atropella un autobus" con tu pareja o un familiar de confianza. Dales un sobre sellado con tu contrasena maestra y codigos de recuperacion 2FA.',
        },
      },
      {
        heading: { en: 'Document Your Accounts', es: 'Documenta Tus Cuentas' },
        paragraphs: [
          {
            en: 'Create a list of your most important accounts: email, bank, social media, subscriptions, crypto. Store it as a secure note in your password manager. This list tells your trusted person what exists and where to look.',
            es: 'Crea una lista de tus cuentas mas importantes: correo, banco, redes sociales, suscripciones, crypto. Guardala como nota segura en tu gestor de contrasenas. Esta lista le dice a tu persona de confianza que existe y donde buscar.',
          },
        ],
      },
    ],
  },

  // ─── 15. Travel Security Checklist ─────────────────────────
  {
    id: 'travel-security',
    category: 'travel',
    icon: 'plane',
    updated: '2026-03',
    title: {
      en: 'Travel Security Checklist',
      es: 'Lista de Seguridad para Viajes',
    },
    subtitle: {
      en: 'What to enable, disable, and carry before leaving home',
      es: 'Que activar, desactivar y llevar antes de salir de casa',
    },
    sections: [
      {
        heading: { en: 'Before You Leave', es: 'Antes de Salir' },
        paragraphs: [
          {
            en: 'Prepare your devices before the trip, not at the airport.',
            es: 'Prepara tus dispositivos antes del viaje, no en el aeropuerto.',
          },
        ],
        steps: [
          { en: 'Set Stolen Device Protection to "Always" (not just away from home)', es: 'Configura Proteccion de dispositivo robado en "Siempre" (no solo lejos de casa)' },
          { en: 'Enable Find My on all devices', es: 'Activa Buscar en todos los dispositivos' },
          { en: 'Back up everything (iCloud, Google Drive, or Time Machine)', es: 'Respalda todo (iCloud, Google Drive o Time Machine)' },
          { en: 'Save offline maps for your destination (Google Maps > download area)', es: 'Guarda mapas offline de tu destino (Google Maps > descargar area)' },
          { en: 'Store travel docs (passport, insurance, tickets) as secure notes in your password manager', es: 'Guarda documentos de viaje (pasaporte, seguro, boletos) como notas seguras en tu gestor de contrasenas' },
        ],
      },
      {
        heading: { en: 'What to Disable', es: 'Que Desactivar' },
        steps: [
          { en: 'Auto-join Wi-Fi: Settings > Wi-Fi > Ask to Join Networks > Ask', es: 'Auto-conectar Wi-Fi: Ajustes > Wi-Fi > Preguntar para conectar > Preguntar' },
          { en: 'AirDrop from everyone: Settings > General > AirDrop > Contacts Only', es: 'AirDrop de todos: Ajustes > General > AirDrop > Solo contactos' },
          { en: 'Bluetooth when not in use (reduces attack surface and saves battery)', es: 'Bluetooth cuando no lo uses (reduce superficie de ataque y ahorra bateria)' },
          { en: 'Lock screen notifications for messaging apps (shows content to shoulder surfers)', es: 'Notificaciones en pantalla de bloqueo para apps de mensajeria (muestra contenido a curiosos)' },
        ],
      },
      {
        heading: { en: 'What to Carry', es: 'Que Llevar' },
        paragraphs: [
          {
            en: 'Pack these in your carry-on, not checked luggage.',
            es: 'Lleva esto en tu equipaje de mano, no en el documentado.',
          },
        ],
        steps: [
          { en: 'A backup security key (if you use them)', es: 'Una llave de seguridad de respaldo (si las usas)' },
          { en: 'A USB data blocker for public charging stations ($5, blocks data, passes only power)', es: 'Un bloqueador de datos USB para estaciones de carga publicas ($5, bloquea datos, solo pasa energia)' },
          { en: 'Printed recovery codes for your most critical accounts', es: 'Codigos de recuperacion impresos para tus cuentas mas criticas' },
          { en: 'An eSIM or local SIM as backup if your primary carrier fails', es: 'Una eSIM o SIM local como respaldo si tu operador principal falla' },
        ],
        tip: {
          en: 'A USB data blocker (also called a "USB condom") prevents juice jacking at airport and hotel charging stations. Plug it between the cable and the port.',
          es: 'Un bloqueador de datos USB (tambien llamado "condon USB") previene juice jacking en estaciones de carga de aeropuertos y hoteles. Conectalo entre el cable y el puerto.',
        },
      },
      {
        heading: { en: 'Public Wi-Fi', es: 'Wi-Fi Publico' },
        paragraphs: [
          {
            en: 'Avoid logging into banking or email on hotel/airport/cafe Wi-Fi. If you must, use a VPN. Free VPNs sell your data; use a paid one like Mullvad ($5/month, no account needed) or ProtonVPN.',
            es: 'Evita iniciar sesion en banca o correo en Wi-Fi de hoteles/aeropuertos/cafes. Si debes hacerlo, usa una VPN. Las VPN gratis venden tus datos; usa una de pago como Mullvad ($5/mes, sin cuenta necesaria) o ProtonVPN.',
          },
        ],
      },
    ],
  },

  // ─── 16. Smart Home Security ───────────────────────────────
  {
    id: 'smart-home',
    category: 'network',
    icon: 'camera',
    updated: '2026-03',
    title: {
      en: 'Secure Your Smart Home Devices',
      es: 'Protege Tus Dispositivos Inteligentes',
    },
    subtitle: {
      en: 'Default passwords, firmware updates, network isolation, and camera privacy',
      es: 'Contrasenas por defecto, actualizaciones de firmware, aislamiento de red y privacidad de camaras',
    },
    sections: [
      {
        heading: { en: 'Change Default Passwords', es: 'Cambia las Contrasenas por Defecto' },
        paragraphs: [
          {
            en: 'Cameras, doorbells, smart plugs, and routers ship with default credentials. Botnets like Mirai scan the internet for these defaults. Change every device password on first setup.',
            es: 'Camaras, timbres, enchufes inteligentes y routers vienen con credenciales por defecto. Botnets como Mirai escanean internet buscando estos defaults. Cambia la contrasena de cada dispositivo en la primera configuracion.',
          },
        ],
      },
      {
        heading: { en: 'Isolate IoT on Guest Network', es: 'Aisla IoT en Red de Invitados' },
        paragraphs: [
          {
            en: 'Smart devices are the weakest link in most home networks. A compromised smart bulb on your main network can scan your computers. Put all IoT devices on your guest Wi-Fi (see the Home Wi-Fi guide).',
            es: 'Los dispositivos inteligentes son el eslabon mas debil en la mayoria de las redes domesticas. Una bombilla inteligente comprometida en tu red principal puede escanear tus computadoras. Pon todos los dispositivos IoT en tu Wi-Fi de invitados (ver la guia de Wi-Fi del hogar).',
          },
        ],
      },
      {
        heading: { en: 'Update Firmware', es: 'Actualiza el Firmware' },
        paragraphs: [
          {
            en: 'Check each device\'s app for firmware updates monthly. Patches only protect you if you install them. Enable auto-updates where available.',
            es: 'Revisa la app de cada dispositivo mensualmente para actualizaciones de firmware. Los parches solo te protegen si los instalas. Activa auto-actualizaciones donde esten disponibles.',
          },
        ],
      },
      {
        heading: { en: 'Camera and Microphone Privacy', es: 'Privacidad de Camara y Microfono' },
        paragraphs: [
          {
            en: 'Use the physical mute button or privacy shutter on cameras and voice assistants when idle. Review who has access to your camera feeds in the manufacturer\'s app.',
            es: 'Usa el boton fisico de silencio o la cubierta de privacidad en camaras y asistentes de voz cuando esten inactivos. Revisa quien tiene acceso a tus feeds de camara en la app del fabricante.',
          },
        ],
        tip: {
          en: 'Disable cloud recording if you don\'t need it. Local-only storage (microSD) keeps your footage off the internet entirely.',
          es: 'Desactiva la grabacion en la nube si no la necesitas. Almacenamiento solo local (microSD) mantiene tus grabaciones completamente fuera de internet.',
        },
      },
    ],
  },

  // ─── 17. Social Media Privacy Audit ────────────────────────
  {
    id: 'social-media-privacy',
    category: 'browser',
    icon: 'people',
    updated: '2026-03',
    title: {
      en: 'Audit Your Social Media Privacy',
      es: 'Audita la Privacidad de Tus Redes Sociales',
    },
    subtitle: {
      en: 'Tighten Instagram, Facebook, and TikTok settings. Limit ad tracking and third-party app access',
      es: 'Ajusta configuraciones de Instagram, Facebook y TikTok. Limita rastreo publicitario y acceso de apps de terceros',
    },
    sections: [
      {
        heading: { en: 'Instagram', es: 'Instagram' },
        steps: [
          { en: 'Settings > Privacy > Private Account: enable (if not a public figure)', es: 'Ajustes > Privacidad > Cuenta privada: activa (si no eres figura publica)' },
          { en: 'Settings > Privacy > Activity Status: disable (hides when you\'re online)', es: 'Ajustes > Privacidad > Estado de actividad: desactiva (oculta cuando estas en linea)' },
          { en: 'Settings > Security > Apps and Websites: revoke access to apps you don\'t use', es: 'Ajustes > Seguridad > Apps y sitios web: revoca acceso a apps que no uses' },
          { en: 'Settings > Privacy > Contacts syncing: disable', es: 'Ajustes > Privacidad > Sincronizacion de contactos: desactiva' },
        ],
      },
      {
        heading: { en: 'Facebook', es: 'Facebook' },
        steps: [
          { en: 'Settings > Privacy > Who can see your future posts: Friends', es: 'Ajustes > Privacidad > Quien puede ver tus publicaciones futuras: Amigos' },
          { en: 'Settings > Privacy > Limit past posts (bulk change old public posts to Friends)', es: 'Ajustes > Privacidad > Limitar publicaciones anteriores (cambio masivo de publico a Amigos)' },
          { en: 'Settings > Apps and websites: remove everything you don\'t actively use', es: 'Ajustes > Apps y sitios web: elimina todo lo que no uses activamente' },
          { en: 'Settings > Face recognition: off', es: 'Ajustes > Reconocimiento facial: desactivar' },
        ],
      },
      {
        heading: { en: 'TikTok', es: 'TikTok' },
        steps: [
          { en: 'Settings > Privacy > Private account: enable', es: 'Ajustes > Privacidad > Cuenta privada: activa' },
          { en: 'Settings > Privacy > Personalized ads: disable', es: 'Ajustes > Privacidad > Anuncios personalizados: desactiva' },
          { en: 'Settings > Privacy > Download your data: review what TikTok stores about you', es: 'Ajustes > Privacidad > Descargar tus datos: revisa que almacena TikTok sobre ti' },
        ],
      },
      {
        heading: { en: 'Cross-Platform: Disable Ad Tracking', es: 'Multiplataforma: Desactiva Rastreo Publicitario' },
        steps: [
          { en: 'iPhone: Settings > Privacy > Tracking > disable "Allow Apps to Request to Track"', es: 'iPhone: Ajustes > Privacidad > Rastreo > desactiva "Permitir que las apps soliciten rastreo"' },
          { en: 'Android: Settings > Privacy > Ads > Delete advertising ID', es: 'Android: Ajustes > Privacidad > Anuncios > Eliminar ID de publicidad' },
        ],
        tip: {
          en: 'Disabling tracking on your phone cuts off the richest data source social platforms use to profile you.',
          es: 'Desactivar el rastreo en tu telefono corta la fuente de datos mas rica que las plataformas sociales usan para perfilarte.',
        },
      },
    ],
  },

  // ─── 18. Credit Card & Banking Security ────────────────────
  {
    id: 'banking-security',
    category: 'passwords',
    icon: 'credit',
    updated: '2026-03',
    title: {
      en: 'Secure Your Banking and Cards',
      es: 'Protege Tu Banca y Tarjetas',
    },
    subtitle: {
      en: 'Transaction alerts, card freezing, spending limits, and skimmer awareness',
      es: 'Alertas de transacciones, congelar tarjetas, limites de gasto y reconocer skimmers',
    },
    sections: [
      {
        heading: { en: 'Enable Transaction Alerts', es: 'Activa Alertas de Transacciones' },
        paragraphs: [
          {
            en: 'Set your bank app to push-notify on every transaction. If someone uses your card, you\'ll know within seconds, not at the end of the month.',
            es: 'Configura tu app del banco para notificarte en cada transaccion. Si alguien usa tu tarjeta, lo sabras en segundos, no al final del mes.',
          },
        ],
        steps: [
          { en: 'Open your banking app > Notifications or Alerts > enable for all transactions', es: 'Abre tu app del banco > Notificaciones o Alertas > activa para todas las transacciones' },
          { en: 'Set the threshold to $0 so you see every charge', es: 'Configura el umbral en $0 para ver cada cargo' },
        ],
      },
      {
        heading: { en: 'Freeze Cards You Don\'t Use', es: 'Congela Tarjetas que No Usas' },
        paragraphs: [
          {
            en: 'Most banking apps freeze and unfreeze a card instantly. Keep cards frozen when idle; unfreezing takes two seconds.',
            es: 'La mayoria de las apps bancarias congelan y descongelan una tarjeta al instante. Manten las tarjetas congeladas cuando no las uses; descongelar toma dos segundos.',
          },
        ],
      },
      {
        heading: { en: 'Set Spending Limits', es: 'Configura Limites de Gasto' },
        paragraphs: [
          {
            en: 'Cap daily ATM withdrawals and online purchase limits. A compromised card drains only up to your cap. Raise the limit temporarily when you need a bigger purchase.',
            es: 'Limita retiros diarios de cajero y compras en linea. Una tarjeta comprometida solo drena hasta tu tope. Sube el limite temporalmente cuando necesites una compra mayor.',
          },
        ],
      },
      {
        heading: { en: 'Recognize Card Skimmers', es: 'Reconoce Skimmers de Tarjetas' },
        paragraphs: [
          {
            en: 'Before inserting your card at an ATM or gas pump, tug the card reader. Skimmers sit loose on the housing. If it moves or looks different from the machine, walk away. Tap-to-pay beats inserting or swiping every time.',
            es: 'Antes de insertar tu tarjeta en un cajero o bomba de gasolina, jala el lector de tarjetas. Los skimmers quedan sueltos en la carcasa. Si se mueve o se ve diferente a la maquina, no lo uses. Pagar con tap supera insertar o deslizar siempre.',
          },
        ],
        tip: {
          en: 'Tap-to-pay (NFC) generates a one-time code per transaction. Even if intercepted, it can\'t be reused. Always tap over swipe.',
          es: 'Pagar con tap (NFC) genera un codigo unico por transaccion. Incluso si es interceptado, no se puede reusar. Siempre tap sobre deslizar.',
        },
      },
    ],
  },
];
