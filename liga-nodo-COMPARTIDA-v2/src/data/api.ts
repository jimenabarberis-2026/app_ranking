import { NextFixture, DateSchedule, Category, DateId, ResultType, TournamentType, Subscriber } from '../types';

// ---------------------------------------------------------------------------
// Cliente de datos: habla con la función serverless /api/league.
// Todos los datos son compartidos (viven en Redis), así que todas las
// jugadoras ven lo mismo desde cualquier dispositivo.
// ---------------------------------------------------------------------------

const ENDPOINT = '/api/league';

async function post(action: string, payload: Record<string, any> = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function getPublicData() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error('No se pudo cargar la liga');
  return res.json();
}

export async function checkAdminPin(pin: string): Promise<boolean> {
  const { ok } = await post('admin-auth', { pin });
  return ok;
}

export async function changeAdminPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  const { ok, data } = await post('change-pin', { currentPin, newPin });
  return { success: ok && data.success, error: data.error };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const { ok, data } = await post('get-subscribers');
  return ok ? data.subscribers || [] : [];
}

export async function addPlayer(name: string, lastName: string, category: Category): Promise<boolean> {
  const { ok } = await post('add-player', { name, lastName, category });
  return ok;
}

export async function deletePlayer(id: string): Promise<boolean> {
  const { ok } = await post('delete-player', { id });
  return ok;
}

export async function saveResult(playerId: string, dateId: DateId, resultType: ResultType, tournament: TournamentType = 'unico'): Promise<boolean> {
  const { ok } = await post('save-result', { playerId, dateId, resultType, tournament });
  return ok;
}

export async function deleteResult(id: string): Promise<boolean> {
  const { ok } = await post('delete-result', { id });
  return ok;
}

export async function updateFixture(fixture: NextFixture): Promise<boolean> {
  const { ok } = await post('update-fixture', fixture);
  return ok;
}

export async function updateDatesSchedule(datesSchedule: DateSchedule[]): Promise<boolean> {
  const { ok } = await post('update-dates-schedule', { datesSchedule });
  return ok;
}

export async function subscribe(phone: string, name: string): Promise<boolean> {
  const { ok } = await post('subscribe', { phone, name });
  return ok;
}

export async function bulkImport(payload: {
  players: any[];
  results?: any[];
  mode?: string;
}): Promise<any | null> {
  const { ok, data } = await post('bulk-import', payload);
  return ok ? data : null;
}
