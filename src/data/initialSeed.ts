import { Player, ResultRecord, NextFixture, DateSchedule } from '../types';

export const INITIAL_DATES_SCHEDULE: DateSchedule[] = [
  { dateId: 'F1', name: 'Fecha 1 (Junio)', dateText: 'Sábado 13 de Junio 2026', timeText: '09:00 hs', status: 'completada' },
  { dateId: 'F2', name: 'Fecha 2 (Julio)', dateText: 'Sábado 11 de Julio 2026', timeText: '09:00 hs', status: 'completada' },
  { dateId: 'F3', name: 'Fecha 3 (Agosto)', dateText: 'Sábado 15 de Agosto 2026', timeText: '09:00 hs', status: 'proxima' },
  { dateId: 'F4', name: 'Fecha 4 (Septiembre)', dateText: 'Sábado 12 de Septiembre 2026', timeText: '09:00 hs', status: 'pendiente' },
  { dateId: 'F5', name: 'Fecha 5 (Octubre)', dateText: 'Sábado 17 de Octubre 2026', timeText: '09:00 hs', status: 'pendiente' },
  { dateId: 'F6', name: 'Fecha 6 (Noviembre)', dateText: 'Sábado 14 de Noviembre 2026', timeText: '09:00 hs', status: 'pendiente' },
];

export const INITIAL_NEXT_FIXTURE: NextFixture = {
  dateText: 'Sábado 15 de Agosto 2026',
  timeText: '09:00 hs',
  venueText: 'NODO Pádel Club - Villa Ramallo',
  notes: 'Fecha 3 (F3) - ¡Acreditación de parejas 8:30 hs!',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PLAYERS: Player[] = [
  // 8va Categoría
  { id: 'p1', name: 'Sofía', lastName: 'García', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Martina', lastName: 'López', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Valentina', lastName: 'Rodríguez', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Lucía', lastName: 'Fernández', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p5', name: 'Camila', lastName: 'Pérez', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p6', name: 'Emma', lastName: 'González', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p7', name: 'Delfina', lastName: 'Sánchez', category: '8va', createdAt: new Date().toISOString() },
  { id: 'p8', name: 'Zoe', lastName: 'Martínez', category: '8va', createdAt: new Date().toISOString() },

  // 7ma Categoría
  { id: 'p9', name: 'Paula', lastName: 'Romero', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p10', name: 'Agostina', lastName: 'Díaz', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p11', name: 'Florencia', lastName: 'Álvarez', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p12', name: 'María', lastName: 'Torres', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p13', name: 'Carla', lastName: 'Ruiz', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p14', name: 'Julieta', lastName: 'Benítez', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p15', name: 'Victoria', lastName: 'Castro', category: '7ma', createdAt: new Date().toISOString() },
  { id: 'p16', name: 'Milagros', lastName: 'Acosta', category: '7ma', createdAt: new Date().toISOString() },

  // 6ta Categoría
  { id: 'p17', name: 'Mariana', lastName: 'Giménez', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p18', name: 'Natalia', lastName: 'Sosa', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p19', name: 'Carolina', lastName: 'Gutiérrez', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p20', name: 'Daniela', lastName: 'Rojas', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p21', name: 'Micaela', lastName: 'Molina', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p22', name: 'Andrea', lastName: 'Ortiz', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p23', name: 'Guadalupe', lastName: 'Silva', category: '6ta', createdAt: new Date().toISOString() },
  { id: 'p24', name: 'Sabrina', lastName: 'Núñez', category: '6ta', createdAt: new Date().toISOString() },
];

export const INITIAL_RESULTS: ResultRecord[] = [
  // --- 8va CATEGORIA ---
  // Fecha 1
  { id: 'r1', playerId: 'p1', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() }, // Campeona 40
  { id: 'r2', playerId: 'p2', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() }, // Campeona 40
  { id: 'r3', playerId: 'p3', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() }, // Final 30
  { id: 'r4', playerId: 'p4', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() }, // Final 30
  { id: 'r5', playerId: 'p5', dateId: 'F1', resultType: 'SF', updatedAt: new Date().toISOString() }, // SF 25
  { id: 'r6', playerId: 'p6', dateId: 'F1', resultType: 'SF', updatedAt: new Date().toISOString() }, // SF 25
  { id: 'r7', playerId: 'p7', dateId: 'F1', resultType: 'P', updatedAt: new Date().toISOString() },  // P 20
  { id: 'r8', playerId: 'p8', dateId: 'F1', resultType: 'P', updatedAt: new Date().toISOString() },  // P 20

  // Fecha 2
  { id: 'r9', playerId: 'p3', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() },  // Campeona 40
  { id: 'r10', playerId: 'p5', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() }, // Campeona 40
  { id: 'r11', playerId: 'p1', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() }, // Final 30
  { id: 'r12', playerId: 'p2', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() }, // Final 30
  { id: 'r13', playerId: 'p4', dateId: 'F2', resultType: 'SF', updatedAt: new Date().toISOString() },// SF 25
  { id: 'r14', playerId: 'p7', dateId: 'F2', resultType: 'SF', updatedAt: new Date().toISOString() },// SF 25
  { id: 'r15', playerId: 'p6', dateId: 'F2', resultType: 'P', updatedAt: new Date().toISOString() }, // P 20
  { id: 'r16', playerId: 'p8', dateId: 'F2', resultType: 'P', updatedAt: new Date().toISOString() }, // P 20

  // --- 7ma CATEGORIA ---
  // Fecha 1
  { id: 'r17', playerId: 'p9', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r18', playerId: 'p10', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r19', playerId: 'p11', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() },
  { id: 'r20', playerId: 'p12', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() },
  { id: 'r21', playerId: 'p13', dateId: 'F1', resultType: 'SF', updatedAt: new Date().toISOString() },
  { id: 'r22', playerId: 'p14', dateId: 'F1', resultType: 'SF', updatedAt: new Date().toISOString() },

  // Fecha 2
  { id: 'r23', playerId: 'p11', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r24', playerId: 'p13', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r25', playerId: 'p9', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() },
  { id: 'r26', playerId: 'p10', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() },

  // --- 6ta CATEGORIA ---
  // Fecha 1
  { id: 'r27', playerId: 'p17', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r28', playerId: 'p18', dateId: 'F1', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r29', playerId: 'p19', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() },
  { id: 'r30', playerId: 'p20', dateId: 'F1', resultType: 'F', updatedAt: new Date().toISOString() },

  // Fecha 2
  { id: 'r31', playerId: 'p19', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r32', playerId: 'p21', dateId: 'F2', resultType: 'C', updatedAt: new Date().toISOString() },
  { id: 'r33', playerId: 'p17', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() },
  { id: 'r34', playerId: 'p18', dateId: 'F2', resultType: 'F', updatedAt: new Date().toISOString() },
];
