"use client";

import { PropsWithChildren, useMemo, useState } from "react";
import {
  APPROVAL_NOTE,
  DISCLAIMER_TEXT,
  MEASUREMENT_EXAMPLES,
  buildSlabPayload,
  parseMeasurement,
} from "@/lib/slabOnly";

type SlabFormValues = Record<string, string | boolean>;
type ErrorMap = Record<string, string>;

type Option = {
  label: string;
  value: string;
  description?: string;
};

type InitialCustomerInfo = {
  full_name?: string;
  phone_number?: string;
};

const makeInitialValues = (init?: InitialCustomerInfo): SlabFormValues => ({
  sales_order_number: "",
  approved_by: "",
  dim_top_to_h1: "",
  dim_top_to_h2: "",
  dim_top_to_h3: "",
  has_lower_4th_hinge: false,
  dim_top_to_h4: "",
  width_top: "",
  door_width_top_side2_differs: false,
  width_side2_top: "",
  height_left: "",
  height_right: "",
  width_bottom: "",
  door_width_bottom_side2_differs: false,
  width_side2_bottom: "",
  hinge_height: "",
  hinge_corner_type: "",
  bore_hole_count: "",
  backset_size: "",
  latch_type: "",
  dim_top_to_center_b1: "",
  dim_top_to_center_b2: "",
  door_swing: "",
  door_type: "",
  door_thickness: "",
  door_construction: "",
  door_species_model: "",
  door_lite_cutout: "",
  style_of_glass: "",
  size_of_glass: "",
  full_name: init?.full_name ?? "",
  phone_number: init?.phone_number ?? "",
  email: "",
  signature_name: "",
  signed_date: new Date().toISOString().slice(0, 10),
  measurements_acknowledged: false,
});

const sectionNames = [
  "Order & Approval",
  "Door Measurements",
  "Hinge Details",
  "Lock / Bore Prep",
  "Door Swing",
  "Build Details",
  "Glass / Lite",
  "Confirmation",
  "Review",
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

function InfoBox({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      {children}
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  helper,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  helper?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full rounded-xl border-2 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
        }`}
      />
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function CheckboxField({
  label,
  name,
  checked,
  onChange,
  error,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (name: string, value: boolean) => void;
  error?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(name, e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 accent-amber-500"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
      </span>
    </label>
  );
}

function MeasurementInput({
  label,
  name,
  value,
  onChange,
  error,
  helper,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
}) {
  const parsed = value.trim() ? parseMeasurement(value) : null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder='e.g. 80, 80 1/4, 2-3/8'
        className={`w-full rounded-xl border-2 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
        }`}
      />
      <p className="text-xs text-slate-500">{helper ?? MEASUREMENT_EXAMPLES}</p>
      {value.trim() && parsed !== null && (
        <p className="text-xs font-medium text-emerald-600">
          ✓ Parsed: {parsed.toFixed(4).replace(/\.?0+$/, "")} inches
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function RadioGroup({
  label,
  name,
  value,
  options,
  onChange,
  error,
  columns = 2,
  required,
}: {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (name: string, value: string) => void;
  error?: string;
  columns?: 1 | 2 | 3 | 4;
  required?: boolean;
}) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-3"
        : columns === 1
          ? "grid-cols-1"
          : "sm:grid-cols-2";

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </legend>
      <div className={`grid grid-cols-1 gap-2.5 ${colClass}`}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(name, opt.value)}
              className={`rounded-xl border-2 p-3.5 text-left transition-all ${
                selected
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-amber-500 bg-amber-500" : "border-slate-300"
                  }`}
                >
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span>
                  <span className={`block text-sm font-semibold ${selected ? "text-amber-800" : "text-slate-800"}`}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className={`mt-0.5 block text-xs ${selected ? "text-amber-600" : "text-slate-500"}`}>
                      {opt.description}
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </fieldset>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[55%] text-right font-semibold text-slate-900">{value || "—"}</span>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: SlabFormValues): ErrorMap {
  const errors: ErrorMap = {};
  const requiredMeasurements = [
    "dim_top_to_h1",
    "dim_top_to_h2",
    "dim_top_to_h3",
    "width_top",
    "height_left",
    "height_right",
    "width_bottom",
    "dim_top_to_center_b1",
  ];

  requiredMeasurements.forEach((name) => {
    const raw = String(values[name] ?? "").trim();
    if (!raw) {
      errors[name] = "This measurement is required.";
    } else if (parseMeasurement(raw) === null) {
      errors[name] = "Enter a valid measurement (e.g. 80, 80 1/4, 2-3/8).";
    }
  });

  const requiredFields = [
    "hinge_height",
    "hinge_corner_type",
    "bore_hole_count",
    "backset_size",
    "latch_type",
    "door_swing",
    "door_type",
    "door_thickness",
    "door_construction",
    "door_species_model",
    "door_lite_cutout",
    "full_name",
    "phone_number",
    "email",
    "signature_name",
    "signed_date",
  ];

  requiredFields.forEach((name) => {
    if (!String(values[name] ?? "").trim()) {
      errors[name] = "This field is required.";
    }
  });

  if (values.has_lower_4th_hinge) {
    const raw = String(values.dim_top_to_h4 ?? "").trim();
    if (!raw) {
      errors.dim_top_to_h4 = "Enter the H4 hinge measurement.";
    } else if (parseMeasurement(raw) === null) {
      errors.dim_top_to_h4 = "Enter a valid measurement.";
    }
  }

  if (values.door_width_top_side2_differs) {
    const raw = String(values.width_side2_top ?? "").trim();
    if (!raw) errors.width_side2_top = "Enter the opposite-side top width.";
    else if (parseMeasurement(raw) === null) errors.width_side2_top = "Enter a valid measurement.";
  }

  if (values.door_width_bottom_side2_differs) {
    const raw = String(values.width_side2_bottom ?? "").trim();
    if (!raw) errors.width_side2_bottom = "Enter the opposite-side bottom width.";
    else if (parseMeasurement(raw) === null) errors.width_side2_bottom = "Enter a valid measurement.";
  }

  if (values.bore_hole_count === "2") {
    const raw = String(values.dim_top_to_center_b2 ?? "").trim();
    if (!raw) errors.dim_top_to_center_b2 = "Enter the B2 bore-center measurement.";
    else if (parseMeasurement(raw) === null) errors.dim_top_to_center_b2 = "Enter a valid measurement.";
  }

  if (values.door_lite_cutout === "yes") {
    if (!String(values.style_of_glass ?? "").trim()) errors.style_of_glass = "Enter the glass style.";
    if (!String(values.size_of_glass ?? "").trim()) errors.size_of_glass = "Enter the glass size.";
  }

  const email = String(values.email ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = String(values.phone_number ?? "").trim();
  if (phone && phone.replace(/\D/g, "").length < 10) {
    errors.phone_number = "Enter a valid 10-digit phone number.";
  }

  if (!values.measurements_acknowledged) {
    errors.measurements_acknowledged = "You must acknowledge the measurement disclaimer.";
  }

  return errors;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlabOnlySpecForm({
  onBack,
  initialCustomerInfo,
}: {
  onBack: () => void;
  initialCustomerInfo?: InitialCustomerInfo;
}) {
  const [values, setValues] = useState<SlabFormValues>(() => makeInitialValues(initialCustomerInfo));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reviewRows = useMemo(
    () => [
      ["Sales Order #", String(values.sales_order_number || "")],
      ["Approved By", String(values.approved_by || "")],
      ["Top → H1", String(values.dim_top_to_h1 || "")],
      ["Top → H2", String(values.dim_top_to_h2 || "")],
      ["Top → H3", String(values.dim_top_to_h3 || "")],
      ["Top → H4", values.has_lower_4th_hinge ? String(values.dim_top_to_h4 || "") : "Not used"],
      ["Width @ Top", String(values.width_top || "")],
      ["Width @ Top (Side 2)", values.door_width_top_side2_differs ? String(values.width_side2_top || "") : "Same as primary"],
      ["Height Left", String(values.height_left || "")],
      ["Height Right", String(values.height_right || "")],
      ["Width @ Bottom", String(values.width_bottom || "")],
      ["Width @ Bottom (Side 2)", values.door_width_bottom_side2_differs ? String(values.width_side2_bottom || "") : "Same as primary"],
      ["Hinge Height", String(values.hinge_height || "")],
      ["Hinge Corner Type", String(values.hinge_corner_type || "")],
      ["Bore Hole Count", String(values.bore_hole_count || "")],
      ["Backset Size", String(values.backset_size || "")],
      ["Latch Type", String(values.latch_type || "")],
      ["Top → B1 Center", String(values.dim_top_to_center_b1 || "")],
      ["Top → B2 Center", values.bore_hole_count === "2" ? String(values.dim_top_to_center_b2 || "") : "Not used"],
      ["Door Swing", String(values.door_swing || "")],
      ["Door Type", String(values.door_type || "")],
      ["Door Thickness", String(values.door_thickness || "")],
      ["Door Construction", String(values.door_construction || "")],
      ["Door Species / Model", String(values.door_species_model || "")],
      ["Glass Lite Cut-out", String(values.door_lite_cutout || "")],
      ["Style of Glass", values.door_lite_cutout === "yes" ? String(values.style_of_glass || "") : "Not used"],
      ["Size of Glass", values.door_lite_cutout === "yes" ? String(values.size_of_glass || "") : "Not used"],
      ["Full Name", String(values.full_name || "")],
      ["Phone", String(values.phone_number || "")],
      ["Email", String(values.email || "")],
      ["Signature", String(values.signature_name || "")],
      ["Date", String(values.signed_date || "")],
    ],
    [values],
  );

  const setValue = (name: string, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "has_lower_4th_hinge" && !value) next.dim_top_to_h4 = "";
      if (name === "door_width_top_side2_differs" && !value) next.width_side2_top = "";
      if (name === "door_width_bottom_side2_differs" && !value) next.width_side2_bottom = "";
      if (name === "bore_hole_count" && value === "1") next.dim_top_to_center_b2 = "";
      if (name === "door_lite_cutout" && value === "no") {
        next.style_of_glass = "";
        next.size_of_glass = "";
      }
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleReview = () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async () => {
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setShowReview(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildSlabPayload(values);
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionType: "slab_only", payload }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      alert("There was an error submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Slab Request Received</h2>
        <p className="text-slate-600">
          We&apos;ve captured the full custom door spec and sent it to the team for review.
        </p>
      </div>
    );
  }

  // ─── Review mode ────────────────────────────────────────────────────────────
  if (showReview) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Review Slab Spec</h2>
              <p className="mt-1 text-sm text-slate-500">Confirm all values before submitting.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              ← Edit Form
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {reviewRows.map(([label, value]) => (
              <ReviewRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting…" : "Submit Slab-Only Request →"}
        </button>
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────────────────────
  const errorCount = Object.keys(errors).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              Slab-Only Workflow
            </span>
            <h1 className="mt-2 text-xl font-bold text-slate-900">Custom Door Spec Sheet</h1>
            <p className="mt-1 text-sm text-slate-600">
              Fill in all measurements and specs below, then review before submitting.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="self-start rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:self-center"
          >
            ← Change Door Type
          </button>
        </div>

        {/* Section pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {sectionNames.map((s) => (
            <span key={s} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-700">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Validation error banner */}
      {errorCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          Please fix {errorCount} error{errorCount !== 1 ? "s" : ""} before continuing.
        </div>
      )}

      {/* ── Section 1: Order & Approval ─────────────────────────────────────── */}
      <SectionCard title="Order & Approval" description="Sales-order context and approval routing.">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {APPROVAL_NOTE}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Sales Order #" name="sales_order_number" value={String(values.sales_order_number)} onChange={setValue} />
          <TextField label="Approved By" name="approved_by" value={String(values.approved_by)} onChange={setValue} />
        </div>
      </SectionCard>

      {/* ── Section 2: Door Measurements ────────────────────────────────────── */}
      <SectionCard
        title="Door Measurements"
        description="Measure hinge locations from the top of the door to the top of each hinge, to the nearest 1/16 inch. Do not include sweep when measuring exterior door height."
      >
        {/* Measurement reference */}
        <InfoBox>
          <p className="mb-2 font-semibold text-slate-700">Measurement Reference</p>
          <ul className="space-y-1 text-xs">
            <li><strong>H1, H2, H3 (H4)</strong> — Top of door to top of each hinge</li>
            <li><strong>Width @ Top / Bottom</strong> — Door width measured at those locations</li>
            <li><strong>Height Left / Right</strong> — Full height on each side (no sweep)</li>
            <li><strong>B1, B2</strong> — Top of door to center of bore hole(s)</li>
          </ul>
        </InfoBox>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="dim_top_to_h1">
            <MeasurementInput required label="Top → Top of H1" name="dim_top_to_h1" value={String(values.dim_top_to_h1)} onChange={setValue} error={errors.dim_top_to_h1} helper="Nearest 1/16 inch." />
          </div>
          <div data-field="dim_top_to_h2">
            <MeasurementInput required label="Top → Top of H2" name="dim_top_to_h2" value={String(values.dim_top_to_h2)} onChange={setValue} error={errors.dim_top_to_h2} helper="Nearest 1/16 inch." />
          </div>
          <div data-field="dim_top_to_h3">
            <MeasurementInput required label="Top → Top of H3" name="dim_top_to_h3" value={String(values.dim_top_to_h3)} onChange={setValue} error={errors.dim_top_to_h3} helper="Nearest 1/16 inch." />
          </div>
        </div>

        <CheckboxField label="There is a lower 4th hinge" name="has_lower_4th_hinge" checked={Boolean(values.has_lower_4th_hinge)} onChange={setValue} />
        {Boolean(values.has_lower_4th_hinge) && (
          <div data-field="dim_top_to_h4">
            <MeasurementInput required label="Top → Top of H4" name="dim_top_to_h4" value={String(values.dim_top_to_h4)} onChange={setValue} error={errors.dim_top_to_h4} helper="Required when a 4th hinge is present." />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="width_top">
            <MeasurementInput required label="Width @ Top" name="width_top" value={String(values.width_top)} onChange={setValue} error={errors.width_top} />
          </div>
        </div>

        <CheckboxField label="Opposite side width differs at top" name="door_width_top_side2_differs" checked={Boolean(values.door_width_top_side2_differs)} onChange={setValue} />
        {Boolean(values.door_width_top_side2_differs) && (
          <div data-field="width_side2_top">
            <MeasurementInput required label="Width @ Top (Side 2)" name="width_side2_top" value={String(values.width_side2_top)} onChange={setValue} error={errors.width_side2_top} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="height_left">
            <MeasurementInput required label="Height (Left / Side 1)" name="height_left" value={String(values.height_left)} onChange={setValue} error={errors.height_left} />
          </div>
          <div data-field="height_right">
            <MeasurementInput required label="Height (Right / Side 2)" name="height_right" value={String(values.height_right)} onChange={setValue} error={errors.height_right} />
          </div>
          <div data-field="width_bottom">
            <MeasurementInput required label="Width @ Bottom" name="width_bottom" value={String(values.width_bottom)} onChange={setValue} error={errors.width_bottom} />
          </div>
        </div>

        <CheckboxField label="Opposite side width differs at bottom" name="door_width_bottom_side2_differs" checked={Boolean(values.door_width_bottom_side2_differs)} onChange={setValue} />
        {Boolean(values.door_width_bottom_side2_differs) && (
          <div data-field="width_side2_bottom">
            <MeasurementInput required label="Width @ Bottom (Side 2)" name="width_side2_bottom" value={String(values.width_side2_bottom)} onChange={setValue} error={errors.width_side2_bottom} />
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Hinge Details ─────────────────────────────────────────── */}
      <SectionCard title="Hinge Details" description="Select hinge height and corner radius style.">
        <div data-field="hinge_height">
          <RadioGroup
            required
            label="Hinge Height"
            name="hinge_height"
            value={String(values.hinge_height)}
            onChange={setValue}
            error={errors.hinge_height}
            columns={3}
            options={[
              { label: '3½"', value: "3_5_in" },
              { label: '4"', value: "4_in" },
              { label: '4½"', value: "4_5_in" },
            ]}
          />
        </div>
        <div data-field="hinge_corner_type">
          <RadioGroup
            required
            label="Hinge Corner Type"
            name="hinge_corner_type"
            value={String(values.hinge_corner_type)}
            onChange={setValue}
            error={errors.hinge_corner_type}
            columns={3}
            options={[
              { label: 'Sharp Square', value: "square" },
              { label: '¼" Radius', value: "radius_1_4", description: "Matches a dime" },
              { label: '5⁄8" Radius', value: "radius_5_8", description: "Matches a quarter" },
            ]}
          />
        </div>
      </SectionCard>

      {/* ── Section 4: Lock / Bore Prep ──────────────────────────────────────── */}
      <SectionCard title="Lock / Bore Prep" description="Bore-hole count, backset, latch type, and bore-center measurements.">
        <div data-field="bore_hole_count">
          <RadioGroup
            required
            label="Number of Bore Holes"
            name="bore_hole_count"
            value={String(values.bore_hole_count)}
            onChange={setValue}
            error={errors.bore_hole_count}
            options={[
              { label: "1 Bore Hole", value: "1", description: "Knob or lever only" },
              { label: "2 Bore Holes", value: "2", description: "Knob + deadbolt" },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="backset_size">
            <RadioGroup
              required
              label="Latch Backset"
              name="backset_size"
              value={String(values.backset_size)}
              onChange={setValue}
              error={errors.backset_size}
              options={[
                { label: '2-3/8"', value: "2-3/8" },
                { label: '2-3/4"', value: "2-3/4" },
              ]}
            />
          </div>
          <div data-field="latch_type">
            <RadioGroup
              required
              label="Latch Type"
              name="latch_type"
              value={String(values.latch_type)}
              onChange={setValue}
              error={errors.latch_type}
              options={[
                { label: "Drive-In", value: "drive_in" },
                { label: "Mortise", value: "mortise" },
              ]}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="dim_top_to_center_b1">
            <MeasurementInput required label="Top → Center of B1" name="dim_top_to_center_b1" value={String(values.dim_top_to_center_b1)} onChange={setValue} error={errors.dim_top_to_center_b1} helper="Top of door to center of lockset bore." />
          </div>
          {values.bore_hole_count === "2" && (
            <div data-field="dim_top_to_center_b2">
              <MeasurementInput required label="Top → Center of B2" name="dim_top_to_center_b2" value={String(values.dim_top_to_center_b2)} onChange={setValue} error={errors.dim_top_to_center_b2} helper="Top of door to center of deadbolt bore." />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Section 5: Door Swing ────────────────────────────────────────────── */}
      <SectionCard title="Door Swing / Handing" description="Select the handing as viewed from outside the building.">
        <InfoBox>
          <p className="text-xs">
            <strong>How to determine handing:</strong> Stand outside the building facing the door.
            If the hinges are on your right → Right Hand. If on your left → Left Hand.
          </p>
        </InfoBox>
        <div data-field="door_swing">
          <RadioGroup
            required
            label="Door Swing"
            name="door_swing"
            value={String(values.door_swing)}
            onChange={setValue}
            error={errors.door_swing}
            columns={2}
            options={[
              { label: "Right Hand Inswing", value: "rh_inswing", description: "Hinges right, opens in" },
              { label: "Left Hand Inswing", value: "lh_inswing", description: "Hinges left, opens in" },
              { label: "Right Hand Outswing", value: "rh_outswing", description: "Hinges right, opens out" },
              { label: "Left Hand Outswing", value: "lh_outswing", description: "Hinges left, opens out" },
            ]}
          />
        </div>
      </SectionCard>

      {/* ── Section 6: Door Build Details ───────────────────────────────────── */}
      <SectionCard title="Door Build Details" description="Basic construction characteristics of the slab.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div data-field="door_type">
            <RadioGroup
              required
              label="Door Type"
              name="door_type"
              value={String(values.door_type)}
              onChange={setValue}
              error={errors.door_type}
              options={[
                { label: "Interior", value: "interior" },
                { label: "Exterior", value: "exterior" },
              ]}
            />
          </div>
          <div data-field="door_thickness">
            <RadioGroup
              required
              label="Door Thickness"
              name="door_thickness"
              value={String(values.door_thickness)}
              onChange={setValue}
              error={errors.door_thickness}
              options={[
                { label: '1-3/8"', value: "1-3/8" },
                { label: '1-3/4"', value: "1-3/4" },
              ]}
            />
          </div>
          <div data-field="door_construction">
            <RadioGroup
              required
              label="Door Construction"
              name="door_construction"
              value={String(values.door_construction)}
              onChange={setValue}
              error={errors.door_construction}
              options={[
                { label: "Hollow Core", value: "hollow_core" },
                { label: "Solid Core", value: "solid_core" },
              ]}
            />
          </div>
        </div>
        <div data-field="door_species_model">
          <TextField
            required
            label="Door Species / Model"
            name="door_species_model"
            value={String(values.door_species_model)}
            onChange={setValue}
            error={errors.door_species_model}
            helper="e.g. Steel, Molded, Fiberglass, Pine, Oak"
          />
        </div>
      </SectionCard>

      {/* ── Section 7: Glass / Lite Options ─────────────────────────────────── */}
      <SectionCard title="Glass / Lite Options" description="Only complete this section if the door includes a glass lite cut-out.">
        <div data-field="door_lite_cutout">
          <RadioGroup
            required
            label="Does this door have a glass lite cut-out?"
            name="door_lite_cutout"
            value={String(values.door_lite_cutout)}
            onChange={setValue}
            error={errors.door_lite_cutout}
            options={[
              { label: "Yes — Has glass", value: "yes" },
              { label: "No — Solid door", value: "no" },
            ]}
          />
        </div>
        {values.door_lite_cutout === "yes" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div data-field="style_of_glass">
              <TextField
                required
                label="Style of Glass"
                name="style_of_glass"
                value={String(values.style_of_glass)}
                onChange={setValue}
                error={errors.style_of_glass}
                helper="e.g. Frosted, Rainglass, Blinds, Clear"
              />
            </div>
            <div data-field="size_of_glass">
              <TextField
                required
                label="Size of Glass"
                name="size_of_glass"
                value={String(values.size_of_glass)}
                onChange={setValue}
                error={errors.size_of_glass}
                helper="Width × Height (inches)"
              />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Section 8: Customer Confirmation ────────────────────────────────── */}
      <SectionCard title="Customer Confirmation" description="Contact info, signature, and measurement disclaimer.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="full_name">
            <TextField required label="Full Name" name="full_name" value={String(values.full_name)} onChange={setValue} error={errors.full_name} helper="Please print" />
          </div>
          <div data-field="phone_number">
            <TextField required label="Phone Number" name="phone_number" value={String(values.phone_number)} onChange={setValue} error={errors.phone_number} type="tel" />
          </div>
          <div data-field="email">
            <TextField required label="Email Address" name="email" value={String(values.email)} onChange={setValue} error={errors.email} type="email" />
          </div>
          <div data-field="signed_date">
            <TextField required label="Date" name="signed_date" value={String(values.signed_date)} onChange={setValue} error={errors.signed_date} type="date" />
          </div>
          <div className="sm:col-span-2" data-field="signature_name">
            <TextField required label="Signature (typed name)" name="signature_name" value={String(values.signature_name)} onChange={setValue} error={errors.signature_name} helper="Typing your full name serves as your signature." />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {DISCLAIMER_TEXT}
        </div>
        <div data-field="measurements_acknowledged">
          <CheckboxField
            label="I acknowledge the measurement disclaimer above"
            name="measurements_acknowledged"
            checked={Boolean(values.measurements_acknowledged)}
            onChange={setValue}
            error={errors.measurements_acknowledged}
          />
        </div>
      </SectionCard>

      {/* ── Submit row ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end pb-10">
        <button
          type="button"
          onClick={handleReview}
          className="rounded-xl bg-amber-500 px-8 py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          Review &amp; Submit →
        </button>
      </div>
    </div>
  );
}
