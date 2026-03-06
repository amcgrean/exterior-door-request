"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { customerInfoQuestions, doorQuestions, Question, Option } from "@/lib/questions";

type Answers = Record<string, string | string[]>;

const allQuestions = [...customerInfoQuestions, ...doorQuestions];

function getVisibleQuestions(answers: Answers): Question[] {
  return allQuestions.filter((q) =>
    q.showIf ? q.showIf(answers) : true
  );
}

// ── Option Card ───────────────────────────────────────────────────────────────
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
      className={`relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer w-full ${
        selected
          ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800"
      }`}
    >
      {option.image && !imgError && (
        <div className="w-full h-28 rounded-lg overflow-hidden bg-zinc-800">
          <img
            src={option.image}
            alt={option.label}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="flex items-center gap-2 w-full">
        <div
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
            selected
              ? "border-amber-500 bg-amber-500"
              : "border-zinc-600"
          }`}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full rounded-full bg-amber-500"
            />
          )}
        </div>
        <span className={`font-medium text-sm ${selected ? "text-amber-400" : "text-zinc-200"}`}>
          {option.label}
        </span>
      </div>
      {option.description && (
        <p className="text-xs text-zinc-400 pl-6">{option.description}</p>
      )}
    </motion.button>
  );
}

// ── Question Block ────────────────────────────────────────────────────────────
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

  const handleOptionClick = (value: string) => {
    onChange(value);
  };

  const handleCustomSelect = () => {
    onChange("__custom__:" + customValue);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strAnswer.trim()) onNext();
  };

  const isCustomSelected = strAnswer.startsWith("__custom__:");
  const currentCustom = isCustomSelected ? strAnswer.replace("__custom__:", "") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      {/* Bot bubble */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center text-black font-bold text-xs mt-1">
          B
        </div>
        <div className="flex-1 max-w-2xl">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl rounded-tl-sm px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-500 font-mono">
                {questionNumber} of {totalQuestions}
              </span>
            </div>
            <p className="text-white font-semibold text-lg leading-snug">
              {question.text}
            </p>
            {question.subtext && (
              <p className="text-zinc-400 text-sm mt-1">{question.subtext}</p>
            )}

            {/* Question image */}
            {question.image && !imgError && (
              <div className="mt-3 rounded-xl overflow-hidden border border-zinc-700 h-40">
                <img
                  src={question.image}
                  alt="Question reference"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer area */}
      <div className="pl-11">
        {question.type === "text" && (
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={strAnswer}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder ?? "Type your answer..."}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!strAnswer.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          </form>
        )}

        {(question.type === "single" || question.type === "yesno") && (
          <div>
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
                    handleOptionClick(opt.value);
                    setTimeout(onNext, 350);
                  }}
                />
              ))}

              {/* Custom option */}
              {question.allowCustom && (
                <div
                  className={`rounded-xl border p-3 transition-all duration-200 ${
                    isCustomSelected
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                    onClick={() =>
                      onChange("__custom__:" + customValue)
                    }
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        isCustomSelected
                          ? "border-amber-500 bg-amber-500"
                          : "border-zinc-600"
                      }`}
                    />
                    <span
                      className={`font-medium text-sm ${
                        isCustomSelected ? "text-amber-400" : "text-zinc-300"
                      }`}
                    >
                      {question.customLabel ?? "Custom / Other"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={isCustomSelected ? currentCustom : customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      onChange("__custom__:" + e.target.value);
                    }}
                    placeholder="Enter custom value..."
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {isCustomSelected && currentCustom && (
                    <button
                      onClick={onNext}
                      className="mt-2 w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm py-2 rounded-lg transition-colors"
                    >
                      Confirm →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Review your answers</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Everything look right? You can edit any answer before submitting.
        </p>
        <div className="space-y-3">
          {visibleQuestions.map((q) => {
            const ans = answers[q.id];
            if (!ans && q.type !== "text") return null;
            return (
              <div
                key={q.id}
                className="flex items-start justify-between gap-4 py-3 border-b border-zinc-800 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 mb-0.5">{q.text}</p>
                  <p className="text-sm text-white font-medium truncate">
                    {formatAnswer(q, ans ?? "")}
                  </p>
                </div>
                <button
                  onClick={() => onEdit(q.id)}
                  className="text-xs text-amber-500 hover:text-amber-400 flex-shrink-0 mt-1"
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
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Quote Request Sent!</h3>
          <p className="text-zinc-400">
            We&apos;ve received your door specifications. Our team will be in touch soon.
          </p>
        </motion.div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? "Sending..." : "Submit Quote Request →"}
        </button>
      )}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ConversationalForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visibleQuestions = getVisibleQuestions(answers);
  const answeredCount = visibleQuestions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== ""
  ).length;
  const progress = visibleQuestions.length > 0
    ? Math.round((answeredCount / visibleQuestions.length) * 100)
    : 0;

  // Scroll to bottom on new question
  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [currentIndex]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = (idx: number) => {
    const nextVisible = getVisibleQuestions({
      ...answers,
    });
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
      <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm">B</div>
            <span className="text-white font-bold text-xl">Beisser Lumber</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-4">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <Summary
          answers={answers}
          visibleQuestions={visibleQuestions}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitted={submitted}
        />
      </div>
    );
  }

  const displayedQuestions = visibleQuestions.slice(0, currentIndex + 1);

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 sticky top-0 z-10 bg-[#0f0f0f] pt-2 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm">
              B
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Beisser Lumber</p>
              <p className="text-zinc-400 text-xs">Door Quote Assistant</p>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {answeredCount}/{visibleQuestions.length} answered
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1">
          <motion.div
            className="bg-amber-500 h-1 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Questions feed */}
      <div className="max-w-2xl mx-auto">
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

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-32" />

        {/* Sticky CTA to go to summary once all answered */}
        {answeredCount > 0 && answeredCount === visibleQuestions.length && !showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              onClick={() => setShowSummary(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-full shadow-xl shadow-amber-500/30 transition-colors"
            >
              Review & Submit →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
