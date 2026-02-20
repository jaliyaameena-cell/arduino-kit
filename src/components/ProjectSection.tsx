'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Wrench,
  Loader,
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ClipboardCopy,
  CheckCheck,
  ImageIcon,
  Sparkles,
  ListOrdered,
  FileCode2,
  Clock3,
  Images,
} from 'lucide-react';

interface ProjectSectionProps {
  selectedSensors: string[];
}

interface ImagePlaceholderProps {
  step: string;
}

interface GuideMetrics {
  stepCount: number;
  codeBlockCount: number;
  imagePlaceholderCount: number;
  readMinutes: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

const ImagePlaceholder = ({ step }: ImagePlaceholderProps) => (
  <div className="w-full rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white mb-6">
    <div className="aspect-video flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
          <ImageIcon size={20} />
        </div>
        <p className="text-sm text-slate-600 font-semibold">{step}</p>
        <p className="text-xs text-slate-500 mt-1">Wiring image placeholder</p>
      </div>
    </div>
  </div>
);

const renderMarkdownSection = (
  section: string,
  sectionIndex: number,
  copiedCodeKey: string | null,
  onCopyCode: (codeKey: string, value: string) => void
) => {
  const lines = section.split('\n');
  const elements: JSX.Element[] = [];
  let i = 0;
  let paragraphBuffer: string[] = [];
  let bulletBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;

    const text = paragraphBuffer.join(' ').trim();
    if (text) {
      elements.push(
        <p key={`p-${sectionIndex}-${elements.length}`} className="text-foreground leading-relaxed">
          {text}
        </p>
      );
    }

    paragraphBuffer = [];
  };

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;

    elements.push(
      <ul
        key={`ul-${sectionIndex}-${elements.length}`}
        className="list-disc pl-6 space-y-1 text-foreground"
      >
        {bulletBuffer.map((item, idx) => (
          <li key={`li-${sectionIndex}-${elements.length}-${idx}`}>{item}</li>
        ))}
      </ul>
    );

    bulletBuffer = [];
  };

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBullets();
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      flushParagraph();
      flushBullets();

      const lang = line.replace('```', '').trim() || 'text';
      i += 1;

      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      const codeValue = codeLines.join('\n');
      const codeKey = `code-${sectionIndex}-${elements.length}`;

      elements.push(
        <div key={`code-wrap-${sectionIndex}-${elements.length}`} className="my-6 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
            <div className="text-xs uppercase tracking-wide text-slate-700 font-semibold">{lang}</div>
            <button
              onClick={() => onCopyCode(codeKey, codeValue)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-arduino transition-colors"
              type="button"
            >
              {copiedCodeKey === codeKey ? <CheckCheck size={14} /> : <ClipboardCopy size={14} />}
              {copiedCodeKey === codeKey ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <pre className="overflow-x-auto bg-slate-950 p-4">
            <code className="text-slate-100 text-sm whitespace-pre">{codeValue}</code>
          </pre>
        </div>
      );

      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      bulletBuffer.push(line.slice(2).trim());
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushBullets();

      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (level <= 2) {
        elements.push(
          <h2
            key={`h2-${sectionIndex}-${elements.length}`}
            className="text-2xl font-semibold text-foreground mt-6 mb-3"
          >
            {text}
          </h2>
        );
      } else {
        elements.push(
          <h3
            key={`h3-${sectionIndex}-${elements.length}`}
            className="text-xl font-semibold text-foreground mt-5 mb-2"
          >
            {text}
          </h3>
        );
      }

      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushBullets();
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      const stepNumber = match ? match[1] : '';
      const stepTitle = match ? match[2] : line;

      elements.push(
        <div
          key={`step-${sectionIndex}-${elements.length}`}
          className="mt-2 mb-3 p-3 rounded-xl border border-arduino/20 bg-arduino/5 flex items-center gap-3"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-arduino text-white text-sm font-bold">
            {stepNumber}
          </span>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{stepTitle}</h3>
        </div>
      );

      i += 1;
      continue;
    }

    if (/^[a-z]\)\s+/i.test(line)) {
      flushParagraph();
      flushBullets();
      elements.push(
        <p
          key={`substep-${sectionIndex}-${elements.length}`}
          className="text-sm text-foreground rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
        >
          {line}
        </p>
      );
      i += 1;
      continue;
    }

    paragraphBuffer.push(line);
    i += 1;
  }

  flushParagraph();
  flushBullets();

  return elements;
};

const getStepNumberFromSection = (section: string, fallbackIndex: number) => {
  const match = section.match(/^\s*(\d+)\.\s+/m);
  if (match?.[1]) return match[1];
  return String(fallbackIndex + 1);
};

const getGuideMetrics = (content: string): GuideMetrics => {
  const stepMatches = content.match(/(^|\n)\s*\d+\.\s+/g) ?? [];
  const codeFenceMatches = content.match(/```/g) ?? [];
  const imageMatches = content.match(/\[IMAGE PLACEHOLDER\]/g) ?? [];
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    stepCount: stepMatches.length,
    codeBlockCount: Math.floor(codeFenceMatches.length / 2),
    imagePlaceholderCount: imageMatches.length,
    readMinutes: Math.max(1, Math.ceil(words / 220)),
  };
};

const renderProjectContent = (
  content: string,
  copiedCodeKey: string | null,
  onCopyCode: (codeKey: string, value: string) => void
) => {
  const sections = content.split('[IMAGE PLACEHOLDER]');
  const result: JSX.Element[] = [];

  sections.forEach((section, index) => {
    if (section.trim()) {
      result.push(
        <article key={`section-${index}`} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 card-shadow">
          <div className="space-y-4">
            {renderMarkdownSection(section.trim(), index, copiedCodeKey, onCopyCode)}
          </div>
        </article>
      );
    }

    if (index < sections.length - 1) {
      const stepNumber = getStepNumberFromSection(section, index);
      result.push(<ImagePlaceholder key={`image-${index}`} step={`Step ${stepNumber}`} />);
    }
  });

  return result;
};

const ProjectSection = ({ selectedSensors }: ProjectSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectGuide, setProjectGuide] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const guideMetrics = useMemo(
    () => (projectGuide ? getGuideMetrics(projectGuide) : null),
    [projectGuide]
  );

  const handleCopyCode = async (codeKey: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCodeKey(codeKey);
      window.setTimeout(() => {
        setCopiedCodeKey((prev) => (prev === codeKey ? null : prev));
      }, 1600);
    } catch {
      setCopiedCodeKey(null);
    }
  };

  const handleJumpToCode = () => {
    const firstCodeBlock = document.querySelector('#project pre');
    if (firstCodeBlock instanceof HTMLElement) {
      firstCodeBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyGuide = async () => {
    if (!projectGuide) return;
    try {
      await navigator.clipboard.writeText(projectGuide);
      setCopiedGuide(true);
      window.setTimeout(() => setCopiedGuide(false), 1600);
    } catch {
      setCopiedGuide(false);
    }
  };

  const handleBackToTop = () => {
    const container = document.getElementById('project');
    container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (selectedSensors.length === 0) {
      setProjectGuide(null);
      setError(null);
      return;
    }

    const fetchProjectGuide = async () => {
      setLoading(true);
      setError(null);
      setProjectGuide(null);

      try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sensors: selectedSensors }),
        });

        if (!response.ok) {
          let message = `API error: ${response.status}`;
          try {
            const data = await response.json();
            message = data.error || message;
          } catch {
            try {
              const text = await response.text();
              if (text) {
                message = text;
              }
            } catch {
              // Keep fallback message when response body isn't readable.
            }
          }

          const lower = message.toLowerCase();
          if (
            response.status >= 500 &&
            (lower.includes('econnrefused') ||
              lower.includes('proxy error') ||
              lower.includes('connection refused'))
          ) {
            message =
              'Cannot reach the API server. Start backend with `npm run dev:server` (or `npm run dev:all`) and verify port 5000 is running.';
          }

          if (response.status === 500 && message === 'API error: 500') {
            message =
              'Backend returned 500 with no details. This usually means the API server is not running or crashed. From project root run `npm run dev:server` (or `npm run dev:all`). From `server/`, run `npm run dev:server` or `npm start`, then check server terminal logs.';
          }
          throw new Error(message);
        }

        const data = await response.json();
        setProjectGuide(data.result);
      } catch (err) {
        const isNetworkError = err instanceof TypeError;
        const errorMessage = isNetworkError
          ? 'Cannot reach the API server. Start backend with `npm run dev:server` (or `npm run dev:all`) and verify the API URL/port.'
          : err instanceof Error
            ? err.message
            : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching project guide:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectGuide();
  }, [selectedSensors]);

  if (selectedSensors.length === 0) return null;

  return (
    <section id="project" className="py-24 section-alt">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="animate-fade-in">
          {loading && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-12 text-center card-shadow">
                <div className="w-16 h-16 bg-arduino/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-arduino/20">
                  <Loader size={32} className="text-arduino animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Generating your AI project guide...
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we create a customized Arduino project for your sensors.
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 card-shadow">
                <div className="flex gap-4">
                  <AlertCircle size={24} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Error Generating Project Guide
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setProjectGuide(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectGuide && !loading && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8 rounded-2xl border border-arduino/20 bg-gradient-to-r from-arduino/10 to-arduino/5 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-arduino/20">
                      <Cpu size={28} className="text-arduino" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-arduino font-bold mb-1 flex items-center gap-1.5">
                        <Sparkles size={12} />
                        AI Generated Guide
                      </p>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Your project plan is ready
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyGuide}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-arduino/20 bg-white px-3 py-2 text-xs font-semibold text-arduino hover:bg-arduino/10 transition-colors"
                    >
                      {copiedGuide ? <CheckCheck size={13} /> : <ClipboardCopy size={13} />}
                      {copiedGuide ? 'Copied Guide' : 'Copy Guide'}
                    </button>
                    <button
                      onClick={handleJumpToCode}
                      type="button"
                      className="inline-flex items-center rounded-xl border border-arduino/20 bg-white px-3 py-2 text-xs font-semibold text-arduino hover:bg-arduino/10 transition-colors"
                    >
                      Jump to Code
                    </button>
                    <button
                      onClick={handleBackToTop}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl border border-arduino/20 bg-white px-3 py-2 text-xs font-semibold text-arduino hover:bg-arduino/10 transition-colors"
                    >
                      <ArrowUp size={13} />
                      Top
                    </button>
                  </div>
                </div>
                {guideMetrics && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                      <ListOrdered size={13} className="text-arduino" />
                      {guideMetrics.stepCount} steps
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                      <FileCode2 size={13} className="text-arduino" />
                      {guideMetrics.codeBlockCount} code block
                      {guideMetrics.codeBlockCount !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                      <Images size={13} className="text-arduino" />
                      {guideMetrics.imagePlaceholderCount} wiring image
                      {guideMetrics.imagePlaceholderCount !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                      <Clock3 size={13} className="text-arduino" />
                      ~{guideMetrics.readMinutes} min read
                    </span>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-600">
                  Tailored for {selectedSensors.length} selected component
                  {selectedSensors.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 md:p-12 card-shadow space-y-8">
                <div className="space-y-5">
                  {renderProjectContent(projectGuide, copiedCodeKey, handleCopyCode)}
                </div>

                <div className="border-t border-border pt-8 mt-8">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench size={16} className="text-arduino" />
                      <h4 className="font-semibold text-foreground">
                        Your Selected Components ({selectedSensors.length})
                      </h4>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedSensors.map((sensor, i) => (
                        <li key={sensor} className="flex items-center gap-3 text-sm text-foreground">
                          <span className="w-6 h-6 rounded-full bg-arduino/15 text-arduino flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          {sensor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  document.getElementById('sensors')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 rounded-lg text-arduino font-medium hover:bg-arduino/10 transition-colors"
              >
                <ArrowLeft size={18} />
                Change Sensor Selection
              </button>
            </div>
          )}

          {!projectGuide && !loading && !error && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-arduino/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-arduino/20">
                <Cpu size={36} className="text-arduino" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Generating Your Project Guide
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                Your customized Arduino project guide will appear here with wiring diagrams, pin
                mappings, and complete Arduino code.
              </p>

              <div className="bg-card border border-border rounded-2xl p-6 text-left card-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench size={16} className="text-arduino" />
                  <h3 className="font-semibold text-foreground text-sm">
                    Your Selected Components ({selectedSensors.length})
                  </h3>
                </div>
                <ul className="space-y-2">
                  {selectedSensors.map((sensor, i) => (
                    <li key={sensor} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-arduino/15 text-arduino flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {sensor}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() =>
                  document.getElementById('sensors')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="mt-8 inline-flex items-center gap-2 text-sm text-arduino hover:text-arduino/80 font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Change Sensor Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;
