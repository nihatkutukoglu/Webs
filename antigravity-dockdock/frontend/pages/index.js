import React, { useState, useEffect } from 'react';
import DuckCard from '../components/DuckCard';

// Mock Data (API entegrasyonu öncesi)
const MOCK_DUCKS = [
    {
        id: 100,
        content: "DuckDuck platformu harika görünüyor! #duckduck",
        created_at: "2023-10-27T09:00:00",
        likes_count: 5,
        retweets_count: 1,
        owner: { username: "teknoloji_guru", profile_image: null }
    },
    {
        id: 101,
        content: "Merhaba dünya! İlk Duck'ımı atıyorum. 🦆",
        created_at: "2023-10-27T09:30:00",
        likes_count: 12,
        retweets_count: 3,
        owner: { username: "nihat_mis", profile_image: null }
    }
];

export default function Home() {
    const [ducks, setDucks] = useState(MOCK_DUCKS);
    const [newDuckContent, setNewDuckContent] = useState("");

    const handleDuckSubmit = () => {
        if (!newDuckContent.trim()) return;

        // Gerçek uygulamada API'ye POST isteği atılır
        const newDuck = {
            id: Date.now(),
            content: newDuckContent,
            created_at: new Date().toISOString(),
            likes_count: 0,
            retweets_count: 0,
            owner: { username: "current_user", profile_image: null }
        };

        setDucks([newDuck, ...ducks]);
        setNewDuckContent("");
    };

    return (
        <div className="min-h-screen bg-white flex justify-center">
            {/* Sol Sidebar (Navigasyon) - Basitleştirilmiş */}
            <div className="w-64 hidden md:block border-r border-gray-200 p-4">
                <h1 className="text-3xl font-bold text-duck mb-8">DuckDuck 🦆</h1>
                <nav className="space-y-4 text-xl font-semibold">
                    <a href="#" className="block hover:bg-duck-light p-3 rounded-full transition">🏠 Anasayfa</a>
                    <a href="#" className="block hover:bg-duck-light p-3 rounded-full transition">🔔 Bildirimler</a>
                    <a href="#" className="block hover:bg-duck-light p-3 rounded-full transition">👤 Profil</a>
                </nav>
            </div>

            {/* Orta Alan (Feed) */}
            <div className="w-full md:w-[600px] border-r border-gray-200">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
                    <h2 className="text-xl font-bold">Anasayfa</h2>
                </div>

                {/* Duck Atma Alanı */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                        <div className="flex-1">
                            <textarea
                                className="w-full border-none focus:ring-0 text-xl resize-none placeholder-gray-500"
                                placeholder="Neler oluyor?"
                                rows="2"
                                maxLength={280}
                                value={newDuckContent}
                                onChange={(e) => setNewDuckContent(e.target.value)}
                            ></textarea>
                            <div className="flex justify-between items-center mt-2">
                                <div className="text-duck cursor-pointer">📷 📊 😊</div>
                                <button
                                    onClick={handleDuckSubmit}
                                    className="bg-duck hover:bg-duck-dark text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 transition"
                                    disabled={!newDuckContent.trim()}
                                >
                                    Duck'la
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Akış */}
                <div>
                    {ducks.map(duck => (
                        <DuckCard key={duck.id} duck={duck} />
                    ))}
                </div>
            </div>

            {/* Sağ Sidebar (Trendler) - Basitleştirilmiş */}
            <div className="w-80 hidden lg:block p-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-xl mb-4">Gündemdekiler</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Türkiye tarihinde gündem</p>
                            <p className="font-bold">#DuckDuckLansman</p>
                            <p className="text-sm text-gray-500">5.2B Duck</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Teknoloji · Gündemdekiler</p>
                            <p className="font-bold">#YapayZeka</p>
                            <p className="text-sm text-gray-500">12.4B Duck</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
