import React from 'react';
import { ResumeData } from '../../../shared/placementforge.ts';
import { Printer, Lock, CheckCircle2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../BrandIcons.tsx';

interface ResumePreviewProps {
  resume: ResumeData;
  isPro: boolean;
  upgradePriceInr?: number;
  onUnlockPro: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  isPro,
  upgradePriceInr,
  onUnlockPro
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-6 text-xs">
        <div className="flex items-center space-x-2">
          {isPro ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pro License Active (Watermark-Free Export)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Draft Preview Mode (Watermarked PDF)</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isPro && upgradePriceInr !== undefined && (
            <button
              onClick={onUnlockPro}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              Unlock Watermark-Free PDF (₹{upgradePriceInr})
            </button>
          )}
          {!isPro && upgradePriceInr === undefined && (
            <span className="text-[11px] text-slate-400">Paid export upgrade unavailable in this preview</span>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable ATS Resume Document */}
      <div className="print-area relative w-full max-w-[800px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 font-sans resume-doc transition-all border border-slate-200 break-words [overflow-wrap:anywhere]">
        {/* Subtle Watermark for unpurchased users */}
        {!isPro && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none z-10">
            <div className="text-4xl sm:text-6xl font-black text-slate-800 -rotate-45 text-center leading-tight">
              PREVIEW DRAFT<br />TOOLFORGE PLACEMENTFORGE
            </div>
          </div>
        )}

        {/* 1. Resume Header */}
        <header className="border-b-2 border-slate-900 pb-4 mb-5 text-center avoid-page-break">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase font-sans">
            {resume.personal.fullName || 'Candidate Name'}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-700">
            {resume.personal.email && (
              <span className="flex items-center space-x-1">
                <Mail className="w-3 h-3 text-slate-600 inline" />
                <span>{resume.personal.email}</span>
              </span>
            )}
            {resume.personal.phone && (
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-slate-600 inline" />
                <span>{resume.personal.phone}</span>
              </span>
            )}
            {resume.personal.location && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-600 inline" />
                <span>{resume.personal.location}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1.5 text-xs text-blue-800 font-medium">
            {resume.personal.linkedin && (
              <span className="flex items-center space-x-1">
                <LinkedinIcon className="w-3 h-3 inline text-blue-800" />
                <span>{resume.personal.linkedin}</span>
              </span>
            )}
            {resume.personal.github && (
              <span className="flex items-center space-x-1">
                <GithubIcon className="w-3 h-3 inline text-slate-800" />
                <span>{resume.personal.github}</span>
              </span>
            )}
            {resume.personal.portfolioUrl && (
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3 inline" />
                <span>{resume.personal.portfolioUrl}</span>
              </span>
            )}
          </div>

          {resume.personal.summary && (
            <p className="mt-3 text-xs text-slate-700 leading-relaxed text-left border-t border-slate-200 pt-2 italic">
              {resume.personal.summary}
            </p>
          )}
        </header>

        {/* 2. Education */}
        {resume.education.length > 0 && (
          <section className="mb-5 avoid-page-break">
            <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-mono">
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id} className="resume-section-item flex justify-between items-baseline text-xs">
                  <div>
                    <div className="font-bold text-slate-950">{edu.institution}</div>
                    <div className="text-slate-700">
                      {edu.degree} in {edu.fieldOfStudy}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{edu.cgpaOrPercentage}</div>
                    <div className="text-slate-600 text-[11px]">{edu.graduationYear}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Technical Skills */}
        <section className="mb-5 avoid-page-break">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-mono">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs text-slate-800 leading-snug">
            {resume.skills.languages.length > 0 && (
              <div>
                <strong className="text-slate-950">Languages:</strong> {resume.skills.languages.join(', ')}
              </div>
            )}
            {resume.skills.frameworks.length > 0 && (
              <div>
                <strong className="text-slate-950">Frameworks & Libraries:</strong> {resume.skills.frameworks.join(', ')}
              </div>
            )}
            {resume.skills.toolsAndCloud.length > 0 && (
              <div>
                <strong className="text-slate-950">Developer Tools & Cloud:</strong> {resume.skills.toolsAndCloud.join(', ')}
              </div>
            )}
            {resume.skills.fundamentals.length > 0 && (
              <div>
                <strong className="text-slate-950">Core CS Fundamentals:</strong> {resume.skills.fundamentals.join(', ')}
              </div>
            )}
          </div>
        </section>

        {/* 4. Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-mono">
              Work Experience & Internships
            </h2>
            <div className="space-y-3">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="resume-section-item avoid-page-break text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-950">{exp.company}</span>
                    <span className="text-slate-600 font-medium text-[11px]">{exp.duration} | {exp.location}</span>
                  </div>
                  <div className="italic text-slate-700 mb-1">{exp.role}</div>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800">
                    {exp.bullets.filter(Boolean).map((bullet, idx) => (
                      <li key={idx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Projects */}
        {resume.projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-mono">
              Key Technical Projects
            </h2>
            <div className="space-y-3">
              {resume.projects.map((proj) => (
                <div key={proj.id} className="resume-section-item avoid-page-break text-xs">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <strong className="text-slate-950 font-bold">{proj.title}</strong>
                      <span className="text-slate-600 text-[11px] ml-2">
                        [{proj.techStack.join(', ')}]
                      </span>
                    </div>
                    <div className="space-x-2 text-[11px] font-medium text-blue-800">
                      {proj.githubUrl && <span>{proj.githubUrl.replace(/^https?:\/\//, '')}</span>}
                      {proj.liveUrl && <span>• {proj.liveUrl.replace(/^https?:\/\//, '')}</span>}
                    </div>
                  </div>
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-800">
                    {proj.bullets.filter(Boolean).map((bullet, idx) => (
                      <li key={idx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Certifications */}
        {resume.certifications.length > 0 && (
          <section className="avoid-page-break">
            <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-mono">
              Certifications & Honors
            </h2>
            <div className="space-y-1.5 text-xs">
              {resume.certifications.map((cert) => (
                <div key={cert.id} className="resume-section-item flex justify-between items-baseline text-slate-800">
                  <div>
                    <strong className="text-slate-950">{cert.name}</strong> — {cert.issuer}
                  </div>
                  <div className="text-slate-600 text-[11px]">{cert.issueDate}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
