import React, { useState } from 'react';
import { X, Bell, MessageSquare, Check, Sparkles, Send } from 'lucide-react';

interface NotificationSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (phone: string, name: string) => Promise<boolean>;
}

export const NotificationSubscribeModal: React.FC<NotificationSubscribeModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [webNotificationEnabled, setWebNotificationEnabled] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) return;

    setLoading(true);
    const ok = await onSubscribe(phone, name);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPhone('');
        setName('');
        onClose();
      }, 2000);
    }
  };

  const handleEnableWebPush = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setWebNotificationEnabled(true);
        new Notification('Liga NODO Ladies 2026', {
          body: '¡Notificaciones del navegador activadas con éxito! Te avisaremos cuando se carguen nuevos resultados.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const officialWhatsappGroupUrl = "https://wa.me/?text=Hola!%20Quiero%20sumarme%20al%20grupo%20oficial%20de%20alertas%20de%20la%20Liga%20NODO%20Ladies%202026";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-[#162D28] border border-[#2d574e] rounded-3xl p-5 shadow-2xl overflow-hidden text-white my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f4a7db] text-[#1F3D37] flex items-center justify-center font-black shadow-md">
            <Bell className="w-5 h-5 text-[#1F3D37]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">
              Recibir Alertas por WhatsApp
            </h2>
            <p className="text-xs text-white/60">
              Liga NODO Ladies 2026 &bull; Villa Ramallo
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-3.5 rounded-2xl bg-[#1D3B35] border border-[#2d574e] mb-4 text-xs text-white/80 space-y-1">
          <div className="font-bold text-[#f4a7db] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ¡Sumá tu WhatsApp para no perderte nada!
          </div>
          <p>
            Al ingresar tu número, recibirás avisos automáticos cuando la organización publique nuevos resultados, tabla de posiciones o cambios de horario en las fechas.
          </p>
        </div>

        {/* Direct WhatsApp Community Button */}
        <a
          href={officialWhatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Unirme al Grupo de WhatsApp de la Liga</span>
        </a>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[11px] text-white/40 uppercase font-bold">O registrá tu número</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Form */}
        {success ? (
          <div className="p-4 rounded-2xl bg-[#c6f135]/20 border border-[#c6f135] text-center my-3">
            <Check className="w-8 h-8 text-[#c6f135] mx-auto mb-1" />
            <p className="font-bold text-white text-sm">¡Registro Exitoso!</p>
            <p className="text-xs text-white/70">Recibirás los avisos de la Liga NODO por WhatsApp.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                Tu Nombre (Opcional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Lucía"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1D3B35] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                Celular / WhatsApp <span className="text-[#c6f135]">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +54 9 3407 123456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1D3B35] border border-[#2d574e] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Suscribirme a Alertas'}</span>
            </button>
          </form>
        )}

        {/* Browser Push Option */}
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs text-white/60">
          <span>Notificaciones del navegador:</span>
          <button
            type="button"
            onClick={handleEnableWebPush}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              webNotificationEnabled
                ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            {webNotificationEnabled ? '✓ Activadas' : 'Activar aquí'}
          </button>
        </div>
      </div>
    </div>
  );
};
