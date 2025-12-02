import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Phone, ExternalLink, Image as ImageIcon, 
  X, ChefHat, Coffee, Pizza, Utensils, Plus, Trash2, Lock, Unlock,
  Loader2, Megaphone, Edit3, Eye
} from 'lucide-react';

// Firebase Modülleri
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, increment 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';

// --- Firebase Kurulumu ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Akıllı Resim Bileşeni ---
const SmartImage = ({ src, alt, className, fallbackIcon }) => {
  const [imgState, setImgState] = useState('loading'); 

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {imgState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      )}
      {imgState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-100">
          {fallbackIcon || <ImageIcon size={24} className="mb-1 opacity-50" />}
          <span className="text-xs">Görsel Yüklenemedi</span>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${imgState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImgState('loaded')}
        onError={() => setImgState('error')}
      />
    </div>
  );
};

// --- Ana Uygulama Bileşeni ---
export default function BandirmaMenuApp() {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [adminMode, setAdminMode] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Auth ve Veri ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'venues'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const venuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // JavaScript tarafında sıralama
      venuesData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setVenues(venuesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- İş Mantığı ---
  const isImageUrl = (url) => url?.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;

  const handleVenueClick = async (venue) => {
    setSelectedVenue(venue);
    try {
      if (user) {
        const ref = doc(db, 'artifacts', appId, 'public', 'data', 'venues', venue.id);
        updateDoc(ref, { viewCount: increment(1) }).catch(e => console.log("Analitik hatası:", e));
      }
    } catch (e) {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'venues', id));
    }
  };

  const categories = ['Tümü', 'Restoran', 'Kafe', 'Fast Food', 'Tatlı', 'Bar'];
  
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || venue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-10">
      
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 safe-top">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl shadow-orange-200 shadow-md">
              <Utensils className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-slate-800">Bandırma Menü</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Dijital Menü Rehberi</p>
            </div>
          </div>
          <button 
            onClick={() => setAdminMode(!adminMode)}
            className={`p-2 rounded-full transition-all active:scale-95 ${adminMode ? 'bg-red-50 text-red-600 ring-2 ring-red-100' : 'text-slate-300 hover:text-slate-500'}`}
          >
            {adminMode ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
        </div>
      </header>

      {/* 2. Filtreleme Alanı */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-2 space-y-4 bg-slate-50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Ne yemek istersin?" 
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all text-base placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`snap-start px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mekan Listesi */}
      <main className="max-w-md mx-auto px-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <span className="text-sm font-medium">Mekanlar yükleniyor...</span>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 mx-2">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-slate-700">Sonuç Bulunamadı</h3>
            <p className="text-sm text-slate-400 mt-1">Farklı bir arama yapmayı dene.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredVenues.map(venue => (
              <div 
                key={venue.id}
                onClick={() => handleVenueClick(venue)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-4 active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden group"
              >
                {/* Kampanya Rozeti (Liste görünümünde) */}
                {venue.campaignText && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                    KAMPANYA
                  </div>
                )}

                <SmartImage 
                  src={venue.logoUrl} 
                  className="w-24 h-24 rounded-xl flex-shrink-0 bg-slate-50"
                  alt={venue.name}
                  fallbackIcon={<ChefHat size={24} className="text-slate-300" />}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2">{venue.name}</h3>
                    {adminMode && (
                      <button 
                        onClick={(e) => handleDelete(e, venue.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-lg -mt-1 -mr-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-orange-600 font-medium">{venue.category}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                    <MapPin size={14} className="flex-shrink-0 text-slate-400" />
                    <span className="truncate">{venue.address || 'Bandırma'}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1.5 border border-slate-200`}>
                      {isImageUrl(venue.menuUrl) ? <><ImageIcon size={10} /> MENÜ GÖRSELİ</> : <><ExternalLink size={10} /> WEB LİNKİ</>}
                    </span>
                    {venue.viewCount > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                        {venue.viewCount} görüntülenme
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB (Admin) */}
      {adminMode && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-900/30 hover:scale-110 transition-all z-40 active:bg-slate-800"
        >
          <Plus size={24} />
        </button>
      )}

      {/* --- RESPONSIVE FULL SCREEN MODAL (Kampanya Destekli) --- */}
      {selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl flex flex-col relative shadow-2xl animate-slide-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 safe-top">
              <div>
                <h2 className="font-bold text-xl text-slate-800">{selectedVenue.name}</h2>
                {selectedVenue.phone && (
                  <a href={`tel:${selectedVenue.phone}`} className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5 hover:text-orange-600 active:text-orange-700">
                    <div className="bg-green-100 p-1 rounded-full text-green-700"><Phone size={12} /></div>
                    <span>{selectedVenue.phone}</span>
                  </a>
                )}
              </div>
              <button onClick={() => setSelectedVenue(null)} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors active:scale-95">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - REKLAM KATMANI BURADA */}
            <div className="flex-1 overflow-auto bg-slate-50 relative touch-auto">
              {isImageUrl(selectedVenue.menuUrl) ? (
                <div className="min-h-full flex flex-col relative">
                  
                  {/* --- KAMPANYA BANNER'I (OVERLAY) --- */}
                  {selectedVenue.campaignText && (
                    <div 
                      className={`sticky top-0 z-20 w-full p-3 text-center font-bold text-white shadow-md animate-pulse`}
                      style={{ backgroundColor: selectedVenue.campaignColor || '#dc2626' }}
                    >
                       <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                          <Megaphone size={18} className="animate-bounce" />
                          {selectedVenue.campaignText}
                       </div>
                    </div>
                  )}
                  {/* ------------------------------------- */}

                  <div className="sm:hidden bg-orange-50 text-orange-800 text-xs px-4 py-2 text-center border-b border-orange-100 flex items-center justify-center gap-2">
                    <ImageIcon size={12} /> Yakınlaştırmak için görselin üzerine çift dokunun
                  </div>
                  
                  <img 
                    src={selectedVenue.menuUrl} 
                    alt="Menü" 
                    className="w-full h-auto object-contain mx-auto"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <img 
                    src={selectedVenue.logoUrl || "https://placehold.co/600x800?text=Logo"}
                    className="hidden w-32 h-32 mx-auto mt-20 opacity-50 grayscale" 
                    alt="Fallback"
                    onLoad={(e) => { if(e.target.previousSibling.style.display === 'none') e.target.classList.remove('hidden'); }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-pulse">
                    <ExternalLink size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">Menü Web Sitesinde</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
                      Bu mekanın menüsü, güncel kalması için kendi web sitesi üzerinden sunulmaktadır.
                    </p>
                  </div>
                  <a href={selectedVenue.menuUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Siteye Git <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 safe-bottom">
               <div className="flex gap-2 justify-center">
                  <button className="flex-1 bg-slate-100 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200" onClick={() => setSelectedVenue(null)}>Kapat</button>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVenue.name + " Bandırma")}`} target="_blank" className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                    <MapPin size={16} /> Yol Tarifi
                  </a>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Mekan Ekleme Modalı (Gelişmiş Kampanya Editörü) */}
      {showAddModal && (
        <AddVenueModal 
          onClose={() => setShowAddModal(false)} 
          categories={categories.filter(c => c !== 'Tümü')}
          appId={appId}
          db={db}
        />
      )}
    </div>
  );
}

// --- Kampanya Destekli Mekan Ekleme Formu ---
function AddVenueModal({ onClose, categories, appId, db }) {
  const [formData, setFormData] = useState({
    name: '', category: 'Restoran', logoUrl: '', menuUrl: '', address: '', phone: '',
    campaignText: '', campaignColor: '#ef4444' // Varsayılan Kırmızı
  });
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details | campaign

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Eğer kampanya modu kapalıysa kampanya verisini temizleyip gönderelim
      const finalData = { ...formData };
      if (!isCampaignMode) {
        delete finalData.campaignText;
        delete finalData.campaignColor;
      }

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'venues'), {
        ...finalData, createdAt: serverTimestamp(), viewCount: 0
      });
      onClose();
    } catch (error) {
      alert("Hata oluştu.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-0 shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white border-b border-slate-100">
          <h2 className="text-xl font-bold">Yeni Mekan Oluştur</h2>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Tab Menü */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-slate-900 border-b-2 border-slate-900 bg-white' : 'text-slate-400'}`}
          >
            <Edit3 size={16} /> Genel Bilgiler
          </button>
          <button 
             onClick={() => setActiveTab('campaign')}
             className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'campaign' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-slate-400'}`}
          >
            <Megaphone size={16} /> Kampanya & Reklam
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="venueForm" onSubmit={handleSubmit} className="space-y-4">
            
            {/* TAB 1: GENEL BİLGİLER */}
            <div className={activeTab === 'details' ? 'block' : 'hidden'}>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mekan Detayları</label>
                  <input required placeholder="Mekan Adı" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 mb-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <div className="flex gap-2">
                    <select className="w-1/2 border-slate-200 rounded-xl p-3 bg-slate-50 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Tel No" className="w-1/2 border-slate-200 rounded-xl p-3 bg-slate-50 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
               </div>
               <div className="mt-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Görseller</label>
                 <input required placeholder="Menü URL (Ana Görsel)" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 mb-2 focus:ring-2 focus:ring-slate-500 outline-none" value={formData.menuUrl} onChange={e => setFormData({...formData, menuUrl: e.target.value})} />
                 <input placeholder="Logo URL" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 outline-none" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} />
               </div>
               <div className="mt-4">
                 <textarea placeholder="Adres detayı..." className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 outline-none" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
               </div>
            </div>

            {/* TAB 2: KAMPANYA EDİTÖRÜ */}
            <div className={activeTab === 'campaign' ? 'block' : 'hidden'}>
              <div className="flex items-center justify-between mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
                <span className="text-sm font-bold text-orange-800">Kampanya Modu</span>
                <button 
                  type="button"
                  onClick={() => setIsCampaignMode(!isCampaignMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isCampaignMode ? 'bg-orange-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isCampaignMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {isCampaignMode ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kampanya Metni</label>
                    <input 
                      placeholder="Örn: Öğrencilere %15 İndirim!" 
                      className="w-full border-orange-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-lg font-medium" 
                      value={formData.campaignText} 
                      onChange={e => setFormData({...formData, campaignText: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Banner Rengi</label>
                    <div className="flex gap-2">
                      {['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, campaignColor: color})}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${formData.campaignColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* LIVE PREVIEW BOX */}
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                    <div className="bg-white border-b border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Eye size={12} /> CANLI ÖNİZLEME
                    </div>
                    <div className="relative aspect-video bg-white flex items-center justify-center overflow-hidden">
                       {/* Simüle Edilmiş Menü */}
                       {formData.menuUrl ? (
                         <img src={formData.menuUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                       ) : (
                         <div className="text-slate-300 flex flex-col items-center">
                           <ImageIcon size={32} />
                           <span className="text-xs mt-1">Görsel Seçilmedi</span>
                         </div>
                       )}
                       
                       {/* Kampanya Overlay */}
                       {formData.campaignText && (
                         <div 
                           className="absolute top-0 w-full p-2 text-center text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                           style={{ backgroundColor: formData.campaignColor }}
                         >
                           <Megaphone size={14} /> {formData.campaignText}
                         </div>
                       )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Megaphone size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Bu mekan için özel bir kampanya veya duyuru eklemek isterseniz yukarıdan modu açın.</p>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Modal Footer (Sabit) */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            type="submit" 
            form="venueForm"
            disabled={isSubmitting} 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
               <> <Loader2 className="animate-spin" /> Kaydediliyor... </>
            ) : (
               <> {isCampaignMode ? 'Kampanyalı Mekanı Kaydet' : 'Mekanı Kaydet'} </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}