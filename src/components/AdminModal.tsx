import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Player, ResultRecord, NextFixture, DateSchedule, Category, DateId, ResultType, ComputedPlayerRanking } from '../types';
import { ALL_DATES, DATE_NAMES, RESULT_LABELS, computeRankingsForCategory } from '../utils/points';
import { toPng } from 'html-to-image';
import { Logo } from './Logo';
import {
  X,
  Lock,
  UserPlus,
  Trophy,
  Calendar,
  Instagram,
  Download,
  Key,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  Share2,
  Users,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  Upload,
  RefreshCw,
  Edit3
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (pin: string) => Promise<boolean>;
  players: Player[];
  results: ResultRecord[];
  nextFixture: NextFixture;
  datesSchedule?: DateSchedule[];
  onAddPlayer: (player: { name: string; lastName: string; category: Category }) => Promise<boolean>;
  onDeletePlayer: (id: string) => Promise<boolean>;
  onSaveResult: (result: { playerId: string; dateId: DateId; resultType: ResultType }) => Promise<boolean>;
  onDeleteResult: (id: string) => Promise<boolean>;
  onUpdateFixture: (fixture: NextFixture) => Promise<boolean>;
  onUpdateDatesSchedule?: (schedule: DateSchedule[]) => Promise<boolean>;
  onBulkImport?: (data: { players: any[]; results?: any[]; mode?: string }) => Promise<any>;
  onChangePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  subscribers: any[];
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLogin,
  players,
  results,
  nextFixture,
  datesSchedule = [],
  onAddPlayer,
  onDeletePlayer,
  onSaveResult,
  onDeleteResult,
  onUpdateFixture,
  onUpdateDatesSchedule,
  onBulkImport,
  onChangePin,
  subscribers,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'results' | 'excel' | 'schedule' | 'fixture' | 'export' | 'settings'>('players');

  // Form states - Add Player
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerCat, setNewPlayerCat] = useState<Category>('8va');
  const [playerSuccessMsg, setPlayerSuccessMsg] = useState('');

  // Form states - Add Result
  const [resultCategory, setResultCategory] = useState<Category>('8va');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedDateId, setSelectedDateId] = useState<DateId>('F1');
  const [selectedResultType, setSelectedResultType] = useState<ResultType>('P');
  const [resultSuccessMsg, setResultSuccessMsg] = useState('');

  // Form states - Next Fixture
  const [fixtureDate, setFixtureDate] = useState(nextFixture.dateText);
  const [fixtureTime, setFixtureTime] = useState(nextFixture.timeText);
  const [fixtureVenue, setFixtureVenue] = useState(nextFixture.venueText);
  const [fixtureNotes, setFixtureNotes] = useState(nextFixture.notes || '');
  const [fixtureSuccessMsg, setFixtureSuccessMsg] = useState('');

  // Form states - Dates Schedule
  const [localSchedule, setLocalSchedule] = useState<DateSchedule[]>(datesSchedule);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');

  // Form states - Excel Bulk Import
  const [parsedExcelData, setParsedExcelData] = useState<any[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [excelError, setExcelError] = useState('');
  const [excelSuccessMsg, setExcelSuccessMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - Change Pin
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');
  const [pinChangeErr, setPinChangeErr] = useState('');

  // Export states
  const [exportCategory, setExportCategory] = useState<Category>('8va');
  const [isExporting, setIsExporting] = useState(false);
  const instagramCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const ok = await onLogin(pinInput);
    if (!ok) {
      setPinError('Código PIN incorrecto');
    } else {
      setPinInput('');
    }
  };

  // Handle Add Player (a)
  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerLastName.trim()) return;

    const ok = await onAddPlayer({
      name: newPlayerName.trim(),
      lastName: newPlayerLastName.trim(),
      category: newPlayerCat,
    });

    if (ok) {
      setPlayerSuccessMsg(`¡${newPlayerLastName}, ${newPlayerName} agregada en ${newPlayerCat}!`);
      setNewPlayerName('');
      setNewPlayerLastName('');
      setTimeout(() => setPlayerSuccessMsg(''), 3000);
    }
  };

  // Handle Save Result (b)
  const handleSaveResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    const ok = await onSaveResult({
      playerId: selectedPlayerId,
      dateId: selectedDateId,
      resultType: selectedResultType,
    });

    if (ok) {
      const p = players.find((x) => x.id === selectedPlayerId);
      setResultSuccessMsg(`¡Resultado guardado para ${p?.lastName} (${selectedDateId})!`);
      setTimeout(() => setResultSuccessMsg(''), 3000);
    }
  };

  // Handle Update Fixture (c)
  const handleUpdateFixtureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onUpdateFixture({
      dateText: fixtureDate.trim(),
      timeText: fixtureTime.trim(),
      venueText: fixtureVenue.trim(),
      notes: fixtureNotes.trim(),
      updatedAt: new Date().toISOString(),
    });

    if (ok) {
      setFixtureSuccessMsg('¡Próxima fecha actualizada correctamente!');
      setTimeout(() => setFixtureSuccessMsg(''), 3000);
    }
  };

  // Handle Update Dates Schedule
  const handleUpdateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateDatesSchedule) {
      const ok = await onUpdateDatesSchedule(localSchedule);
      if (ok) {
        setScheduleSuccessMsg('¡Calendario de fechas actualizado correctamente!');
        setTimeout(() => setScheduleSuccessMsg(''), 3000);
      }
    }
  };

  // Handle Excel File Selected & Parse
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length < 2) {
          setExcelError('El archivo Excel no contiene suficientes filas.');
          return;
        }

        const headers = rawData[0].map((h) => String(h || '').toLowerCase().trim());
        const nameIdx = headers.findIndex((h) => h.includes('nombre') && !h.includes('apellido'));
        const lastNameIdx = headers.findIndex((h) => h.includes('apellido'));
        const catIdx = headers.findIndex((h) => h.includes('cat') || h.includes('categoria'));

        const dateIdxs: Record<string, number> = {};
        ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].forEach((f) => {
          const idx = headers.findIndex((h) => h === f || h.startsWith(f + ' ') || h.includes(f));
          if (idx >= 0) dateIdxs[f.toUpperCase()] = idx;
        });

        const parsed: any[] = [];
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;

          const name = String(row[nameIdx >= 0 ? nameIdx : 0] || '').trim();
          const lastName = String(row[lastNameIdx >= 0 ? lastNameIdx : 1] || '').trim();
          let catRaw = String(row[catIdx >= 0 ? catIdx : 2] || '').trim().toLowerCase();

          if (!name || !lastName) continue;

          let category: Category = '8va';
          if (catRaw.includes('7')) category = '7ma';
          else if (catRaw.includes('6')) category = '6ta';
          else category = '8va';

          const rowResults: Record<string, string> = {};
          Object.keys(dateIdxs).forEach((dateKey) => {
            const colIdx = dateIdxs[dateKey];
            if (colIdx >= 0 && row[colIdx] !== undefined) {
              let val = String(row[colIdx]).trim().toUpperCase();
              if (val.startsWith('CAMPEONA') || val === 'C') val = 'C';
              else if (val.startsWith('FINAL') || val === 'F' || val === 'SUB') val = 'F';
              else if (val.startsWith('SEMI') || val === 'SF') val = 'SF';
              else if (val.startsWith('PART') || val === 'P') val = 'P';

              if (['C', 'F', 'SF', 'P'].includes(val)) {
                rowResults[dateKey] = val;
              }
            }
          });

          parsed.push({
            name,
            lastName,
            category,
            results: rowResults,
          });
        }

        setParsedExcelData(parsed);
        setExcelError('');
        setExcelSuccessMsg(`Se detectaron ${parsed.length} jugadoras listas para importar.`);
      } catch (err) {
        console.error('Error procesando Excel:', err);
        setExcelError('Error al leer el archivo Excel. Asegurate de que sea un archivo .xlsx, .xls o .csv válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Bulk Import Confirm
  const handleConfirmBulkImport = async () => {
    if (!parsedExcelData.length || !onBulkImport) return;
    setIsImporting(true);
    setExcelError('');

    try {
      const res = await onBulkImport({
        players: parsedExcelData,
        mode: importMode,
      });

      if (res && res.success) {
        setExcelSuccessMsg(`¡Carga masiva completada exitosamente! (${res.addedPlayersCount} jugadoras agregadas / actualizadas).`);
        setParsedExcelData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setExcelError(res?.error || 'Error durante la carga masiva.');
      }
    } catch (err) {
      setExcelError('Error de conexión con el servidor.');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      ['Nombre', 'Apellido', 'Categoria', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
      ['Sofía', 'García', '8va', 'C', 'F', 'SF', 'P', '', ''],
      ['Martina', 'López', '8va', 'F', 'C', 'P', 'P', '', ''],
      ['Paula', 'Romero', '7ma', 'C', 'F', '', '', '', ''],
      ['Mariana', 'Giménez', '6ta', 'C', 'C', 'F', '', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Carga');
    XLSX.writeFile(wb, 'Plantilla_Carga_Liga_NODO_Ladies.xlsx');
  };

  // Handle Change Pin
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeErr('');
    setPinChangeMsg('');

    const res = await onChangePin(currentPin, newPin);
    if (res.success) {
      setPinChangeMsg('PIN modificado con éxito');
      setCurrentPin('');
      setNewPin('');
    } else {
      setPinChangeErr(res.error || 'Error al cambiar PIN');
    }
  };

  // Handle Export Image for Instagram (d)
  const handleDownloadInstagramImage = async () => {
    if (!instagramCardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(instagramCardRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `Ranking_NODO_Ladies_${exportCategory}_2026.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Players filtered for result assignment dropdown
  const categoryPlayers = players.filter((p) => p.category === resultCategory);

  // Compute ranking data for Instagram export
  const exportRankings = computeRankingsForCategory(players, results, exportCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#162D28] border border-[#2d574e] rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#122823] border-b border-[#2d574e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c6f135] to-[#f472b6] text-[#1F3D37] flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">
                Panel de Administración Club
              </h2>
              <p className="text-[11px] text-[#f472b6] font-extrabold">
                Liga NODO <span className="text-[#c6f135]">Ladies 2026</span> &bull; Villa Ramallo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IF NOT LOGGED IN -> Show PIN Entry */}
        {!isAdminLoggedIn ? (
          <div className="p-6 text-center space-y-4 max-w-sm mx-auto my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#f472b6]/20 text-[#f472b6] flex items-center justify-center mx-auto border border-[#f472b6]/40">
              <Key className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Ingreso Administración</h3>
              <p className="text-xs text-white/60 mt-1">
                Ingresá el código PIN de acceso de la organizadora para gestionar participantes y resultados.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Código PIN (por defecto: 1234)"
                  required
                  autoFocus
                  className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 rounded-2xl bg-[#1D3B35] border border-[#2d574e] text-white placeholder-white/30 focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              {pinError && (
                <div className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-extrabold text-sm transition cursor-pointer shadow-md"
              >
                Ingresar al Panel
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN -> Show Full Admin Panel */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Admin Tabs */}
            <div className="px-4 pt-3 bg-[#132B25] border-b border-[#2d574e] flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('players')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'players'
                    ? 'bg-[#162D28] text-[#c6f135] border-t-2 border-[#c6f135]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Jugadoras</span>
              </button>

              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'results'
                    ? 'bg-[#162D28] text-[#c6f135] border-t-2 border-[#c6f135]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Resultados</span>
              </button>

              <button
                onClick={() => setActiveTab('excel')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'excel'
                    ? 'bg-[#162D28] text-[#f472b6] border-t-2 border-[#f472b6]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#f472b6]" />
                <span>Carga Masiva Excel</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-[#162D28] text-[#c6f135] border-t-2 border-[#c6f135]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Fechas y Horarios</span>
              </button>

              <button
                onClick={() => setActiveTab('fixture')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'fixture'
                    ? 'bg-[#162D28] text-[#c6f135] border-t-2 border-[#c6f135]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Próxima Fecha</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-[#162D28] text-[#f472b6] border-t-2 border-[#f472b6]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-3 rounded-t-xl font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#162D28] text-[#c6f135] border-t-2 border-[#c6f135]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Ajustes</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {/* --- TAB 1: ADD / MANAGE PLAYERS --- */}
              {activeTab === 'players' && (
                <div className="space-y-5">
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e]">
                    <h3 className="text-sm font-black text-[#c6f135] mb-3 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      (a) Dar de alta nueva participante
                    </h3>

                    {playerSuccessMsg && (
                      <div className="mb-3 p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{playerSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddPlayerSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          placeholder="Ej. Sofía"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Apellido</label>
                        <input
                          type="text"
                          value={newPlayerLastName}
                          onChange={(e) => setNewPlayerLastName(e.target.value)}
                          placeholder="Ej. García"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Categoría</label>
                        <select
                          value={newPlayerCat}
                          onChange={(e) => setNewPlayerCat(e.target.value as Category)}
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white focus:outline-none focus:border-[#c6f135]"
                        >
                          <option value="8va">8va Categoría</option>
                          <option value="7ma">7ma Categoría</option>
                          <option value="6ta">6ta Categoría</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 pt-1">
                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition cursor-pointer shadow-md"
                        >
                          Registrar Jugadora
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Registered Players List */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-white/70 mb-2">
                      Jugadoras Registradas ({players.length})
                    </h4>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-[#1D3B35]/60 border border-[#2d574e] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-extrabold text-white">
                              {p.lastName}, {p.name}
                            </span>
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c6f135] font-bold">
                              Cat. {p.category}
                            </span>
                          </div>

                          <button
                            onClick={() => onDeletePlayer(p.id)}
                            className="p-1 text-white/40 hover:text-rose-400 transition cursor-pointer"
                            title="Eliminar jugadora"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 2: LOAD / EDIT RESULTS --- */}
              {activeTab === 'results' && (
                <div className="space-y-5">
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e]">
                    <h3 className="text-sm font-black text-[#c6f135] mb-3 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      (b) Cargar resultado por fecha
                    </h3>

                    {resultSuccessMsg && (
                      <div className="mb-3 p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{resultSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveResultSubmit} className="space-y-3">
                      {/* Category Selection Filter */}
                      <div className="grid grid-cols-3 gap-2 p-1 bg-[#162D28] rounded-xl border border-[#2d574e] text-center">
                        {(['8va', '7ma', '6ta'] as Category[]).map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => {
                              setResultCategory(cat);
                              setSelectedPlayerId('');
                            }}
                            className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                              resultCategory === cat
                                ? 'bg-[#c6f135] text-[#1F3D37]'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            Categoría {cat}
                          </button>
                        ))}
                      </div>

                      {/* Dropdown Select Player */}
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">
                          Seleccionar Participante (Cat. {resultCategory})
                        </label>
                        <select
                          value={selectedPlayerId}
                          onChange={(e) => setSelectedPlayerId(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white focus:outline-none focus:border-[#c6f135]"
                        >
                          <option value="">-- Seleccionar jugadora de la lista --</option>
                          {categoryPlayers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.lastName}, {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select Date & Result Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1">Fecha</label>
                          <select
                            value={selectedDateId}
                            onChange={(e) => setSelectedDateId(e.target.value as DateId)}
                            className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white focus:outline-none focus:border-[#c6f135]"
                          >
                            {ALL_DATES.map((d) => (
                              <option key={d} value={d}>
                                {DATE_NAMES[d]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-white/80 mb-1">Resultado Obtenido</label>
                          <select
                            value={selectedResultType}
                            onChange={(e) => setSelectedResultType(e.target.value as ResultType)}
                            className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white focus:outline-none focus:border-[#c6f135]"
                          >
                            <option value="P">Participación (+20 pts)</option>
                            <option value="SF">Semifinal (+25 pts)</option>
                            <option value="F">Final / Subcampeona (+30 pts)</option>
                            <option value="C">Campeona (+40 pts)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedPlayerId}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition cursor-pointer shadow-md disabled:opacity-40"
                      >
                        Guardar Resultado
                      </button>
                    </form>
                  </div>

                  {/* Existing Loaded Results */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-white/70 mb-2">
                      Resultados Cargados ({results.length})
                    </h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {results.map((r) => {
                        const p = players.find((x) => x.id === r.playerId);
                        if (!p) return null;
                        const label = RESULT_LABELS[r.resultType];

                        return (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-xl bg-[#1D3B35]/60 border border-[#2d574e] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white">
                                {p.lastName}, {p.name}
                              </span>
                              <span className="ml-2 text-[10px] text-white/60">
                                {r.dateId} &bull; {label?.full} ({label?.short})
                              </span>
                            </div>

                            <button
                              onClick={() => onDeleteResult(r.id)}
                              className="p-1 text-white/40 hover:text-rose-400 transition cursor-pointer"
                              title="Eliminar resultado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 3: BULK IMPORT FROM EXCEL --- */}
              {activeTab === 'excel' && (
                <div className="space-y-5">
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e] space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[#f472b6] flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-[#f472b6]" />
                          Carga Masiva desde Archivo Excel (.xlsx / .csv)
                        </h3>
                        <p className="text-xs text-white/70 mt-1">
                          Permite cargar o actualizar todas las jugadoras y sus resultados de una sola vez importando una planilla de Excel.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadSampleExcel}
                        className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#c6f135] font-extrabold text-[11px] transition flex items-center gap-1 shrink-0 cursor-pointer border border-[#c6f135]/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Plantilla Excel</span>
                      </button>
                    </div>

                    {excelSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{excelSuccessMsg}</span>
                      </div>
                    )}

                    {excelError && (
                      <div className="p-2.5 rounded-xl bg-rose-900/60 border border-rose-500 text-xs text-rose-300 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{excelError}</span>
                      </div>
                    )}

                    {/* File Upload Zone */}
                    <div className="border-2 border-dashed border-[#2d574e] hover:border-[#f472b6] rounded-2xl p-5 text-center bg-[#162D28]/60 transition cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelFileUpload}
                        className="hidden"
                        id="excel-file-input"
                      />
                      <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
                        <Upload className="w-8 h-8 text-[#f472b6] mx-auto animate-bounce" />
                        <span className="block font-extrabold text-sm text-white">
                          Hacé clic para seleccionar tu archivo Excel
                        </span>
                        <span className="block text-xs text-white/50">
                          Formatos compatibles: .xlsx, .xls, .csv (Columnas: Nombre, Apellido, Categoria, F1..F6)
                        </span>
                      </label>
                    </div>

                    {/* Parsed Preview Table */}
                    {parsedExcelData.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-white/80">
                          <span>Vista previa de datos detectados ({parsedExcelData.length} registros):</span>

                          {/* Import Mode Options */}
                          <div className="flex items-center gap-2 text-[11px]">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="importMode"
                                value="append"
                                checked={importMode === 'append'}
                                onChange={() => setImportMode('append')}
                                className="accent-[#f472b6]"
                              />
                              <span>Sumar a existentes</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="importMode"
                                value="replace"
                                checked={importMode === 'replace'}
                                onChange={() => setImportMode('replace')}
                                className="accent-[#f472b6]"
                              />
                              <span className="text-rose-300 font-bold">Reemplazar base</span>
                            </label>
                          </div>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto rounded-xl border border-[#2d574e] bg-[#162D28]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#122823] text-[#f472b6] sticky top-0 font-extrabold text-[11px]">
                              <tr>
                                <th className="p-2">Apellido, Nombre</th>
                                <th className="p-2">Cat.</th>
                                <th className="p-2">Resultados Fechas</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-white/90">
                              {parsedExcelData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                  <td className="p-2 font-bold">{row.lastName}, {row.name}</td>
                                  <td className="p-2">{row.category}</td>
                                  <td className="p-2 text-[11px] text-[#c6f135]">
                                    {Object.keys(row.results || {}).length > 0
                                      ? Object.entries(row.results).map(([k, v]) => `${k}:${v}`).join(' | ')
                                      : 'Sin resultados'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmBulkImport}
                          disabled={isImporting}
                          className="w-full py-3 px-4 rounded-xl bg-[#f472b6] hover:bg-[#e0529c] text-white font-black text-xs transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                        >
                          {isImporting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Procesando Importación...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Confirmar e Importar {parsedExcelData.length} Registros a la App</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 4: EDIT DATES & TIMES SCHEDULE --- */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e] space-y-4">
                    <h3 className="text-sm font-black text-[#c6f135] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Editar Fechas, Horarios y Estados del Calendario
                    </h3>
                    <p className="text-xs text-white/60">
                      Modificá las fechas de realización y horarios para cada una de las 6 jornadas de la liga.
                    </p>

                    {scheduleSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{scheduleSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateScheduleSubmit} className="space-y-4">
                      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                        {localSchedule.map((ds, index) => (
                          <div
                            key={ds.dateId}
                            className="p-3 rounded-xl bg-[#162D28] border border-[#2d574e] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-black text-[#c6f135]">
                              <span>{ds.dateId} - {ds.name}</span>
                              <select
                                value={ds.status}
                                onChange={(e) => {
                                  const updated = [...localSchedule];
                                  updated[index].status = e.target.value as any;
                                  setLocalSchedule(updated);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#1D3B35] text-white border border-[#2d574e] text-[11px] font-bold"
                              >
                                <option value="completada">Completada</option>
                                <option value="proxima">Próxima Fecha</option>
                                <option value="pendiente">Pendiente</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-white/60 mb-0.5">Fecha Textual</label>
                                <input
                                  type="text"
                                  value={ds.dateText}
                                  onChange={(e) => {
                                    const updated = [...localSchedule];
                                    updated[index].dateText = e.target.value;
                                    setLocalSchedule(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1D3B35] border border-[#2d574e] text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-white/60 mb-0.5">Horario</label>
                                <input
                                  type="text"
                                  value={ds.timeText}
                                  onChange={(e) => {
                                    const updated = [...localSchedule];
                                    updated[index].timeText = e.target.value;
                                    setLocalSchedule(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1D3B35] border border-[#2d574e] text-xs text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition cursor-pointer shadow-md"
                      >
                        Guardar Cambios en Calendario
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* --- TAB 5: UPDATE NEXT FIXTURE --- */}
              {activeTab === 'fixture' && (
                <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e] space-y-4">
                  <h3 className="text-sm font-black text-[#c6f135] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    (c) Cargar / editar la próxima jornada
                  </h3>

                  {fixtureSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{fixtureSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateFixtureSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1">Día / Fecha Completa</label>
                      <input
                        type="text"
                        value={fixtureDate}
                        onChange={(e) => setFixtureDate(e.target.value)}
                        placeholder="Ej. Sábado 15 de Agosto 2026"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Horarios</label>
                        <input
                          type="text"
                          value={fixtureTime}
                          onChange={(e) => setFixtureTime(e.target.value)}
                          placeholder="Ej. Desde 09:00 hs"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Lugar / Sede</label>
                        <input
                          type="text"
                          value={fixtureVenue}
                          onChange={(e) => setFixtureVenue(e.target.value)}
                          placeholder="Ej. NODO Pádel Club - Villa Ramallo"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1">Avisos Adicionales (Opcional)</label>
                      <input
                        type="text"
                        value={fixtureNotes}
                        onChange={(e) => setFixtureNotes(e.target.value)}
                        placeholder="Ej. Cierre de inscripción viernes 20:00 hs"
                        className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition cursor-pointer shadow-md"
                    >
                      Guardar Próxima Fecha
                    </button>
                  </form>
                </div>
              )}

              {/* --- TAB 6: INSTAGRAM IMAGE EXPORT --- */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#c6f135] flex items-center gap-1.5">
                        <Instagram className="w-4 h-4 text-[#f472b6]" />
                        (d) Exportar Ranking a Imagen para Instagram
                      </h3>
                      <p className="text-xs text-white/60">
                        Función exclusiva de administración. Genera una plaqueta oficial prolija para historias o posteos.
                      </p>
                    </div>

                    {/* Category Selector */}
                    <div className="flex gap-1 p-1 bg-[#122823] rounded-xl border border-[#2d574e]">
                      {(['8va', '7ma', '6ta'] as Category[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setExportCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            exportCategory === cat ? 'bg-[#f472b6] text-white' : 'text-white/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadInstagramImage}
                    disabled={isExporting}
                    className="w-full py-3 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Generando Imagen HD...' : `Descargar Ranking Cat. ${exportCategory} para Instagram`}</span>
                  </button>

                  {/* PREVIEW CONTAINER TO BE RENDERED TO IMAGE */}
                  <div className="overflow-x-auto flex justify-center py-2 bg-black/40 rounded-2xl border border-white/10 p-2">
                    <div
                      ref={instagramCardRef}
                      className="w-[380px] bg-[#1F3D37] border-4 border-[#2d574e] rounded-3xl p-6 text-white font-['Nunito'] relative shadow-2xl overflow-hidden shrink-0"
                    >
                      {/* Brand Top Header */}
                      <div className="text-center mb-4 flex flex-col items-center">
                        <Logo size="lg" showSubtitle={true} />

                        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#c6f135] text-[#1F3D37] font-black text-sm shadow-md uppercase tracking-wider">
                          RANKING OFICIAL - CATEGORÍA {exportCategory}
                        </div>
                      </div>

                      {/* Top Players Table Preview */}
                      <div className="space-y-2 mb-4">
                        {exportRankings.slice(0, 8).map((item) => (
                          <div
                            key={item.player.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${
                              item.position === 1
                                ? 'bg-gradient-to-r from-[#285046] to-[#1E3D36] border-[#c6f135]'
                                : 'bg-[#162D28] border-[#2a5047]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                  item.position === 1
                                    ? 'bg-[#c6f135] text-[#1F3D37]'
                                    : 'bg-white/10 text-white/80'
                                }`}
                              >
                                #{item.position}
                              </span>

                              <div>
                                <span className="font-extrabold text-sm text-white">
                                  {item.player.lastName}, {item.player.name}
                                </span>
                                {item.hasConsistencyBonus && (
                                  <span className="ml-1 text-[9px] text-[#f472b6] font-black">
                                    (+15 Bonus)
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="font-black text-base text-[#c6f135]">
                              {item.totalPoints} pts
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Branding */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 font-semibold">
                        <span>Seguinos en Instagram: @nodo.padel</span>
                        <span className="text-[#f472b6]">nodo.padel.ar</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 7: SETTINGS & PIN --- */}
              {activeTab === 'settings' && (
                <div className="space-y-5">
                  {/* Change PIN Box */}
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e]">
                    <h3 className="text-sm font-black text-[#c6f135] mb-3 flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      Cambiar Código PIN de Acceso
                    </h3>

                    {pinChangeMsg && (
                      <div className="mb-3 p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{pinChangeMsg}</span>
                      </div>
                    )}

                    {pinChangeErr && (
                      <div className="mb-3 p-2.5 rounded-xl bg-rose-900/60 border border-rose-500 text-xs text-rose-300 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{pinChangeErr}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePinSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">PIN Actual</label>
                        <input
                          type="password"
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value)}
                          placeholder="Ingresá PIN actual"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1">Nuevo PIN</label>
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#162D28] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-black text-xs transition cursor-pointer shadow-md"
                      >
                        Actualizar PIN
                      </button>
                    </form>
                  </div>

                  {/* Subscribers List & Broadcast Templates */}
                  <div className="bg-[#1D3B35] p-4 rounded-2xl border border-[#2d574e]">
                    <h3 className="text-sm font-black text-[#c6f135] mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#f472b6]" />
                      Suscriptoras a Alertas WhatsApp ({subscribers.length})
                    </h3>

                    {subscribers.length === 0 ? (
                      <p className="text-xs text-white/50 italic">
                        Aún no hay jugadoras registradas en el canal de alertas WhatsApp.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto mb-3">
                        {subscribers.map((s, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#162D28] text-xs flex justify-between">
                            <span className="font-bold text-white">{s.name || 'Jugadora'}</span>
                            <span className="text-white/60 font-mono">{s.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preformatted Broadcast Template */}
                    <div className="pt-2 border-t border-white/10">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🎾 ¡Atención Jugadoras Liga NODO Ladies 2026!\nYa están actualizadas las posiciones en la web oficial.\nMirá el ranking actualizado acá: ${window.location.href}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Enviar Difusión WhatsApp con Link del Ranking</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
