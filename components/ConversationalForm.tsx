"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { customerInfoQuestions, doorQuestions, Option, Question } from "@/lib/questions";
import SlabOnlySpecForm from "@/components/SlabOnlySpecForm";

type Answers = Record<string, string | string[]>;

const allQuestions = [...customerInfoQuestions, ...doorQuestions];
function getVisibleQuestions(answers: Answers): Question[] {
  return allQuestions.filter((q) => (q.showIf ? q.showIf(answers) : true));
}

// ─── OptionCard ──────────────────────────────────────────────────────────────
function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex w-full cursor-pointer flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
        selected
          ? "border-amber-500 bg-amber-50 shadow-sm shadow-amber-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {option.image && !imgError && (
        <div className="h-24 w-full overflow-hidden rounded-lg bg-slate-100">
          <img
            src={option.image}
            alt={option.label}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="flex w-full items-center gap-3">
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            selected ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
          }`}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-2 w-2 rounded-full bg-white"
            />
          )}
        </div>
        {option.colorHex && (
          <span
            className="h-5 w-5 flex-shrink-0 rounded-full border border-slate-200 shadow-sm"
            style={{ backgroundColor: option.colorHex }}
            aria-hidden="true"
          />
        )}
        <span className={`text-sm font-semibold ${selected ? "text-amber-800" : "text-slate-800"}`}>
          {option.label}
        </span>
      </div>
      {option.description && (
        <p className={`pl-8 text-xs ${selected ? "text-amber-600" : "text-slate-500"}`}>
          {option.description}
        </p>
      )}
    </motion.button>
  );
}

// ─── QuestionBlock ────────────────────────────────────────────────────────────
function QuestionBlock({
  question,
  answer,
  onChange,
  onSelect,
  onNext,
  isActive,
  questionNumber,
  totalQuestions,
}: {
  question: Question;
  answer: string | string[];
  onChange: (val: string | string[]) => void;
  onSelect: (val: string) => void;
  onNext: () => void;
  isActive: boolean;
  questionNumber: number;
  totalQuestions: number;
}) {
  const [customValue, setCustomValue] = useState("");
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive && question.type === "text" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isActive, question.type]);

  const strAnswer = Array.isArray(answer) ? answer[0] ?? "" : answer ?? "";
  const isCustomSelected = strAnswer.startsWith("__custom__:");
  const currentCustom = isCustomSelected ? strAnswer.replace("__custom__:", "") : "";

  const sharedInputClassName =
    "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-0";

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strAnswer.trim()) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-6"
    >
      {/* Question bubble */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {questionNumber} / {totalQuestions}
          </span>
        </div>
        <p className="text-lg font-semibold leading-snug text-slate-900">{question.text}</p>
        {question.subtext && (
          <p className="mt-1.5 text-sm text-slate-500">{question.subtext}</p>
        )}
        {question.image && !imgError && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            <img
              src={question.image}
              alt="Question reference"
              className="w-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>

      {/* Answer area */}
      <div>
        {question.type === "text" && (
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            {question.multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={strAnswer}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder ?? "Type your answer…"}
                rows={4}
                className={`${sharedInputClassName} min-h-28 resize-y`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={strAnswer}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder ?? "Type your answer…"}
                className={sharedInputClassName}
              />
            )}
            <button
              type="submit"
              disabled={!strAnswer.trim()}
              className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </form>
        )}

        {(question.type === "single" || question.type === "yesno") && (
          <div
            className={`grid gap-2.5 ${
              question.options && question.options.length <= 2
                ? "grid-cols-1 sm:grid-cols-2"
                : question.options && question.options.some((o) => o.image)
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {question.options?.map((opt) => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={strAnswer === opt.value}
                onClick={() => onSelect(opt.value)}
              />
            ))}

            {question.allowCustom && (
              <div
                className={`rounded-xl border-2 p-4 transition-all duration-150 ${
                  isCustomSelected
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className="mb-3 flex cursor-pointer items-center gap-3"
                  onClick={() => {
                    if (customValue.trim()) {
                      onSelect(`__custom__:${customValue}`);
                    } else {
                      onChange(`__custom__:${customValue}`);
                    }
                  }}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      isCustomSelected ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
                    }`}
                  >
                    {isCustomSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${isCustomSelected ? "text-amber-800" : "text-slate-700"}`}>
                    {question.customLabel ?? "Custom / Other"}
                  </span>
                </div>
                <input
                  type="text"
                  value={isCustomSelected ? currentCustom : customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    onChange(`__custom__:${e.target.value}`);
                  }}
                  placeholder="Enter custom value…"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none"
                />
                {isCustomSelected && currentCustom && (
                  <button
                    onClick={() => onSelect(`__custom__:${currentCustom}`)}
                    className="mt-2.5 w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    Confirm →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function Summary({
  answers,
  visibleQuestions,
  onEditAll,
  onSubmit,
  isSubmitting,
  submitted,
}: {
  answers: Answers;
  visibleQuestions: Question[];
  onEditAll: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitted: boolean;
}) {
  const formatAnswer = (q: Question, raw: string | string[]): string => {
    const val = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
    if (val.startsWith("__custom__:")) return val.replace("__custom__:", "") || "—";
    const opt = q.options?.find((o) => o.value === val);
    return opt ? opt.label : val || "—";
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">Quote Request Sent!</h3>
        <p className="text-slate-600">
          We&apos;ve received your door specifications. Our team will be in touch with you shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      {/* Header row */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Your Request</h2>
          <p className="mt-1 text-sm text-slate-500">Confirm everything looks right before submitting.</p>
        </div>
        <button
          onClick={onEditAll}
          className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Answers
        </button>
      </div>

      {/* Answers table */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {visibleQuestions.map((q, i) => {
          const ans = answers[q.id];
          if (!ans && q.type !== "text") return null;
          return (
            <div
              key={q.id}
              className={`flex items-start gap-4 px-5 py-4 ${
                i < visibleQuestions.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-xs font-medium text-slate-400 uppercase tracking-wide">{q.text}</p>
                <p className="text-sm font-semibold text-slate-900">{formatAnswer(q, ans ?? "")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
      >
        {isSubmitting ? "Sending…" : "Submit Quote Request →"}
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConversationalForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visibleQuestions = getVisibleQuestions(answers);
  const isSlabOnly = answers["q1_unitType"] === "slab";
  const answeredCount = visibleQuestions.filter((q) => {
    const answer = answers[q.id];
    return answer !== undefined && answer !== "";
  }).length;
  const progress = visibleQuestions.length > 0 ? Math.round((answeredCount / visibleQuestions.length) * 100) : 0;

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(visibleQuestions.length - 1, 0)));
  }, [visibleQuestions.length]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // KEY FIX: Computes new answers synchronously so navigation uses fresh state,
  // not the stale closure captured before the React re-render.
  const handleSelect = (questionId: string, value: string, idx: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      const nextVisible = getVisibleQuestions(newAnswers);
      if (idx < nextVisible.length - 1) {
        setCurrentIndex(idx + 1);
      } else {
        setShowSummary(true);
      }
    }, 300);
  };

  const handleNext = (idx: number) => {
    const nextVisible = getVisibleQuestions(answers);
    if (idx < nextVisible.length - 1) {
      setCurrentIndex(idx + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleEditAll = () => {
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formatted: Record<string, string> = {};
      visibleQuestions.forEach((q) => {
        const raw = answers[q.id];
        if (!raw) return;
        const val = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
        const display = val.startsWith("__custom__:")
          ? val.replace("__custom__:", "")
          : q.options?.find((o) => o.value === val)?.label ?? val;
        formatted[q.text] = display;
      });

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formatted, raw: answers }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("There was an error submitting. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Summary / Slab view ──────────────────────────────────────────────────
  if (showSummary) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-white shadow-sm">
              BL
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-slate-900">Beisser Lumber</p>
              <p className="text-xs text-slate-500">Door Quote Request</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">
          {isSlabOnly ? (
            <SlabOnlySpecForm
              onBack={() => {
                setShowSummary(false);
                setCurrentIndex(
                  Math.max(
                    0,
                    allQuestions.findIndex((q) => q.id === "q1_unitType")
                  )
                );
              }}
              initialCustomerInfo={{
                full_name: (answers["customerName"] as string) || "",
                phone_number: (answers["phone"] as string) || "",
              }}
            />
          ) : (
            <Summary
              answers={answers}
              visibleQuestions={visibleQuestions}
              onEditAll={handleEditAll}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitted={submitted}
            />
          )}
        </main>
      </div>
    );
  }

  // ─── Conversational Q&A view ──────────────────────────────────────────────
  const displayedQuestions = visibleQuestions.slice(0, currentIndex + 1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header + progress */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-white shadow-sm">
                BL
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-slate-900">Beisser Lumber</p>
                <p className="text-xs text-slate-500">Door Quote Request</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {answeredCount} of {visibleQuestions.length} answered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-amber-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-amber-600">{progress}%</span>
          </div>
        </div>
      </header>

      {/* Questions */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <AnimatePresence mode="popLayout">
          {displayedQuestions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              answer={answers[q.id] ?? ""}
              onChange={(val) => handleAnswer(q.id, val)}
              onSelect={(val) => handleSelect(q.id, val, idx)}
              onNext={() => handleNext(idx)}
              isActive={idx === currentIndex}
              questionNumber={idx + 1}
              totalQuestions={visibleQuestions.length}
            />
          ))}
        </AnimatePresence>

        <div ref={bottomRef} className="h-28" />

        {/* "Review & Submit" sticky button — prehung only, all answered */}
        {answeredCount > 0 &&
          answeredCount === visibleQuestions.length &&
          !showSummary &&
          !isSlabOnly && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2"
            >
              <button
                onClick={() => setShowSummary(true)}
                className="rounded-full bg-amber-500 px-8 py-4 font-bold text-white shadow-xl shadow-amber-200 transition-colors hover:bg-amber-600"
              >
                Review &amp; Submit →
              </button>
            </motion.div>
          )}
      </main>
    </div>
  );
}
