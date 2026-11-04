import React from 'react';
import { ResumeData } from '../../../shared/placementforge.ts';
import { ExternalLink, Mail, MapPin, Award, BookOpen, Briefcase, Code2, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../BrandIcons.tsx';

interface PortfolioViewProps {
  resume: ResumeData;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ resume }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-200">
      {/* Portfolio Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open for SDE Placements & Internships</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hi, I'm <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{resume.personal.fullName}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {resume.personal.summary || 'Computer Science & Engineering Student passionate about scalable backend systems and high-throughput software engineering.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{resume.personal.location}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{resume.personal.email}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {resume.personal.github && (
              <a
                href={resume.personal.github.startsWith('http') ? resume.personal.github : `https://${resume.personal.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {resume.personal.linkedin && (
              <a
                href={resume.personal.linkedin.startsWith('http') ? resume.personal.linkedin : `https://${resume.personal.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
            {resume.personal.portfolioUrl && (
              <a
                href={resume.personal.portfolioUrl.startsWith('http') ? resume.personal.portfolioUrl : `https://${resume.personal.portfolioUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      {/* Featured Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          <span>Featured Technical Projects ({resume.projects.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resume.projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-base">{proj.title}</h3>
                  <div className="flex items-center space-x-2 shrink-0">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white"
                        title="View Source Code"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        title="Open Live Application"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 my-3">
                  {proj.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs text-slate-300">
                  {proj.bullets.filter(Boolean).map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Technical Competencies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Languages</span>
            <div className="text-white font-medium">{resume.skills.languages.join(' • ')}</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Frameworks & Libraries</span>
            <div className="text-white font-medium">{resume.skills.frameworks.join(' • ')}</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Tools & Cloud</span>
            <div className="text-white font-medium">{resume.skills.toolsAndCloud.join(' • ')}</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">CS Fundamentals</span>
            <div className="text-white font-medium">{resume.skills.fundamentals.join(' • ')}</div>
          </div>
        </div>
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Experience</span>
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-500 pl-3.5 space-y-1 text-xs">
                  <div className="font-bold text-white">{exp.role}</div>
                  <div className="text-slate-400">{exp.company} • {exp.duration}</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                    {exp.bullets[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Education & Honors</span>
          </h2>
          <div className="space-y-4">
            {resume.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-indigo-500 pl-3.5 space-y-1 text-xs">
                <div className="font-bold text-white">{edu.institution}</div>
                <div className="text-slate-400">{edu.degree} in {edu.fieldOfStudy}</div>
                <div className="text-emerald-400 font-mono text-[11px]">{edu.cgpaOrPercentage} ({edu.graduationYear})</div>
              </div>
            ))}
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="border-l-2 border-purple-500 pl-3.5 space-y-0.5 text-xs">
                <div className="font-semibold text-white">{cert.name}</div>
                <div className="text-slate-400 text-[11px]">{cert.issuer} • {cert.issueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
