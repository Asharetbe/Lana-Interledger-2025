// v3.6: simple i18n ES -> EN
(function(){
  const dict = {
    en: {
      'btn.login': 'Sign in',
      'btn.signup': 'Create account',
      'btn.lang': 'EN',
      'hero.kicker': 'Welcome',
      'hero.h1': 'Pay and get paid without hassle',
      'hero.lead': 'With lana you can receive payments in seconds and send money to anyone in any currency.',
      'hero.cta.download': 'Download app',
      'quees.kicker': 'What is LANA?',
      'quees.h2': 'Stress-free digital payments',
      'quees.p': 'A payment platform built for small merchants, service workers and micro-businesses. Get paid with QR, links or direct payments and track your sales from your phone.',
      'cf.kicker': 'How it works',
      'cf.h2': '3 steps, no fuss',
      'cf.card1.t': 'Sign up',
      'cf.card1.p': 'Verify your business in minutes.',
      'cf.card2.t': 'Share',
      'cf.card2.p': 'Send your link or show a QR to get paid.',
      'cf.card3.t': 'Get your money',
      'cf.card3.p': 'Instant confirmation and full control.',
      'ben.kicker': 'Benefits',
      'ben.h2': 'Built for everyday commerce',
      'ben.c1.t': 'Fast',
      'ben.c1.p': 'Create and share your charge instantly.',
      'ben.c2.t': 'Secure',
      'ben.c2.p': 'Data and transactions protected with encryption.',
      'ben.c3.t': 'No waiting',
      'ben.c3.p': 'Real-time notifications and quick settlements.',
      'ben.c4.t': 'Clear dashboard',
      'ben.c4.p': 'Sales, reports and withdrawals in one place.',
      'faq.kicker': 'FAQ',
      'faq.h2': 'We’ve got answers',
      'faq.q1': 'Do I need to be registered with the tax authority?',
      'faq.a1': 'You can start charging. For higher amounts or invoicing, we’ll guide you.',
      'faq.q2': 'How long until I receive my money?',
      'faq.a2': 'Confirmations are instant; settlement depends on the method.',
      'faq.q3': 'What fees do you charge?',
      'faq.a3': 'Flat fee per transaction. You’ll see the cost before confirming.',
      'faq.q4': 'What do I need to open my account?',
      'faq.a4': 'Valid ID and phone number. It only takes a few minutes.',
      'faq.q5': 'Can I receive tips?',
      'faq.a5': 'Yes, enable tip mode for waiters, couriers or services.',
      'faq.q6': 'Is there support if I have a problem?',
      'faq.a6': 'Yes, chat and WhatsApp with extended hours.',
      'footer.copy': '© LANA 2025 · Simple and secure payments'
    },
    es: {
      'btn.login': 'Iniciar sesión',
      'btn.signup': 'Crear cuenta',
      'btn.lang': 'ES',
      'hero.kicker': 'Bienvenida',
      'hero.h1': 'Cobra y paga sin enredos',
      'hero.lead': 'Con lana puedes recibir pagos en segundos y enviar dinero a quien necesites en cualquier divisa.',
      'hero.cta.download': 'Descargar app',
      'quees.kicker': '¿Qué es LANA?',
      'quees.h2': 'Tu cobro digital sin estrés',
      'quees.p': 'Plataforma de pagos pensada para comerciantes pequeños, prestadores de servicio (propinas, taxis) y microempresas. Cobra con QR, links o pago directo, y controla tus ventas desde tu celular.',
      'cf.kicker': 'Cómo funciona',
      'cf.h2': 'En 3 pasos, sin vueltas',
      'cf.card1.t': 'Regístrate',
      'cf.card1.p': 'Valida tu negocio en minutos.',
      'cf.card2.t': 'Comparte',
      'cf.card2.p': 'Envía tu link o muestra el QR para cobrar.',
      'cf.card3.t': 'Recibe tu lana',
      'cf.card3.p': 'Confirmación inmediata y control total.',
      'ben.kicker': 'Beneficios',
      'ben.h2': 'Hecha para el día a día del comercio',
      'ben.c1.t': 'Rápido',
      'ben.c1.p': 'Genera y comparte tu cobro al instante.',
      'ben.c2.t': 'Seguro',
      'ben.c2.p': 'Protección de datos y transacciones con cifrado.',
      'ben.c3.t': 'Sin esperas',
      'ben.c3.p': 'Notificaciones y liquidaciones ágiles.',
      'ben.c4.t': 'Panel claro',
      'ben.c4.p': 'Ventas, reportes y retiros en un solo lugar.',
      'faq.kicker': 'Preguntas frecuentes',
      'faq.h2': 'Resolvemos tus dudas',
      'faq.q1': '¿Necesito estar dado de alta en el SAT?',
      'faq.a1': 'Puedes empezar a cobrar. Para montos altos o facturar, te guiamos paso a paso.',
      'faq.q2': '¿En cuánto tiempo recibo mi dinero?',
      'faq.a2': 'Confirmaciones inmediatas; la liquidación depende del método elegido.',
      'faq.q3': '¿Qué comisiones manejan?',
      'faq.a3': 'Comisión plana por transacción. Verás el costo antes de confirmar.',
      'faq.q4': '¿Qué necesito para abrir mi cuenta?',
      'faq.a4': 'Identificación vigente y número de celular. Toma unos minutos.',
      'faq.q5': '¿Puedo recibir propinas?',
      'faq.a5': 'Sí, modo propinas para meseros, repartidores o servicios.',
      'faq.q6': '¿Hay soporte si tengo un problema?',
      'faq.a6': 'Sí, chat y WhatsApp en horario extendido.',
      'footer.copy': '© LANA 2025 · Pagos simples y seguros'
    }
  };

  const els = document.querySelectorAll('[data-i18n]');
  function apply(lang){
    els.forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const txt = (dict[lang]||{})[key];
      if(!txt) return;
      if(el.tagName.toLowerCase()==='input' || el.tagName.toLowerCase()==='textarea'){
        el.placeholder = txt;
      } else {
        el.textContent = txt;
      }
    });
    localStorage.setItem('lana_lang', lang);
    const langBtn = document.querySelector('.btn.lang');
    if(langBtn) langBtn.textContent = (dict[lang]['btn.lang']||lang.toUpperCase());
  }

  function toggle(){
    const cur = localStorage.getItem('lana_lang') || 'es';
    const next = cur === 'es' ? 'en' : 'es';
    apply(next);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const init = localStorage.getItem('lana_lang') || 'es';
    apply(init);
    const langBtn = document.querySelector('.btn.lang');
    if(langBtn) langBtn.addEventListener('click', (e)=>{e.preventDefault(); toggle();});
  });
})();