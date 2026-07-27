import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type RedisClientType } from 'redis';

// ---------------------------------------------------------------------------
// Función serverless única para toda la Liga NODO Ladies 2026.
// Guarda todo el estado en una sola clave de Redis (Redis Cloud vía REDIS_URL).
// El frontend llama a /api/league (GET para leer, POST con { action } para escribir).
// ---------------------------------------------------------------------------

const REDIS_KEY = 'nodo_league_data';

// Cliente Redis reutilizable entre invocaciones "calientes" del serverless.
let client: RedisClientType | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client && client.isOpen) return client;
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis Client Error:', err));
  await client.connect();
  return client;
}

const now = () => new Date().toISOString();
const VALID_DATE_IDS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
const VALID_RESULT_TYPES = ['P', 'SF', 'F', 'C'];
const VALID_CATEGORIES = ['8va', '7ma', '6ta'];

function genId(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

// --- SEED INICIAL (solo se usa la primera vez que la base está vacía) ---
function defaultData() {
  return {
    players: [
      { id: 'p1', name: 'Sofía', lastName: 'García', category: '8va', createdAt: now() },
      { id: 'p2', name: 'Martina', lastName: 'López', category: '8va', createdAt: now() },
      { id: 'p3', name: 'Valentina', lastName: 'Rodríguez', category: '8va', createdAt: now() },
      { id: 'p4', name: 'Lucía', lastName: 'Fernández', category: '8va', createdAt: now() },
      { id: 'p5', name: 'Camila', lastName: 'Pérez', category: '8va', createdAt: now() },
      { id: 'p6', name: 'Emma', lastName: 'González', category: '8va', createdAt: now() },
      { id: 'p7', name: 'Delfina', lastName: 'Sánchez', category: '8va', createdAt: now() },
      { id: 'p8', name: 'Zoe', lastName: 'Martínez', category: '8va', createdAt: now() },
      { id: 'p9', name: 'Paula', lastName: 'Romero', category: '7ma', createdAt: now() },
      { id: 'p10', name: 'Agostina', lastName: 'Díaz', category: '7ma', createdAt: now() },
      { id: 'p11', name: 'Florencia', lastName: 'Álvarez', category: '7ma', createdAt: now() },
      { id: 'p12', name: 'María', lastName: 'Torres', category: '7ma', createdAt: now() },
      { id: 'p13', name: 'Carla', lastName: 'Ruiz', category: '7ma', createdAt: now() },
      { id: 'p14', name: 'Julieta', lastName: 'Benítez', category: '7ma', createdAt: now() },
      { id: 'p15', name: 'Victoria', lastName: 'Castro', category: '7ma', createdAt: now() },
      { id: 'p16', name: 'Milagros', lastName: 'Acosta', category: '7ma', createdAt: now() },
      { id: 'p17', name: 'Mariana', lastName: 'Giménez', category: '6ta', createdAt: now() },
      { id: 'p18', name: 'Natalia', lastName: 'Sosa', category: '6ta', createdAt: now() },
      { id: 'p19', name: 'Carolina', lastName: 'Gutiérrez', category: '6ta', createdAt: now() },
      { id: 'p20', name: 'Daniela', lastName: 'Rojas', category: '6ta', createdAt: now() },
      { id: 'p21', name: 'Micaela', lastName: 'Molina', category: '6ta', createdAt: now() },
      { id: 'p22', name: 'Andrea', lastName: 'Ortiz', category: '6ta', createdAt: now() },
      { id: 'p23', name: 'Guadalupe', lastName: 'Silva', category: '6ta', createdAt: now() },
      { id: 'p24', name: 'Sabrina', lastName: 'Núñez', category: '6ta', createdAt: now() },
    ],
    results: [
      { id: 'r1', playerId: 'p1', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r2', playerId: 'p2', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r3', playerId: 'p3', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r4', playerId: 'p4', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r5', playerId: 'p5', dateId: 'F1', resultType: 'SF', updatedAt: now() },
      { id: 'r6', playerId: 'p6', dateId: 'F1', resultType: 'SF', updatedAt: now() },
      { id: 'r7', playerId: 'p7', dateId: 'F1', resultType: 'P', updatedAt: now() },
      { id: 'r8', playerId: 'p8', dateId: 'F1', resultType: 'P', updatedAt: now() },
      { id: 'r9', playerId: 'p3', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r10', playerId: 'p5', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r11', playerId: 'p1', dateId: 'F2', resultType: 'F', updatedAt: now() },
      { id: 'r12', playerId: 'p2', dateId: 'F2', resultType: 'F', updatedAt: now() },
      { id: 'r13', playerId: 'p4', dateId: 'F2', resultType: 'SF', updatedAt: now() },
      { id: 'r14', playerId: 'p7', dateId: 'F2', resultType: 'SF', updatedAt: now() },
      { id: 'r15', playerId: 'p6', dateId: 'F2', resultType: 'P', updatedAt: now() },
      { id: 'r16', playerId: 'p8', dateId: 'F2', resultType: 'P', updatedAt: now() },
      { id: 'r17', playerId: 'p9', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r18', playerId: 'p10', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r19', playerId: 'p11', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r20', playerId: 'p12', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r21', playerId: 'p13', dateId: 'F1', resultType: 'SF', updatedAt: now() },
      { id: 'r22', playerId: 'p14', dateId: 'F1', resultType: 'SF', updatedAt: now() },
      { id: 'r23', playerId: 'p11', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r24', playerId: 'p13', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r25', playerId: 'p9', dateId: 'F2', resultType: 'F', updatedAt: now() },
      { id: 'r26', playerId: 'p10', dateId: 'F2', resultType: 'F', updatedAt: now() },
      { id: 'r27', playerId: 'p17', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r28', playerId: 'p18', dateId: 'F1', resultType: 'C', updatedAt: now() },
      { id: 'r29', playerId: 'p19', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r30', playerId: 'p20', dateId: 'F1', resultType: 'F', updatedAt: now() },
      { id: 'r31', playerId: 'p19', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r32', playerId: 'p21', dateId: 'F2', resultType: 'C', updatedAt: now() },
      { id: 'r33', playerId: 'p17', dateId: 'F2', resultType: 'F', updatedAt: now() },
      { id: 'r34', playerId: 'p18', dateId: 'F2', resultType: 'F', updatedAt: now() },
    ],
    nextFixture: {
      dateText: 'Sábado 15 de Agosto 2026',
      timeText: '09:00 hs',
      venueText: 'NODO Pádel Club - Villa Ramallo',
      notes: 'Fecha 3 (F3) - ¡Acreditación de parejas 8:30 hs!',
      updatedAt: now(),
    },
    datesSchedule: [
      { dateId: 'F1', name: 'Fecha 1 (Junio)', dateText: 'Sábado 13 de Junio 2026', timeText: '09:00 hs', status: 'completada' },
      { dateId: 'F2', name: 'Fecha 2 (Julio)', dateText: 'Sábado 11 de Julio 2026', timeText: '09:00 hs', status: 'completada' },
      { dateId: 'F3', name: 'Fecha 3 (Agosto)', dateText: 'Sábado 15 de Agosto 2026', timeText: '09:00 hs', status: 'proxima' },
      { dateId: 'F4', name: 'Fecha 4 (Septiembre)', dateText: 'Sábado 12 de Septiembre 2026', timeText: '09:00 hs', status: 'pendiente' },
      { dateId: 'F5', name: 'Fecha 5 (Octubre)', dateText: 'Sábado 17 de Octubre 2026', timeText: '09:00 hs', status: 'pendiente' },
      { dateId: 'F6', name: 'Fecha 6 (Noviembre)', dateText: 'Sábado 14 de Noviembre 2026', timeText: '09:00 hs', status: 'pendiente' },
    ],
    adminPin: '1234',
    subscribers: [] as any[],
  };
}

async function loadData() {
  try {
    const c = await getClient();
    const raw = await c.get(REDIS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo Redis:', err);
  }
  const initial = defaultData();
  await saveData(initial);
  return initial;
}

async function saveData(data: any) {
  const c = await getClient();
  await c.set(REDIS_KEY, JSON.stringify(data));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.REDIS_URL) {
    return res.status(500).json({
      error: 'Base de datos no configurada. Falta la variable REDIS_URL en Vercel.',
    });
  }

  try {
    // GET: devolver datos públicos (sin PIN)
    if (req.method === 'GET') {
      const db = await loadData();
      return res.status(200).json({
        players: db.players,
        results: db.results,
        nextFixture: db.nextFixture,
        datesSchedule: db.datesSchedule,
        subscribersCount: (db.subscribers || []).length,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action } = body || {};
      const db = await loadData();

      switch (action) {
        case 'admin-auth': {
          if (body.pin === db.adminPin) {
            return res.status(200).json({ success: true, token: 'nodo-admin-auth-valid' });
          }
          return res.status(401).json({ success: false, error: 'Código PIN incorrecto' });
        }

        case 'change-pin': {
          if (body.currentPin !== db.adminPin) {
            return res.status(401).json({ success: false, error: 'PIN actual incorrecto' });
          }
          if (!body.newPin || String(body.newPin).trim().length < 4) {
            return res.status(400).json({ success: false, error: 'El nuevo PIN debe tener al menos 4 dígitos' });
          }
          db.adminPin = String(body.newPin).trim();
          await saveData(db);
          return res.status(200).json({ success: true });
        }

        case 'get-subscribers': {
          return res.status(200).json({ subscribers: db.subscribers || [] });
        }

        case 'add-player': {
          const { name, lastName, category } = body;
          if (!name || !lastName || !VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, error: 'Datos incompletos o categoría inválida' });
          }
          db.players.push({
            id: genId('p'),
            name: String(name).trim(),
            lastName: String(lastName).trim(),
            category,
            createdAt: now(),
          });
          await saveData(db);
          return res.status(200).json({ success: true });
        }

        case 'delete-player': {
          const { id } = body;
          db.players = db.players.filter((p: any) => p.id !== id);
          db.results = db.results.filter((r: any) => r.playerId !== id);
          await saveData(db);
          return res.status(200).json({ success: true });
        }

        case 'save-result': {
          const { playerId, dateId, resultType } = body;
          if (
            !playerId ||
            !VALID_DATE_IDS.includes(dateId) ||
            !VALID_RESULT_TYPES.includes(resultType)
          ) {
            return res.status(400).json({ success: false, error: 'Resultado o fecha no válidos' });
          }
          if (!db.players.some((p: any) => p.id === playerId)) {
            return res.status(404).json({ success: false, error: 'La participante no existe' });
          }
          const idx = db.results.findIndex((r: any) => r.playerId === playerId && r.dateId === dateId);
          if (idx >= 0) {
            db.results[idx] = { ...db.results[idx], resultType, updatedAt: now() };
          } else {
            db.results.push({ id: genId('r'), playerId, dateId, resultType, updatedAt: now() });
          }
          await saveData(db);
          return res.status(200).json({ success: true });
        }

        case 'delete-result': {
          const { id } = body;
          db.results = db.results.filter((r: any) => r.id !== id);
          await saveData(db);
          return res.status(200).json({ success: true });
        }

        case 'update-fixture': {
          const { dateText, timeText, venueText, notes } = body;
          if (!dateText || !timeText || !venueText) {
            return res.status(400).json({ success: false, error: 'Completá todos los campos obligatorios de la fecha' });
          }
          db.nextFixture = {
            dateText: String(dateText).trim(),
            timeText: String(timeText).trim(),
            venueText: String(venueText).trim(),
            notes: notes ? String(notes).trim() : '',
            updatedAt: now(),
          };
          await saveData(db);
          return res.status(200).json({ success: true, nextFixture: db.nextFixture });
        }

        case 'update-dates-schedule': {
          const { datesSchedule } = body;
          if (!Array.isArray(datesSchedule)) {
            return res.status(400).json({ success: false, error: 'Lista de fechas no válida' });
          }
          db.datesSchedule = datesSchedule;
          await saveData(db);
          return res.status(200).json({ success: true, datesSchedule: db.datesSchedule });
        }

        case 'subscribe': {
          const { phone, name } = body;
          if (!phone || String(phone).trim().length < 8) {
            return res.status(400).json({ success: false, error: 'Ingresá un número de celular válido' });
          }
          const cleanPhone = String(phone).trim().replace(/\s+/g, '');
          if (!db.subscribers.find((s: any) => s.phone === cleanPhone)) {
            db.subscribers.push({
              id: genId('sub'),
              phone: cleanPhone,
              name: name ? String(name).trim() : '',
              createdAt: now(),
            });
            await saveData(db);
          }
          return res.status(200).json({ success: true, count: db.subscribers.length });
        }

        case 'bulk-import': {
          const { players: importedPlayers, results: importedResults, mode } = body;
          if (!Array.isArray(importedPlayers)) {
            return res.status(400).json({ success: false, error: 'Formato de importación inválido' });
          }
          if (mode === 'replace') {
            db.players = [];
            db.results = [];
          }
          let addedPlayersCount = 0;
          let addedResultsCount = 0;

          importedPlayers.forEach((p: any) => {
            if (!p.name || !p.lastName || !p.category) return;
            const cleanCat = VALID_CATEGORIES.includes(p.category) ? p.category : '8va';
            let existing = db.players.find(
              (x: any) =>
                x.name.toLowerCase().trim() === p.name.toLowerCase().trim() &&
                x.lastName.toLowerCase().trim() === p.lastName.toLowerCase().trim() &&
                x.category === cleanCat
            );
            if (!existing) {
              existing = {
                id: genId('p'),
                name: p.name.trim(),
                lastName: p.lastName.trim(),
                category: cleanCat,
                createdAt: now(),
              };
              db.players.push(existing);
              addedPlayersCount++;
            }
            if (p.results && typeof p.results === 'object') {
              Object.keys(p.results).forEach((dateKey) => {
                const dateId = dateKey.toUpperCase();
                if (VALID_DATE_IDS.includes(dateId)) {
                  const resultType = p.results[dateKey];
                  if (VALID_RESULT_TYPES.includes(resultType)) {
                    const resIndex = db.results.findIndex(
                      (r: any) => r.playerId === existing.id && r.dateId === dateId
                    );
                    if (resIndex >= 0) {
                      db.results[resIndex].resultType = resultType;
                    } else {
                      db.results.push({
                        id: genId('r'),
                        playerId: existing.id,
                        dateId,
                        resultType,
                        updatedAt: now(),
                      });
                      addedResultsCount++;
                    }
                  }
                }
              });
            }
          });

          if (Array.isArray(importedResults)) {
            importedResults.forEach((r: any) => {
              if (
                r.playerId &&
                VALID_DATE_IDS.includes(r.dateId) &&
                VALID_RESULT_TYPES.includes(r.resultType)
              ) {
                const resIndex = db.results.findIndex(
                  (x: any) => x.playerId === r.playerId && x.dateId === r.dateId
                );
                if (resIndex >= 0) {
                  db.results[resIndex].resultType = r.resultType;
                } else {
                  db.results.push({
                    id: genId('r'),
                    playerId: r.playerId,
                    dateId: r.dateId,
                    resultType: r.resultType,
                    updatedAt: now(),
                  });
                  addedResultsCount++;
                }
              }
            });
          }

          await saveData(db);
          return res.status(200).json({
            success: true,
            addedPlayersCount,
            addedResultsCount,
            totalPlayers: db.players.length,
            totalResults: db.results.length,
          });
        }

        default:
          return res.status(400).json({ error: 'Acción no reconocida: ' + action });
      }
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err: any) {
    console.error('Error en /api/league:', err);
    return res.status(500).json({ error: 'Error del servidor', detail: String(err?.message || err) });
  }
}
