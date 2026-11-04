import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Product } from '../types.ts';

interface DevProductToolboxProps {
  product: Product;
}

export const DevProductToolbox: React.FC<DevProductToolboxProps> = ({ product }) => {
  const suppliedUrl = (product as Product & { github_url?: string }).github_url;
  const githubUrl = suppliedUrl && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(suppliedUrl)
    ? suppliedUrl
    : undefined;

  return (
    <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <div>
          <h2 className="text-base font-bold text-white">Source and review notes</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Review the source, license, release history, and compatibility before installing or running a download.
            A ToolForge listing is not a security audit, and this preview does not run third-party software in a sandbox.
          </p>
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              View source repository <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-4 text-sm text-amber-300">No source repository has been published for this listing.</p>
          )}
          <p className="mt-3 text-xs text-slate-500">{product.title} · version {product.version || 'unspecified'}</p>
        </div>
      </div>
    </section>
  );
};
