import type { Month, Question } from "@/types/finova";

export const MONTHS_CATALOG: Month[] = [
      { id: 1, name: 'Enero', title: 'El Primer Paso del Ahorro', icon: '🌟', rewardCoins: 3000, rewardXP: 80, topic: 'Ahorro Inicial', desc: 'Aprende a separar una parte de tu mesada antes de gastar.' },
      { id: 2, name: 'Febrero', title: 'Necesidades vs. Deseos', icon: '🧭', rewardCoins: 3200, rewardXP: 85, topic: 'Consumo Inteligente', desc: 'Diferencia lo que realmente necesitas de los antojos.' },
      { id: 3, name: 'Marzo', title: 'La Alcancía Inteligente', icon: '🐷', rewardCoins: 3500, rewardXP: 90, topic: 'Metas Cortas', desc: 'Organiza tu alcancía con objetivos claros y medibles.' },
      { id: 4, name: 'Abril', title: 'Cazadores de Gastos Hormiga', icon: '🐜', rewardCoins: 3500, rewardXP: 95, topic: 'Control de Gastos', desc: 'Detecta pequeños gastos diarios que suman mucho dinero.' },
      { id: 5, name: 'Mayo', title: 'El Poder de Compartir y ODS', icon: '🌍', rewardCoins: 4000, rewardXP: 100, topic: 'Impacto Social', desc: 'Descubre cómo el uso responsable del dinero cuida el planeta.' },
      { id: 6, name: 'Junio', title: 'Presupuesto Familiar 50/30/20', icon: '📊', rewardCoins: 4000, rewardXP: 105, topic: 'Presupuesto', desc: 'Divide tus ingresos en necesidades, gustos y ahorro.' },
      { id: 7, name: 'Julio', title: 'Comparando Precios como Pro', icon: '🏷️', rewardCoins: 4200, rewardXP: 110, topic: 'Compras Sabias', desc: 'Compara calidad y precio antes de tomar una decisión.' },
      { id: 8, name: 'Agosto', title: 'Emprendimiento Escolar', icon: '🚀', rewardCoins: 4500, rewardXP: 120, topic: 'Creación de Valor', desc: 'Transforma tus talentos en ideas que generan ingresos.' },
      { id: 9, name: 'Septiembre', title: 'El Interés y la Paciencia', icon: '🌱', rewardCoins: 4500, rewardXP: 120, topic: 'Crecimiento', desc: 'Mira cómo crece tu ahorro cuando eres constante.' },
      { id: 10, name: 'Octubre', title: 'Seguridad Digital y Dinero', icon: '🛡️', rewardCoins: 4800, rewardXP: 130, topic: 'Protección', desc: 'Protege tus claves y evita trampas en juegos y compras.' },
      { id: 11, name: 'Noviembre', title: 'Fondo de Emergencia', icon: '🛟', rewardCoins: 5000, rewardXP: 140, topic: 'Prevención', desc: 'Prepárate para imprevistos sin perder tus metas.' },
      { id: 12, name: 'Diciembre', title: 'Gran Feria Financiera FINOVA', icon: '🏆', rewardCoins: 6000, rewardXP: 180, topic: 'Maestría Anual', desc: 'Demuestra todo lo aprendido durante el año escolar.' }
    ];

export const DEFAULT_QUESTIONS: Question[] = [
      {
        id: 'q1',
        monthId: 1,
        question: 'Valeria recibe $10.000 de mesada esta semana y quiere comprar una bicicleta en 3 meses. ¿Cuál es la decisión más inteligente?',
        options: [
          'Guardar primero $4.000 en su alcancía y planear el resto',
          'Gastar todo en dulces hoy y esperar tener suerte después',
          'Prestar todo su dinero sin anotar a quién se lo dio'
        ],
        correctIndex: 0,
        explanation: '¡Exacto! "Pagarte a ti misma primero" guardando una parte apenas recibes dinero asegura que alcances tu meta.'
      },
      {
        id: 'q2',
        monthId: 1,
        question: '¿Qué es un "Gasto Hormiga"?',
        options: [
          'Comprar un cuaderno para estudiar matemáticas',
          'Pequeños gastos diarios en antojos que parecen poco pero suman mucho',
          'Guardar monedas de $500 en un frasco transparente'
        ],
        correctIndex: 1,
        explanation: '¡Muy bien! Un dulce o bebida todos los días puede parecer barato, pero al final del mes suma miles de pesos.'
      },
      {
        id: 'q3',
        monthId: 1,
        question: 'Si tienes una meta de ahorro de $20.000 y ya tienes $15.000, ¿qué porcentaje te falta?',
        options: [
          'Me falta $5.000 (el 25% de la meta)',
          'Ya me pasé de la meta por $5.000',
          'Me falta la mitad exacta ($10.000)'
        ],
        correctIndex: 0,
        explanation: '¡Excelente cálculo! $20.000 - $15.000 = $5.000, que equivale a un cuarto (25%) del total.'
      },
      {
        id: 'q4',
        monthId: 2,
        question: 'Entre unas zapatillas para educación física porque las actuales se rompieron y un juguete de moda, ¿cuál es una NECESIDAD?',
        options: [
          'El juguete de moda porque todos lo tienen',
          'Las zapatillas para educación física',
          'Ninguno de los dos es importante'
        ],
        correctIndex: 1,
        explanation: '¡Correcto! Las necesidades son indispensables para tu bienestar, salud y estudio.'
      },
      {
        id: 'q5',
        monthId: 2,
        question: 'Antes de comprar algo que viste en un anuncio llamativo, ¿qué regla recomienda el Club FINOVA?',
        options: [
          'Esperar 24 horas y preguntar: ¿De verdad lo necesito?',
          'Comprarlo inmediatamente antes de pensarlo',
          'Romper la alcancía completa sin mirar el precio'
        ],
        correctIndex: 0,
        explanation: '¡Genial! La regla de las 24 horas evita compras impulsivas y protege tus metas.'
      },
      {
        id: 'q6',
        monthId: 3,
        question: 'En la regla del presupuesto 50 / 30 / 20, ¿a qué corresponde el 20%?',
        options: [
          'Ahorro y metas futuras',
          'Solo videojuegos y golosinas',
          'Pérdidas y descuidos'
        ],
        correctIndex: 0,
        explanation: '¡Súper! 50% necesidades, 30% gustos sanos y 20% ahorro constante.'
      }
    ];
