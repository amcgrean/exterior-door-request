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

const initialValues: SlabFormValues = {
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
  full_name: "",
  phone_number: "",
  email: "",
  signature_name: "",
  signed_date: new Date().toISOString().slice(0, 10),
  measurements_acknowledged: false,
};

const sections = [
  "Order & Approval",
  "Door Measurements",
  "Hinge Details",
  "Lock / Bore Prep",
  "Door Swing / Handing",
  "Door Build Details",
  "Glass / Lite Options",
  "Customer Confirmation",
  "Review & Submit",
];

function SectionCard({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl shadow-black/10 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm text-zinc-400">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function PlaceholderImage({ title, alt, callouts }: { title: string; alt: string; callouts?: string[] }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-zinc-600 bg-zinc-950/60 p-5"
      role="img"
      aria-label={alt}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Placeholder image</p>
      <p className="mt-2 text-lg font-medium text-white">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{alt}</p>
      {callouts && (
        <div className="mt-4 flex flex-wrap gap-2">
          {callouts.map((callout) => (
            <span key={callout} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              {callout}
            </span>
          ))}
        </div>
      )}
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  helper?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-white outline-none transition ${error ? "border-red-500" : "border-zinc-700 focus:border-amber-500"}`}
      />
      {helper && <span className="block text-xs text-zinc-500">{helper}</span>}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
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
    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(name, event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
      />
      <span>
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  helper?: string;
}) {
  const parsed = value.trim() ? parseMeasurement(value) : null;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder="Enter inches"
        className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-white outline-none transition ${error ? "border-red-500" : "border-zinc-700 focus:border-amber-500"}`}
      />
      <span className="block text-xs text-zinc-500">{helper ?? MEASUREMENT_EXAMPLES}</span>
      {value.trim() && parsed !== null && (
        <span className="block text-xs text-emerald-400">Normalized inches: {parsed.toFixed(4).replace(/\.?0+$/, "")}</span>
      )}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
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
}: {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (name: string, value: string) => void;
  error?: string;
  columns?: 1 | 2 | 4;
}) {
  const columnClass = columns === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : columns === 1 ? "grid-cols-1" : "sm:grid-cols-2";

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-zinc-100">{label}</legend>
      <div className={`grid grid-cols-1 gap-3 ${columnClass}`}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(name, option.value)}
              className={`rounded-2xl border p-4 text-left transition ${selected ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 h-4 w-4 rounded-full border ${selected ? "border-amber-500 bg-amber-500" : "border-zinc-600"}`} />
                <span>
                  <span className="block text-sm font-medium text-white">{option.label}</span>
                  {option.description && <span className="mt-1 block text-xs text-zinc-400">{option.description}</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </fieldset>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800 py-3 text-sm last:border-b-0">
      <span className="text-zinc-400">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-white">{value || "—"}</span>
    </div>
  );
}

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
      return;
    }

    if (parseMeasurement(raw) === null) {
      errors[name] = "Enter a valid measurement in inches.";
    }
  });

  [
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
  ].forEach((name) => {
    if (!String(values[name] ?? "").trim()) {
      errors[name] = "This field is required.";
    }
  });

  if (values.has_lower_4th_hinge) {
    const raw = String(values.dim_top_to_h4 ?? "").trim();
    if (!raw) {
      errors.dim_top_to_h4 = "Enter the H4 hinge measurement.";
    } else if (parseMeasurement(raw) === null) {
      errors.dim_top_to_h4 = "Enter a valid measurement in inches.";
    }
  }

  if (values.door_width_top_side2_differs) {
    const raw = String(values.width_side2_top ?? "").trim();
    if (!raw) {
      errors.width_side2_top = "Enter the opposite side top width.";
    } else if (parseMeasurement(raw) === null) {
      errors.width_side2_top = "Enter a valid measurement in inches.";
    }
  }

  if (values.door_width_bottom_side2_differs) {
    const raw = String(values.width_side2_bottom ?? "").trim();
    if (!raw) {
      errors.width_side2_bottom = "Enter the opposite side bottom width.";
    } else if (parseMeasurement(raw) === null) {
      errors.width_side2_bottom = "Enter a valid measurement in inches.";
    }
  }

  if (values.bore_hole_count === "2") {
    const raw = String(values.dim_top_to_center_b2 ?? "").trim();
    if (!raw) {
      errors.dim_top_to_center_b2 = "Enter the B2 bore-center measurement.";
    } else if (parseMeasurement(raw) === null) {
      errors.dim_top_to_center_b2 = "Enter a valid measurement in inches.";
    }
  }

  if (values.door_lite_cutout === "yes") {
    if (!String(values.style_of_glass ?? "").trim()) {
      errors.style_of_glass = "Enter the glass style.";
    }
    if (!String(values.size_of_glass ?? "").trim()) {
      errors.size_of_glass = "Enter the glass size.";
    }
  }

  const email = String(values.email ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = String(values.phone_number ?? "").trim();
  if (phone && phone.replace(/\D/g, "").length < 10) {
    errors.phone_number = "Enter a valid phone number.";
  }

  if (!values.measurements_acknowledged) {
    errors.measurements_acknowledged = "You must acknowledge the measurement disclaimer.";
  }

  return errors;
}

export default function SlabOnlySpecForm({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<SlabFormValues>(initialValues);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reviewRows = useMemo(
    () => [
      ["Sales Order #", String(values.sales_order_number || "")],
      ["Approved By", String(values.approved_by || "")],
      ["Top of Door to Top of H1", String(values.dim_top_to_h1 || "")],
      ["Top of Door to Top of H2", String(values.dim_top_to_h2 || "")],
      ["Top of Door to Top of H3", String(values.dim_top_to_h3 || "")],
      ["Top of Door to Top of H4", values.has_lower_4th_hinge ? String(values.dim_top_to_h4 || "") : "Not used"],
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
      ["Top of Door to Center of B1", String(values.dim_top_to_center_b1 || "")],
      ["Top of Door to Center of B2", values.bore_hole_count === "2" ? String(values.dim_top_to_center_b2 || "") : "Not used"],
      ["Door Swing", String(values.door_swing || "")],
      ["Door Type", String(values.door_type || "")],
      ["Door Thickness", String(values.door_thickness || "")],
      ["Door Construction", String(values.door_construction || "")],
      ["Door Species/Model", String(values.door_species_model || "")],
      ["Door Lite Cut-out", String(values.door_lite_cutout || "")],
      ["Style of Glass", values.door_lite_cutout === "yes" ? String(values.style_of_glass || "") : "Not used"],
      ["Size of Glass", values.door_lite_cutout === "yes" ? String(values.size_of_glass || "") : "Not used"],
      ["Full Name", String(values.full_name || "")],
      ["Phone #", String(values.phone_number || "")],
      ["Email", String(values.email || "")],
      ["Signature", String(values.signature_name || "")],
      ["Signed Date", String(values.signed_date || "")],
    ],
    [values]
  );

  const setValue = (name: string, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [name]: value };

      if (name === "has_lower_4th_hinge" && !value) {
        next.dim_top_to_h4 = "";
      }
      if (name === "door_width_top_side2_differs" && !value) {
        next.width_side2_top = "";
      }
      if (name === "door_width_bottom_side2_differs" && !value) {
        next.width_side2_bottom = "";
      }
      if (name === "bore_hole_count" && value === "1") {
        next.dim_top_to_center_b2 = "";
      }
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
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setShowReview(true);
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
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

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitted(true);
    } catch {
      alert("There was an error submitting the slab-only form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/30 bg-zinc-900 p-8 text-center">
        <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Submitted
        </span>
        <h2 className="mt-4 text-3xl font-bold text-white">Slab-only request received.</h2>
        <p className="mt-3 text-zinc-300">
          We&apos;ve captured the full custom door spec workflow and sent it to the team for review.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Slab-only workflow
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white">Custom Door Spec Sheet</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-300">
              Complete the slab-only specification form below. It follows the custom-door workflow, preserves the canonical field IDs, and prepares the submission for future PDF field mapping.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 text-sm font-semibold text-white transition hover:border-zinc-400 hover:bg-zinc-800"
          >
            ← Back to unit type
          </button>
        </div>
        <div className="mt-6 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3 lg:grid-cols-5">
          {sections.map((section) => (
            <div key={section} className={`rounded-xl border px-3 py-2 ${showReview && section === "Review & Submit" ? "border-amber-500 bg-amber-500/10 text-amber-200" : "border-zinc-800 bg-zinc-950/60"}`}>
              {section}
            </div>
          ))}
        </div>
      </div>

      {!showReview ? (
        <div className="grid gap-8">
          <SectionCard title="Order & Approval" description="Capture sales-order context and approval routing.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Sales Order #" name="sales_order_number" value={String(values.sales_order_number)} onChange={setValue} />
              <TextField label="Approved By" name="approved_by" value={String(values.approved_by)} onChange={setValue} />
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{APPROVAL_NOTE}</div>
          </SectionCard>

          <SectionCard title="Door Measurements" description="Measure hinge locations from the top of the door to the top of each hinge. Hinge-location measurements are to the nearest 1/16 inch. Do not include sweep when measuring height of exterior doors.">
            <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
              <PlaceholderImage title="Main Door Measurement Diagram" alt="Placeholder diagram showing door measurement reference points A B C D H1 H2 H3 H4 B1 and B2" callouts={["A", "B", "C", "D", "H1", "H2", "H3", "H4", "B1", "B2"]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <MeasurementInput label="Top of Door to Top of H1" name="dim_top_to_h1" value={String(values.dim_top_to_h1)} onChange={setValue} error={errors.dim_top_to_h1} helper="Nearest 1/16 inch accepted." />
                <MeasurementInput label="Top of Door to Top of H2" name="dim_top_to_h2" value={String(values.dim_top_to_h2)} onChange={setValue} error={errors.dim_top_to_h2} helper="Nearest 1/16 inch accepted." />
                <MeasurementInput label="Top of Door to Top of H3" name="dim_top_to_h3" value={String(values.dim_top_to_h3)} onChange={setValue} error={errors.dim_top_to_h3} helper="Nearest 1/16 inch accepted." />
                <div className="sm:col-span-2">
                  <CheckboxField label="There is a lower 4th hinge" name="has_lower_4th_hinge" checked={Boolean(values.has_lower_4th_hinge)} onChange={setValue} />
                </div>
                {Boolean(values.has_lower_4th_hinge) && (
                  <MeasurementInput label="Top of Door to Top of H4" name="dim_top_to_h4" value={String(values.dim_top_to_h4)} onChange={setValue} error={errors.dim_top_to_h4} helper="Required when a lower 4th hinge is present." />
                )}
                <MeasurementInput label="Width @ Top" name="width_top" value={String(values.width_top)} onChange={setValue} error={errors.width_top} />
                <div className="sm:col-span-2">
                  <CheckboxField label="Opposite side width differs at top" name="door_width_top_side2_differs" checked={Boolean(values.door_width_top_side2_differs)} onChange={setValue} />
                </div>
                {Boolean(values.door_width_top_side2_differs) && (
                  <MeasurementInput label="Width @ Top (Side 2)" name="width_side2_top" value={String(values.width_side2_top)} onChange={setValue} error={errors.width_side2_top} />
                )}
                <MeasurementInput label="Height (Left / Side 1)" name="height_left" value={String(values.height_left)} onChange={setValue} error={errors.height_left} />
                <MeasurementInput label="Height (Right / Side 2)" name="height_right" value={String(values.height_right)} onChange={setValue} error={errors.height_right} />
                <MeasurementInput label="Width @ Bottom" name="width_bottom" value={String(values.width_bottom)} onChange={setValue} error={errors.width_bottom} />
                <div className="sm:col-span-2">
                  <CheckboxField label="Opposite side width differs at bottom" name="door_width_bottom_side2_differs" checked={Boolean(values.door_width_bottom_side2_differs)} onChange={setValue} />
                </div>
                {Boolean(values.door_width_bottom_side2_differs) && (
                  <MeasurementInput label="Width @ Bottom (Side 2)" name="width_side2_bottom" value={String(values.width_side2_bottom)} onChange={setValue} error={errors.width_side2_bottom} />
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Hinge Details" description="Capture hinge height and hinge corner style.">
            <RadioGroup label="How Tall is Each Hinge?" name="hinge_height" value={String(values.hinge_height)} onChange={setValue} error={errors.hinge_height} options={[{ label: '3 1/2 Inches', value: '3_5_in' }, { label: '4 Inches', value: '4_in' }, { label: '4 1/2 Inches', value: '4_5_in' }]} />
            <div className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
              <div className="grid gap-3 sm:grid-cols-3">
                <PlaceholderImage title="Square hinge corner" alt="Placeholder for sharp square hinge corner reference" />
                <PlaceholderImage title="1/4 inch radius hinge corner" alt="Placeholder for 1/4 inch radius hinge corner reference" />
                <PlaceholderImage title="5/8 inch radius hinge corner" alt="Placeholder for 5/8 inch radius hinge corner reference" />
              </div>
              <div className="space-y-4">
                <RadioGroup label="Hinge Corners Type?" name="hinge_corner_type" value={String(values.hinge_corner_type)} onChange={setValue} error={errors.hinge_corner_type} options={[{ label: '5/8" Radius', value: 'radius_5_8' }, { label: 'Sharp Square', value: 'square' }, { label: '1/4" Radius', value: 'radius_1_4' }]} />
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-300">
                  <p>A Dime matches up to 1/4&quot;</p>
                  <p className="mt-1">A Quarter matches up to 5/8&quot;</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lock / Bore Prep" description="Capture bore-hole count, backset, latch type, and bore-center measurements.">
            <RadioGroup label="Does your door have 1 or 2 bore holes for lockset?" name="bore_hole_count" value={String(values.bore_hole_count)} onChange={setValue} error={errors.bore_hole_count} options={[{ label: '1 bore hole', value: '1' }, { label: '2 bore holes', value: '2' }]} />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <PlaceholderImage title="Backset diagram" alt="Placeholder diagram for latch backset reference" />
                <RadioGroup label="Size of Latch Backset" name="backset_size" value={String(values.backset_size)} onChange={setValue} error={errors.backset_size} options={[{ label: '2-3/8', value: '2-3/8', description: 'See diagram →' }, { label: '2-3/4', value: '2-3/4', description: 'See diagram →' }]} />
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <PlaceholderImage title="Drive-in latch" alt="Placeholder image for drive-in latch type" />
                  <PlaceholderImage title="Mortise latch" alt="Placeholder image for mortise latch type" />
                </div>
                <RadioGroup label="Latch Type" name="latch_type" value={String(values.latch_type)} onChange={setValue} error={errors.latch_type} options={[{ label: 'Drive In', value: 'drive_in', description: 'See diagram →' }, { label: 'Mortise', value: 'mortise', description: 'See diagram →' }]} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MeasurementInput label="Top of Door to Center of B1" name="dim_top_to_center_b1" value={String(values.dim_top_to_center_b1)} onChange={setValue} error={errors.dim_top_to_center_b1} helper="Measure from the top edge of the door to the center of the bore hole or lockset mechanism." />
              {values.bore_hole_count === "2" && (
                <MeasurementInput label="Top of Door to Center of B2" name="dim_top_to_center_b2" value={String(values.dim_top_to_center_b2)} onChange={setValue} error={errors.dim_top_to_center_b2} helper="If there is a 2nd Bore:" />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Door Swing / Handing" description="Select the handing that matches the jobsite door swing.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['rh_inswing', 'Right Hand (RH) Inswing'],
                ['lh_inswing', 'Left Hand (LH) Inswing'],
                ['lh_outswing', 'Left Hand (LH) Outswing'],
                ['rh_outswing', 'Right Hand (RH) Outswing'],
              ].map(([value, label]) => {
                const selected = values.door_swing === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('door_swing', value)}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}
                  >
                    <PlaceholderImage title={label} alt={`Placeholder image for ${label}`} />
                    <p className="mt-3 text-sm font-medium text-white">{label}</p>
                  </button>
                );
              })}
            </div>
            {errors.door_swing && <span className="block text-xs text-red-400">{errors.door_swing}</span>}
          </SectionCard>

          <SectionCard title="Door Build Details" description="Capture the basic build characteristics of the slab-only door.">
            <RadioGroup label="Door Type" name="door_type" value={String(values.door_type)} onChange={setValue} error={errors.door_type} options={[{ label: 'Interior', value: 'interior' }, { label: 'Exterior', value: 'exterior' }]} />
            <RadioGroup label="Door Thickness" name="door_thickness" value={String(values.door_thickness)} onChange={setValue} error={errors.door_thickness} options={[{ label: '1 - 3/8"', value: '1-3/8' }, { label: '1 - 3/4"', value: '1-3/4' }]} />
            <RadioGroup label="Door Construction" name="door_construction" value={String(values.door_construction)} onChange={setValue} error={errors.door_construction} options={[{ label: 'Hollow Core', value: 'hollow_core' }, { label: 'Solid Core', value: 'solid_core' }]} />
            <TextField label="Door Species/Model" name="door_species_model" value={String(values.door_species_model)} onChange={setValue} error={errors.door_species_model} helper="Steel, Molded, Fiberglass, Wood etc." />
          </SectionCard>

          <SectionCard title="Glass / Lite Options" description="Capture lite cut-out details only when the door includes glass.">
            <RadioGroup label="Door Lite Cut-out" name="door_lite_cutout" value={String(values.door_lite_cutout)} onChange={setValue} error={errors.door_lite_cutout} options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]} />
            {values.door_lite_cutout === 'yes' && (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Style of Glass" name="style_of_glass" value={String(values.style_of_glass)} onChange={setValue} error={errors.style_of_glass} helper="Frosted, Rainglass, Blinds, etc." />
                <TextField label="Size of Glass" name="size_of_glass" value={String(values.size_of_glass)} onChange={setValue} error={errors.size_of_glass} helper="Width x Height" />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Customer Confirmation" description="Capture contact information, signature, date, and disclaimer acknowledgment.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Full Name" name="full_name" value={String(values.full_name)} onChange={setValue} error={errors.full_name} helper="please print" />
              <TextField label="Phone #" name="phone_number" value={String(values.phone_number)} onChange={setValue} error={errors.phone_number} type="tel" />
              <TextField label="Email" name="email" value={String(values.email)} onChange={setValue} error={errors.email} type="email" />
              <TextField label="Signature" name="signature_name" value={String(values.signature_name)} onChange={setValue} error={errors.signature_name} helper="Typed name is acceptable in v1." />
              <TextField label="Date" name="signed_date" value={String(values.signed_date)} onChange={setValue} error={errors.signed_date} type="date" />
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-zinc-100">{DISCLAIMER_TEXT}</div>
            <CheckboxField label="I acknowledge the measurement disclaimer" name="measurements_acknowledged" checked={Boolean(values.measurements_acknowledged)} onChange={setValue} error={errors.measurements_acknowledged} />
          </SectionCard>

          <div className="flex justify-end">
            <button type="button" onClick={handleReview} className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400">
              Review & Submit →
            </button>
          </div>
        </div>
      ) : (
        <SectionCard title="Review & Submit" description="Review all entered values before sending the slab-only request to the server.">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              {reviewRows.map(([label, value]) => (
                <ReviewRow key={label} label={label} value={value} />
              ))}
            </div>
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <h3 className="text-lg font-semibold text-white">Ready to submit?</h3>
              <p className="text-sm text-zinc-400">
                The server will validate the payload again, preserve the raw measurement text, and prepare a flat PDF field map using the canonical IDs.
              </p>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? 'Submitting…' : 'Submit slab-only request'}
              </button>
              <button type="button" onClick={() => setShowReview(false)} className="w-full rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-900">
                Back to form
              </button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
