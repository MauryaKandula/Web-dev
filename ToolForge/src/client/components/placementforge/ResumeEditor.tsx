import React, { useState, useEffect } from 'react';
import { ResumeData, EducationItem, ExperienceItem, ProjectItem, CertificationItem } from '../../../shared/placementforge.ts';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onResetSample: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onChange,
  onResetSample
}) => {
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({
    languages: (resume.skills?.languages || []).join(', '),
    frameworks: (resume.skills?.frameworks || []).join(', '),
    toolsAndCloud: (resume.skills?.toolsAndCloud || []).join(', '),
    fundamentals: (resume.skills?.fundamentals || []).join(', ')
  });

  const [techStackInputs, setTechStackInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (resume.projects || []).forEach(p => {
      map[p.id] = (p.techStack || []).join(', ');
    });
    return map;
  });

  // Keep string inputs synchronized when sample is reset or resume changes externally
  useEffect(() => {
    setSkillInputs({
      languages: (resume.skills?.languages || []).join(', '),
      frameworks: (resume.skills?.frameworks || []).join(', '),
      toolsAndCloud: (resume.skills?.toolsAndCloud || []).join(', '),
      fundamentals: (resume.skills?.fundamentals || []).join(', ')
    });
    const map: Record<string, string> = {};
    (resume.projects || []).forEach(p => {
      map[p.id] = (p.techStack || []).join(', ');
    });
    setTechStackInputs(map);
  }, [resume.personal.fullName, resume.projects.length, resume.education.length]);

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    onChange({
      ...resume,
      personal: {
        ...resume.personal,
        [field]: value
      }
    });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu_${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      cgpaOrPercentage: '',
      graduationYear: `${new Date().getFullYear() + 1}`
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    onChange({
      ...resume,
      education: resume.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter(e => e.id !== id)
    });
  };

  // Experience Helpers
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp_${Date.now()}`,
      company: '',
      role: '',
      duration: '',
      location: '',
      bullets: ['']
    };
    onChange({ ...resume, experience: [...resume.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange({
      ...resume,
      experience: resume.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resume,
      experience: resume.experience.filter(e => e.id !== id)
    });
  };

  // Projects Helpers
  const addProject = () => {
    const newId = `proj_${Date.now()}`;
    const newProj: ProjectItem = {
      id: newId,
      title: '',
      techStack: [],
      liveUrl: '',
      githubUrl: '',
      bullets: ['']
    };
    setTechStackInputs(prev => ({ ...prev, [newId]: '' }));
    onChange({ ...resume, projects: [...resume.projects, newProj] });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter(p => p.id !== id)
    });
  };

  // Skills Helpers with seamless typing support
  const handleSkillChange = (category: keyof ResumeData['skills'], commaString: string) => {
    setSkillInputs(prev => ({ ...prev, [category]: commaString }));
    const items = commaString.split(',').map(s => s.trim()).filter(Boolean);
    onChange({
      ...resume,
      skills: {
        ...resume.skills,
        [category]: items
      }
    });
  };

  const handleTechStackChange = (projId: string, commaString: string) => {
    setTechStackInputs(prev => ({ ...prev, [projId]: commaString }));
    const items = commaString.split(',').map(s => s.trim()).filter(Boolean);
    updateProject(projId, 'techStack', items);
  };

  // Certifications Helpers
  const addCert = () => {
    const newCert: CertificationItem = {
      id: `cert_${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      credentialUrl: ''
    };
    onChange({ ...resume, certifications: [...resume.certifications, newCert] });
  };

  const updateCert = (id: string, field: keyof CertificationItem, value: string) => {
    onChange({
      ...resume,
      certifications: resume.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const removeCert = (id: string) => {
    onChange({
      ...resume,
      certifications: resume.certifications.filter(c => c.id !== id)
    });
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Header action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="font-bold text-white text-sm">Resume Details</span>
        <button
          onClick={onResetSample}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
          title="Reset to verified Indian CSE sample"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Load Indian CSE Sample</span>
        </button>
      </div>

      {/* 1. Personal Details */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
          1. Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Full Name *</label>
            <input
              type="text"
              value={resume.personal.fullName}
              onChange={e => updatePersonal('fullName', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Example Candidate"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Email Address *</label>
            <input
              type="email"
              value={resume.personal.email}
              onChange={e => updatePersonal('email', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. candidate@placementforge.test"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Contact Phone *</label>
            <input
              type="text"
              value={resume.personal.phone}
              onChange={e => updatePersonal('phone', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Your phone number (optional)"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Location / City</label>
            <input
              type="text"
              value={resume.personal.location}
              onChange={e => updatePersonal('location', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Warangal / Hyderabad, India"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={resume.personal.linkedin || ''}
              onChange={e => updatePersonal('linkedin', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. linkedin.com/in/rahul-cse"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">GitHub Profile</label>
            <input
              type="text"
              value={resume.personal.github || ''}
              onChange={e => updatePersonal('github', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. github.com/rahul-dev"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Professional Summary / Objective</label>
          <textarea
            value={resume.personal.summary || ''}
            onChange={e => updatePersonal('summary', e.target.value)}
            rows={2}
            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Concise 2-line summary emphasizing core CS strengths and interests"
          />
        </div>
      </div>

      {/* 2. Education */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
            2. Education
          </h4>
          <button
            onClick={addEducation}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add School/College</span>
          </button>
        </div>
        {resume.education.map((edu, idx) => (
          <div key={edu.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11px]">Institution #{idx + 1}</span>
              {resume.education.length > 1 && (
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={edu.institution}
                onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                placeholder="College / University Name"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={edu.degree}
                onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                placeholder="Degree (e.g. B.Tech)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={e => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                placeholder="Branch / Specialization (e.g. CSE)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={edu.cgpaOrPercentage}
                  onChange={e => updateEducation(edu.id, 'cgpaOrPercentage', e.target.value)}
                  placeholder="CGPA (e.g. 8.7/10)"
                  className="w-1/2 p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                />
                <input
                  type="text"
                  value={edu.graduationYear}
                  onChange={e => updateEducation(edu.id, 'graduationYear', e.target.value)}
                  placeholder="Year (e.g. 2027)"
                  className="w-1/2 p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Technical Skills */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
          3. Technical Skills (Comma-separated)
        </h4>
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Programming Languages</label>
            <input
              type="text"
              value={skillInputs.languages ?? ''}
              onChange={e => handleSkillChange('languages', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              placeholder="e.g. C++, Java, Python, Go, TypeScript, SQL"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Frameworks & Libraries</label>
            <input
              type="text"
              value={skillInputs.frameworks ?? ''}
              onChange={e => handleSkillChange('frameworks', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              placeholder="e.g. React, Next.js, Node.js, Express, FastAPI, Spring Boot"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tools & Cloud</label>
            <input
              type="text"
              value={skillInputs.toolsAndCloud ?? ''}
              onChange={e => handleSkillChange('toolsAndCloud', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              placeholder="e.g. Git, Docker, Kubernetes, Linux, Redis, PostgreSQL, AWS"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">CS Fundamentals & Concepts</label>
            <input
              type="text"
              value={skillInputs.fundamentals ?? ''}
              onChange={e => handleSkillChange('fundamentals', e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              placeholder="e.g. Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks"
            />
          </div>
        </div>
      </div>

      {/* 4. Projects */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
            4. Technical Projects
          </h4>
          <button
            onClick={addProject}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add Project</span>
          </button>
        </div>
        {resume.projects.map((proj, idx) => (
          <div key={proj.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11px]">Project #{idx + 1}</span>
              {resume.projects.length > 1 && (
                <button
                  onClick={() => removeProject(proj.id)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={proj.title}
                onChange={e => updateProject(proj.id, 'title', e.target.value)}
                placeholder="Project Title"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={techStackInputs[proj.id] ?? proj.techStack.join(', ')}
                onChange={e => handleTechStackChange(proj.id, e.target.value)}
                placeholder="Tech Stack (comma separated: Go, Redis, Docker)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={proj.githubUrl || ''}
                onChange={e => updateProject(proj.id, 'githubUrl', e.target.value)}
                placeholder="GitHub Repository URL"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={proj.liveUrl || ''}
                onChange={e => updateProject(proj.id, 'liveUrl', e.target.value)}
                placeholder="Live Demo URL (optional)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Key Impact / Feature Bullets (one per line)</label>
              <textarea
                value={proj.bullets.join('\n')}
                onChange={e => updateProject(proj.id, 'bullets', e.target.value.split('\n'))}
                rows={3}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-white font-mono text-[11px]"
                placeholder="Engineered high-throughput queue with 99.9% uptime..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Experience / Internships */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
            5. Work Experience / Internships
          </h4>
          <button
            onClick={addExperience}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add Experience</span>
          </button>
        </div>
        {resume.experience.map((exp, idx) => (
          <div key={exp.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11px]">Experience #{idx + 1}</span>
              <button
                onClick={() => removeExperience(exp.id)}
                className="text-rose-400 hover:text-rose-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={exp.company}
                onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                placeholder="Company Name"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={exp.role}
                onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                placeholder="Role (e.g. SDE Intern)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={exp.duration}
                onChange={e => updateExperience(exp.id, 'duration', e.target.value)}
                placeholder="Duration (e.g. May 2026 - July 2026)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={exp.location}
                onChange={e => updateExperience(exp.id, 'location', e.target.value)}
                placeholder="Location (e.g. Bengaluru / Remote)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Accomplishment Bullets (one per line)</label>
              <textarea
                value={exp.bullets.join('\n')}
                onChange={e => updateExperience(exp.id, 'bullets', e.target.value.split('\n'))}
                rows={3}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-white font-mono text-[11px]"
                placeholder="Architected distributed rate limiter handling 45k req/s..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* 6. Certifications */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
            6. Certifications & Badges
          </h4>
          <button
            onClick={addCert}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Add Certification</span>
          </button>
        </div>
        {resume.certifications.map((c, idx) => (
          <div key={c.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11px]">Certification #{idx + 1}</span>
              <button
                onClick={() => removeCert(c.id)}
                className="text-rose-400 hover:text-rose-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={c.name}
                onChange={e => updateCert(c.id, 'name', e.target.value)}
                placeholder="Certificate Title"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={c.issuer}
                onChange={e => updateCert(c.id, 'issuer', e.target.value)}
                placeholder="Issuing Organization (e.g. AWS)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={c.issueDate}
                onChange={e => updateCert(c.id, 'issueDate', e.target.value)}
                placeholder="Date (e.g. August 2025)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
              <input
                type="text"
                value={c.credentialUrl || ''}
                onChange={e => updateCert(c.id, 'credentialUrl', e.target.value)}
                placeholder="Verification URL (optional)"
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
