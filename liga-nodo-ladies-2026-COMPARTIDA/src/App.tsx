import React, { useState, useEffect } from 'react';
import { Player, ResultRecord, NextFixture, DateSchedule, Category, DateId, ResultType, ComputedPlayerRanking } from './types';
import { INITIAL_NEXT_FIXTURE, INITIAL_PLAYERS, INITIAL_RESULTS, INITIAL_DATES_SCHEDULE } from './data/initialSeed';
import * as api from './data/api';
import { computeRankingsForCategory } from './utils/points';
import { Header } from './components/Header';
import { NextFixtureCard } from './components/NextFixtureCard';
import { RankingTable } from './components/RankingTable';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { NotificationSubscribeModal } from './components/NotificationSubscribeModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('8va');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [results, setResults] = useState<ResultRecord[]>(INITIAL_RESULTS);
  const [nextFixture, setNextFixture] = useState<NextFixture>(INITIAL_NEXT_FIXTURE);
  const [datesSchedule, setDatesSchedule] = useState<DateSchedule[]>(INITIAL_DATES_SCHEDULE);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const [selectedPlayerRanking, setSelectedPlayerRanking] = useState<ComputedPlayerRanking | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos compartidos desde el servidor (Redis)
  const fetchLeagueData = async () => {
    try {
      const data = await api.getPublicData();
      setPlayers(data.players || []);
      setResults(data.results || []);
      setNextFixture(data.nextFixture || INITIAL_NEXT_FIXTURE);
      setDatesSchedule(data.datesSchedule || INITIAL_DATES_SCHEDULE);
      setSubscribersCount(data.subscribersCount || 0);
    } catch (err) {
      console.warn('Error cargando datos de la liga:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setSubscribers(await api.getSubscribers());
    } catch (err) {
      console.error('Error leyendo suscriptores:', err);
    }
  };

  useEffect(() => {
    fetchLeagueData();
    const savedAuth = sessionStorage.getItem('nodo_admin_auth');
    if (savedAuth === 'nodo-admin-auth-valid') {
      setIsAdminLoggedIn(true);
      fetchSubscribers();
    }
  }, []);

  // Login admin
  const handleAdminLogin = async (pin: string): Promise<boolean> => {
    const ok = await api.checkAdminPin(pin);
    if (ok) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('nodo_admin_auth', 'nodo-admin-auth-valid');
      fetchSubscribers();
      return true;
    }
    return false;
  };

  // Alta de jugadora
  const handleAddPlayer = async (player: { name: string; lastName: string; category: Category }) => {
    const ok = await api.addPlayer(player.name, player.lastName, player.category);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Baja de jugadora
  const handleDeletePlayer = async (id: string) => {
    const ok = await api.deletePlayer(id);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Guardar resultado
  const handleSaveResult = async (result: { playerId: string; dateId: DateId; resultType: ResultType }) => {
    const ok = await api.saveResult(result.playerId, result.dateId, result.resultType);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Borrar resultado
  const handleDeleteResult = async (id: string) => {
    const ok = await api.deleteResult(id);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Actualizar próxima fecha
  const handleUpdateFixture = async (fixture: NextFixture) => {
    const ok = await api.updateFixture(fixture);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Actualizar calendario de fechas
  const handleUpdateDatesSchedule = async (newSchedule: DateSchedule[]) => {
    const ok = await api.updateDatesSchedule(newSchedule);
    if (ok) await fetchLeagueData();
    return ok;
  };

  // Importación masiva
  const handleBulkImport = async (data: { players: any[]; results?: any[]; mode?: string }) => {
    const res = await api.bulkImport(data);
    if (res) await fetchLeagueData();
    return res;
  };

  // Cambiar PIN admin
  const handleChangePin = async (currentPin: string, newPin: string) => {
    return api.changeAdminPin(currentPin, newPin);
  };

  // Suscripción notificaciones
  const handleSubscribe = async (phone: string, name: string) => {
    const ok = await api.subscribe(phone, name);
    if (ok) {
      await fetchLeagueData();
      if (isAdminLoggedIn) fetchSubscribers();
    }
    return ok;
  };

  // Ranking de la categoría actual
  const categoryRankings = computeRankingsForCategory(players, results, selectedCategory);

  return (
    <div className="min-h-screen bg-[#1F3D37] text-white font-['Nunito',sans-serif] flex flex-col justify-between selection:bg-[#c6f135] selection:text-[#1F3D37]">
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <main className="flex-1 w-full max-w-[440px] mx-auto">
        <NextFixtureCard
          fixture={nextFixture}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          subscribersCount={subscribersCount}
        />

        {isLoading ? (
          <div className="py-12 text-center text-white/50 text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#c6f135]" />
            <span>Cargando ranking de la liga...</span>
          </div>
        ) : (
          <RankingTable
            rankings={categoryRankings}
            category={selectedCategory}
            onSelectPlayer={(p) => setSelectedPlayerRanking(p)}
          />
        )}
      </main>

      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <PlayerDetailModal
        playerRanking={selectedPlayerRanking}
        onClose={() => setSelectedPlayerRanking(null)}
      />

      <NotificationSubscribeModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onSubscribe={handleSubscribe}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        players={players}
        results={results}
        nextFixture={nextFixture}
        datesSchedule={datesSchedule}
        onAddPlayer={handleAddPlayer}
        onDeletePlayer={handleDeletePlayer}
        onSaveResult={handleSaveResult}
        onDeleteResult={handleDeleteResult}
        onUpdateFixture={handleUpdateFixture}
        onUpdateDatesSchedule={handleUpdateDatesSchedule}
        onBulkImport={handleBulkImport}
        onChangePin={handleChangePin}
        subscribers={subscribers}
      />
    </div>
  );
}
