// Colores, textos de ayuda y voz. Separados de las pantallas.
export const colors = {
  bg: '#F7F6F0',
  card: '#FFFFFF',
  text: '#1B1B1B',
  muted: '#6F6D66',
  line: '#E4E0D4',
  green: '#188145',
  greenInk: '#0F4D28',
  greenSoft: '#E3F6EA',
  brown: '#B15509',
  brownInk: '#8A4E08',
  amberSoft: '#FFF3D6',
  blue: '#1E4CD5',
  blueSoft: '#E7EEFF',
  purple: '#6D27DA',
  purpleSoft: '#F0E8FF',
  teal: '#00A884',
  tealSoft: '#E5F8F3',
  red: '#B41D20',
  redSoft: '#FDE8E6',
  navy: '#2C2E2D',
  warning: '#FFF4CC',
  warningInk: '#7A5A10',
  disabled: '#E4E0D6',
  disabledText: '#8E8B82',
  coin: '#E8B423',
  white: '#FFFFFF',
}

export const methods = {
  efectivo: {
    label: 'Efectivo',
    color: colors.blue,
    soft: colors.blueSoft,
  },
  yape: {
    label: 'Yape',
    color: colors.purple,
    soft: colors.purpleSoft,
  },
  plin: {
    label: 'Plin',
    color: colors.teal,
    soft: colors.tealSoft,
  },
  fiado: {
    label: 'Fiado',
    color: colors.brown,
    soft: colors.amberSoft,
  },
}

export const periods = [
  { id: 'hoy', label: 'Hoy', title: 'Caja de hoy' },
  { id: 'semana', label: 'Semana', title: 'Caja de la semana' },
  { id: 'quincena', label: 'Quincena', title: 'Caja de la quincena' },
  { id: 'mes', label: 'Mes', title: 'Caja del mes' },
]

export const quickAmounts = [
  { label: 'S/1', cents: 100 },
  { label: 'S/5', cents: 500 },
  { label: 'S/10', cents: 1000 },
  { label: 'S/20', cents: 2000 },
  { label: 'S/50', cents: 5000 },
]

export const helpText = {
  splash:
    'Crea tu cuenta o toca Iniciar sesión si ya la tienes.',
  register:
    'Tu nombre y tu celular sirven para reconocerte cuando vuelvas a entrar.',
  code: 'El código tiene 6 números. En esta prueba puedes usar 123456.',
  pin: 'La clave tiene 6 números. La vas a escribir cada vez que entres.',
  avatar:
    'Elige una mujer o un hombre. El que tocas se mueve. Si apagas la imagen, se muestra la inicial de tu nombre.',
  login:
    'Iniciar sesión pide tu celular y tu clave. La cuenta de demostración es Flor: 999 888 777, clave 123456.',
  home:
    'Nueva venta anota un cobro con la calculadora. Ver todas las ventas abre el historial por fecha. Balance junta la caja. Fiados es lo que te deben. Abajo, los iconos llevan a Inicio, Venta, Balance, Fiados y Cuenta. Escuchar explica cada pantalla.',
  sale: 'Escribe el monto, usa el punto para los centavos y toca el signo más. El igual deja el total. La flecha roja borra el último número. También puedes tocar Hablar y decirlo. Después marcas efectivo, Yape, Plin o fiado. El número de operación se escribe o se dice con el botón Decir.',
  sales:
    'Aquí están todas las ventas, organizadas por fecha y de la más reciente a la más antigua. Abre una para ver el detalle. Si te equivocaste, puedes anularla.',
  balance:
    'Cambia entre hoy, semana, quincena y mes. El recuadro de abajo es lo que todavía te deben.',
  account:
    'Toca Configurar para cambiar tu icono, tu clave y los celulares de Yape y de Plin. También puedes cerrar sesión.',
  settings:
    'Elige tu icono. Cambia la clave solo si escribes la actual y la nueva. Actualiza el celular de Yape y el de Plin. Esos números salen en cada código. Al final toca Guardar.',
  fiados:
    'Anota a quién le fiaste y cuánto. Cuando te paguen, abre a la persona y toca Cobrar.',
  person:
    'Arriba ves cuánto te debe. Anotar fiado suma deuda. Cobrar registra el pago y entra a la caja.',
  a11y:
    'Desde aquí agrandas la letra, subes el contraste, pones el fondo negro, separas el texto y haces que Escuchar hable más despacio. Contraste y fondo negro se usan de uno en uno. Escuchar está en cada pantalla.',
}

export const voiceText = {
  splash:
    'Esta es la bienvenida de CajaFácil. Puedes crear tu cuenta, o tocar Iniciar sesión si ya tienes una.',
  register:
    'Este módulo crea tu cuenta. Escribe tu nombre y tu celular para que la app te reconozca cuando vuelvas.',
  code:
    'Esta pantalla pide un código de seis números. En esta prueba puedes usar uno, dos, tres, cuatro, cinco, seis.',
  pin:
    'Aquí eliges tu clave de seis números. Esa clave la escribes cada vez que entras a tu caja.',
  avatar:
    'Aquí eliges cómo quieres verte. Hay mujeres y hombres distintos. El que tocas se mueve. Si apagas la foto, se muestra la primera letra de tu nombre.',
  login:
    'Este módulo es Iniciar sesión. Escribe tu celular y tu clave. La cuenta de prueba es Flor. Su celular es nueve, nueve, nueve, ocho, ocho, ocho, siete, siete, siete. Su clave es uno, dos, tres, cuatro, cinco, seis.',
  home:
    'Este es el inicio de tu bodega. Nueva venta anota un cobro con la calculadora. Ver todas las ventas abre el historial por fecha. Balance junta la caja. Fiados es lo que te deben. Abajo hay iconos de celular: Inicio, Venta, Balance, Fiados y Cuenta. Cerrar sesión te saca de la caja.',
  sale:
    'Este módulo anota una venta. Escribes el monto, el punto si hay centavos, y tocas el signo más para sumar otro. El botón igual deja el total. La flecha roja borra el último número o el último monto sumado. También puedes tocar Hablar y decir el monto, por ejemplo cinco soles. Después eliges si pagaron en efectivo, con Yape, con Plin o se lo llevaron fiado. El número de operación se puede decir tocando Decir.',
  sales:
    'Este módulo muestra todas las ventas, organizadas por fecha y de la más reciente a la más antigua. Abre una para ver el detalle. Si te equivocaste, puedes anularla. La app pregunta antes de anular.',
  balance:
    'Este módulo junta el dinero de la caja. Puedes ver hoy, la semana, la quincena o el mes. El recuadro de abajo es lo que todavía te deben.',
  account:
    'Este módulo es tu cuenta. Toca Configurar para cambiar tu icono, tu clave y los números de Yape y de Plin. También puedes cerrar sesión.',
  settings:
    'Esta pantalla es Configurar. Puedes cambiar tu icono, cambiar tu clave de seis números y actualizar el celular que sale en el código de Yape y el que sale en el código de Plin. Cuando termines, toca Guardar.',
  fiados:
    'Este módulo es de fiados. Anota a quién le fiaste y cuánto. Cuando te paguen, abre a la persona y toca Cobrar.',
  person:
    'Esta pantalla es de una persona. Arriba ves cuánto te debe. Anotar fiado suma deuda. Cobrar registra el pago y el dinero entra a la caja.',
  a11y:
    'Este módulo ajusta la pantalla para leer con más calma. Puedes poner la letra normal, grande o muy grande, subir el contraste, cambiar el fondo de blanco a negro y separar las líneas. Contraste y fondo negro se usan de uno en uno. También puedes hacer que Escuchar hable más despacio. Escuchar está en cada módulo y explica para qué sirve.',
}
