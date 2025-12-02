import React from 'react';

const DuckCard = ({ duck }) => {
    return (
        <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition duration-200">
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-300">
                        {/* Profil resmi placeholder */}
                        {duck.owner.profile_image && <img src={duck.owner.profile_image} alt={duck.owner.username} className="h-12 w-12 rounded-full" />}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{duck.owner.username}</span>
                        <span className="text-gray-500 text-sm">@{duck.owner.username}</span>
                        <span className="text-gray-500 text-sm">· {new Date(duck.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-800 mt-1">{duck.content}</p>

                    {duck.media_url && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                            <img src={duck.media_url} alt="Duck media" className="w-full h-auto" />
                        </div>
                    )}

                    <div className="flex justify-between mt-3 text-gray-500 max-w-md">
                        <button className="flex items-center space-x-2 hover:text-duck transition">
                            {/* Reply Icon */}
                            <span>💬</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition">
                            {/* Retweet Icon */}
                            <span>🔄</span>
                            <span className="text-sm">{duck.retweets_count > 0 && duck.retweets_count}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-red-500 transition">
                            {/* Like Icon */}
                            <span>❤️</span>
                            <span className="text-sm">{duck.likes_count > 0 && duck.likes_count}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-duck transition">
                            {/* Share Icon */}
                            <span>📤</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DuckCard;
