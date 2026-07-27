import {
  Player,
  ResultRecord,
  NextFixture,
  DateSchedule,
  Category,
  DateId,
  ResultType,
  Subscriber,
} from '../types';
import {
  INITIAL_PLAYERS,
  INITIAL_RESULTS,
  INITIAL_NEXT_FIXTURE,
  INITIAL_DATES_SCHEDULE,
} from './initialSeed';

// ---------------------------------------------------------------------------
// Capa de persistencia local (reemplaza al backend Express + archivo JSON).
// Todos los datos de la liga viven en localStorage del navegador.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'nodo_league_data';

export interface LeagueStorage {
  players: Player[];
  results: ResultRecord[];
  nextFixture: NextFixture;
  datesSchedule: DateSchedule[];
  adminPin: string;
  subscribers: Subscriber[];
}

const VALID_DATE_IDS: DateId[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
const VALID_RESULT_TYPES: ResultType[] = ['P', 'SF', 'F', 'C'];
const VALID_CATEGORIES: Category[] = ['8va', '7ma', '6ta'];

function genId(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

function defaultData(): LeagueStorage {
  return {
    players: INITIAL_PLAYERS,
    results: INITIAL_RESULTS,
    nextFixture: INITIAL_NEXT_FIXTURE,
    datesSchedule: INITIAL_DATES_SCHEDULE,
    adminPin: '1234',
    subscribers: [],
  };
}

export function loadLeagueData(): LeagueStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        players: parsed.players || INITIAL_PLAYERS,
        results: parsed.results || INITIAL_RESULTS,
        nextFixture: parsed.nextFixture || INITIAL_NEXT_FIXTURE,
        datesSchedule: parsed.datesSchedule || INITIAL_DATES_SCHEDULE,
        adminPin: parsed.adminPin || '1234',
        subscribers: parsed.subscribers || [],
      };
    }
  } catch (err) {
    console.error('Error leyendo datos locales, inicializando por defecto:', err);
  }
  const initial = defaultData();
  saveLeagueData(initial);
  return initial;
}

export function saveLeagueData(data: LeagueStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando datos locales:', err);
  }
}

// --- OPERACIONES (equivalentes a los endpoints del server) ---

export function getPublicData() {
  const db = loadLeagueData();
  return {
    players: db.players,
    results: db.results,
    nextFixture: db.nextFixture,
    datesSchedule: db.datesSchedule || INITIAL_DATES_SCHEDULE,
    subscribersCount: db.subscribers.length,
  };
}

export function checkAdminPin(pin: string): boolean {
  const db = loadLeagueData();
  return pin === db.adminPin;
}

export function changeAdminPin(
  currentPin: string,
  newPin: string
): { success: boolean; error?: string } {
  const db = loadLeagueData();
  if (currentPin !== db.adminPin) {
    return { success: false, error: 'PIN actual incorrecto' };
  }
  if (!newPin || newPin.trim().length < 4) {
    return { success: false, error: 'El nuevo PIN debe tener al menos 4 dígitos' };
  }
  db.adminPin = newPin.trim();
  saveLeagueData(db);
  return { success: true };
}

export function addPlayer(name: string, lastName: string, category: Category): boolean {
  if (!name || !lastName || !VALID_CATEGORIES.includes(category)) return false;
  const db = loadLeagueData();
  db.players.push({
    id: genId('p'),
    name: name.trim(),
    lastName: lastName.trim(),
    category,
    createdAt: new Date().toISOString(),
  });
  saveLeagueData(db);
  return true;
}

export function deletePlayer(id: string): boolean {
  const db = loadLeagueData();
  db.players = db.players.filter((p) => p.id !== id);
  db.results = db.results.filter((r) => r.playerId !== id);
  saveLeagueData(db);
  return true;
}

export function saveResult(playerId: string, dateId: DateId, resultType: ResultType): boolean {
  if (
    !playerId ||
    !VALID_DATE_IDS.includes(dateId) ||
    !VALID_RESULT_TYPES.includes(resultType)
  ) {
    return false;
  }
  const db = loadLeagueData();
  if (!db.players.some((p) => p.id === playerId)) return false;

  const idx = db.results.findIndex((r) => r.playerId === playerId && r.dateId === dateId);
  if (idx >= 0) {
    db.results[idx] = { ...db.results[idx], resultType, updatedAt: new Date().toISOString() };
  } else {
    db.results.push({
      id: genId('r'),
      playerId,
      dateId,
      resultType,
      updatedAt: new Date().toISOString(),
    });
  }
  saveLeagueData(db);
  return true;
}

export function deleteResult(id: string): boolean {
  const db = loadLeagueData();
  db.results = db.results.filter((r) => r.id !== id);
  saveLeagueData(db);
  return true;
}

export function updateFixture(fixture: NextFixture): boolean {
  if (!fixture.dateText || !fixture.timeText || !fixture.venueText) return false;
  const db = loadLeagueData();
  db.nextFixture = {
    dateText: fixture.dateText.trim(),
    timeText: fixture.timeText.trim(),
    venueText: fixture.venueText.trim(),
    notes: fixture.notes ? fixture.notes.trim() : '',
    updatedAt: new Date().toISOString(),
  };
  saveLeagueData(db);
  return true;
}

export function updateDatesSchedule(datesSchedule: DateSchedule[]): boolean {
  if (!Array.isArray(datesSchedule)) return false;
  const db = loadLeagueData();
  db.datesSchedule = datesSchedule;
  saveLeagueData(db);
  return true;
}

export function subscribe(phone: string, name: string): boolean {
  if (!phone || phone.trim().length < 8) return false;
  const db = loadLeagueData();
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  if (!db.subscribers.find((s) => s.phone === cleanPhone)) {
    db.subscribers.push({
      id: genId('sub'),
      phone: cleanPhone,
      name: name ? name.trim() : '',
      createdAt: new Date().toISOString(),
    });
    saveLeagueData(db);
  }
  return true;
}

export function getSubscribers(): Subscriber[] {
  const db = loadLeagueData();
  return db.subscribers;
}

export function bulkImport(data: {
  players: any[];
  results?: any[];
  mode?: string;
}): {
  success: boolean;
  addedPlayersCount: number;
  addedResultsCount: number;
  totalPlayers: number;
  totalResults: number;
} | null {
  const { players: importedPlayers, results: importedResults, mode } = data;
  if (!Array.isArray(importedPlayers)) return null;

  const db = loadLeagueData();

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
      (x) =>
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
        createdAt: new Date().toISOString(),
      };
      db.players.push(existing);
      addedPlayersCount++;
    }

    if (p.results && typeof p.results === 'object') {
      Object.keys(p.results).forEach((dateKey) => {
        const dateId = dateKey.toUpperCase() as DateId;
        if (VALID_DATE_IDS.includes(dateId)) {
          const resultType = p.results[dateKey];
          if (VALID_RESULT_TYPES.includes(resultType)) {
            const resIndex = db.results.findIndex(
              (r) => r.playerId === existing!.id && r.dateId === dateId
            );
            if (resIndex >= 0) {
              db.results[resIndex].resultType = resultType;
            } else {
              db.results.push({
                id: genId('r'),
                playerId: existing!.id,
                dateId,
                resultType,
                updatedAt: new Date().toISOString(),
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
          (x) => x.playerId === r.playerId && x.dateId === r.dateId
        );
        if (resIndex >= 0) {
          db.results[resIndex].resultType = r.resultType;
        } else {
          db.results.push({
            id: genId('r'),
            playerId: r.playerId,
            dateId: r.dateId,
            resultType: r.resultType,
            updatedAt: new Date().toISOString(),
          });
          addedResultsCount++;
        }
      }
    });
  }

  saveLeagueData(db);
  return {
    success: true,
    addedPlayersCount,
    addedResultsCount,
    totalPlayers: db.players.length,
    totalResults: db.results.length,
  };
}
