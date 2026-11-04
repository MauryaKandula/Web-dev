import React, { useState } from 'react';
import { LibraryItem } from '../types.ts';
import { Download, Key, Check, Package, ExternalLink, Play } from 'lucide-react';

interface LibraryPageProps {
  library: LibraryItem[];
  onDownload: (productId: string) => void;
  onExplore: () => void;
  onLaunchApp?: (productId: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  library,
  onDownload,
  onExplore,
  onLaunchApp
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Software Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access, download, and manage your purchased software licenses.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold font-mono">
          {library.length} {library.length === 1 ? 'Package' : 'Packages'} Owned
        </span>
      </div>

      {library.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Your library is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You have not acquired any software tools or templates yet. Check out the marketplace for tools starting at ₹19.
          </p>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {library.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-blue-400 uppercase tracking-wider">{item.category}</span>
                  <span>Purchased {new Date(item.purchased_at).toLocaleDateString()}</span>
                </div>

                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.tagline}</p>

                {/* License Key Box */}
                <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">License Key</span>
                    <code className="text-xs font-mono font-bold text-purple-400 select-all">
                      {item.license_key}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(item.license_key)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Copy License Key"
                  >
                    {copiedKey === item.license_key ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-slate-800/60 text-xs gap-3">
                <span className="text-slate-500">
                  {item.download_count} {item.download_count === 1 ? 'download' : 'downloads'}
                </span>
                <div className="flex items-center space-x-2">
                  {(item.product_id === 'prod_placementforge' ||
                    item.product_id === 'prod_portfoliodeploy' ||
                    item.product_id === 'prod_projectlaunch' ||
                    item.product_id === 'prod_repolens' ||
                    item.product_id === 'prod_interviewlab' ||
                    item.product_id === 'prod_studysignal' ||
                    item.product_id === 'prod_campusops' ||
                    item.product_id === 'prod_creatorpipe' ||
                    item.product_id === 'prod_workflowvault' ||
                    item.product_id === 'prod_freelanceos' ||
                    item.product_id === 'prod_infinite_empire' ||
                    item.product_id === 'prod_anime_clash') && onLaunchApp && (
                    <button
                      onClick={() => onLaunchApp(item.product_id)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-bold rounded-xl transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-cyan-400" />
                      <span>{item.category === 'games' ? 'Play Game' : 'Open Web Tool'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onDownload(item.product_id)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {item.download_filename}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
