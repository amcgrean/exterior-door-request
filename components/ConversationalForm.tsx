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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex w-full cursor-pointer flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800"
      }`}
    >
      {option.image && !imgError && (
        <div className="h-28 w-full overflow-hidden rounded-lg bg-zinc-800">
          <img
            src={option.image}
            alt={option.label}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="flex w-full items-center gap-2">
        <div
          className={`flex h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
            selected ? "border-amber-500 bg-amber-500" : "border-zinc-600"
          }`}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-full w-full rounded-full bg-amber-500"
            />
          )}
        </div>
        {option.colorHex && (
          <span
            className="h-4 w-4 rounded-full border border-white/20"
            style={{ backgroundColor: option.colorHex }}
            aria-hidden="true"
          />
        )}
        <span className={`text-sm font-medium ${selected ? "text-amber-400" : "text-zinc-200"}`}>
          {option.label}
        </span>
      </div>
      {option.description && <p className="pl-6 text-xs text-zinc-400">{option.description}</p>}
    </motion.button>
  );
}

function QuestionBlock({
  question,
  answer,
  onChange,
  onNext,
  isActive,
  questionNumber,
  totalQuestions,
}: {
  question: Question;
  answer: string | string[];
  onChange: (val: string | string[]) => void;
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
    "w-full flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-none";

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strAnswer.trim()) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
          B
        </div>
        <div className="max-w-2xl flex-1">
          <div className="rounded-2xl rounded-tl-sm border border-zinc-700 bg-zinc-900 px-5 py-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">
                {questionNumber} of {totalQuestions}
              </span>
            </div>
            <p className="text-lg font-semibold leading-snug text-white">{question.text}</p>
            {question.subtext && <p className="mt-1 text-sm text-zinc-400">{question.subtext}</p>}

            {question.image && !imgError && (
              <div className="mt-3 h-40 overflow-hidden rounded-xl border border-zinc-700">
                <img
                  src={question.image}
                  alt="Question reference"
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pl-11">
        {question.type === "text" && (
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            {question.multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={strAnswer}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder ?? "Type your answer..."}
                className={`${sharedInputClassName} min-h-32 resize-y`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={strAnswer}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder ?? "Type your answer..."}
                className={sharedInputClassName}
              />
            )}
            <button
              type="submit"
              disabled={!strAnswer.trim()}
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </form>
        )}

        {(question.type === "single" || question.type === "yesno") && (
          <div
            className={`grid gap-2 ${
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
                onClick={() => {
                  onChange(opt.value);
                  setTimeout(onNext, 350);
                }}
              />
            ))}

            {question.allowCustom && (
              <div
                className={`rounded-xl border p-3 transition-all duration-200 ${
                  isCustomSelected
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <div
                  className="mb-2 flex cursor-pointer items-center gap-2"
                  onClick={() => onChange(`__custom__:${customValue}`)}
                >
                  <div
                    className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                      isCustomSelected ? "border-amber-500 bg-amber-500" : "border-zinc-600"
                    }`}
                  />
                  <span className={`text-sm font-medium ${isCustomSelected ? "text-amber-400" : "text-zinc-300"}`}>
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
                  placeholder="Enter custom value..."
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-none"
                />
                {isCustomSelected && currentCustom && (
                  <button
                    onClick={onNext}
                    className="mt-2 w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
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

function Summary({
  answers,
  visibleQuestions,
  onEdit,
  onSubmit,
  isSubmitting,
  submitted,
}: {
  answers: Answers;
  visibleQuestions: Question[];
  onEdit: (id: string) => void;
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

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="mb-1 text-2xl font-bold text-white">Review your answers</h2>
        <p className="mb-6 text-sm text-zinc-400">
          Everything look right? You can edit any answer before submitting.
        </p>
        <div className="space-y-3">
          {visibleQuestions.map((q) => {
            const ans = answers[q.id];
            if (!ans && q.type !== "text") return null;
            return (
              <div
                key={q.id}
                className="flex items-start justify-between gap-4 border-b border-zinc-800 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs text-zinc-500">{q.text}</p>
                  <p className="truncate text-sm font-medium text-white">{formatAnswer(q, ans ?? "")}</p>
                </div>
                <button
                  onClick={() => onEdit(q.id)}
                  className="mt-1 flex-shrink-0 text-xs text-amber-500 hover:text-amber-400"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white">Quote Request Sent!</h3>
          <p className="text-zinc-400">
            We&apos;ve received your door specifications. Our team will be in touch soon.
          </p>
        </motion.div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-amber-500 py-4 text-lg font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Submit Quote Request →"}
        </button>
      )}
    </motion.div>
  );
}

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

  const handleNext = (idx: number) => {
    const nextVisible = getVisibleQuestions(answers);
    if (idx < nextVisible.length - 1) {
      setCurrentIndex(idx + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleEdit = (questionId: string) => {
    const idx = visibleQuestions.findIndex((q) => q.id === questionId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setShowSummary(false);
    }
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

  if (showSummary) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 py-12">
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">B</div>
            <span className="text-xl font-bold text-white">Beisser Lumber</span>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800">
            <div className="h-1.5 rounded-full bg-amber-500 transition-all duration-500" style={{ width: "100%" }} />
          </div>
        </div>
        {isSlabOnly ? (
          <SlabOnlySpecForm
            onBack={() => {
              setShowSummary(false);
              handleEdit("q1_unitType");
            }}
          />
        ) : (
          <Summary
            answers={answers}
            visibleQuestions={visibleQuestions}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitted={submitted}
          />
        )}
      </div>
    );
  }

  const displayedQuestions = visibleQuestions.slice(0, currentIndex + 1);

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="sticky top-0 z-10 mx-auto mb-8 max-w-2xl bg-[#0f0f0f] pb-4 pt-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">
              B
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">Beisser Lumber</p>
              <p className="text-xs text-zinc-400">Door Quote Assistant</p>
            </div>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {answeredCount}/{visibleQuestions.length} answered
          </span>
        </div>

        <div className="h-1 w-full rounded-full bg-zinc-800">
          <motion.div
            className="h-1 rounded-full bg-amber-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="popLayout">
          {displayedQuestions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              question={q}
              answer={answers[q.id] ?? ""}
              onChange={(val) => handleAnswer(q.id, val)}
              onNext={() => handleNext(idx)}
              isActive={idx === currentIndex}
              questionNumber={idx + 1}
              totalQuestions={visibleQuestions.length}
            />
          ))}
        </AnimatePresence>

        <div ref={bottomRef} className="h-32" />

        {answeredCount > 0 && answeredCount === visibleQuestions.length && !showSummary && !isSlabOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2"
          >
            <button
              onClick={() => setShowSummary(true)}
              className="rounded-full bg-amber-500 px-8 py-4 font-bold text-black shadow-xl shadow-amber-500/30 transition-colors hover:bg-amber-400"
            >
              Review & Submit →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
