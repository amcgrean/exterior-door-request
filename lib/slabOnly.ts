export type MeasurementValue = {
  raw: string;
  inches: number | null;
};

export type SlabOnlyPayload = {
  form_version: string;
  template_id: string;
  submission_id: string;
  submitted_at: string;
  order: {
    sales_order_number: string;
    approved_by: string;
  };
  measurements: {
    dim_top_to_h1: MeasurementValue;
    dim_top_to_h2: MeasurementValue;
    dim_top_to_h3: MeasurementValue;
    has_lower_4th_hinge: boolean;
    dim_top_to_h4: MeasurementValue;
    width_top: MeasurementValue;
    door_width_top_side2_differs: boolean;
    width_side2_top: MeasurementValue;
    height_left: MeasurementValue;
    height_right: MeasurementValue;
    width_bottom: MeasurementValue;
    door_width_bottom_side2_differs: boolean;
    width_side2_bottom: MeasurementValue;
  };
  hinges: {
    hinge_height: string;
    hinge_corner_type: string;
  };
  lock_prep: {
    bore_hole_count: string;
    backset_size: string;
    latch_type: string;
    dim_top_to_center_b1: MeasurementValue;
    dim_top_to_center_b2: MeasurementValue;
  };
  door: {
    door_swing: string;
    door_type: string;
    door_thickness: string;
    door_construction: string;
    door_species_model: string;
    door_lite_cutout: string;
    style_of_glass: string;
    size_of_glass: string;
  };
  customer: {
    full_name: string;
    phone_number: string;
    email: string;
    signature_name: string;
    signed_date: string;
  };
  acknowledgments: {
    measurements_acknowledged: boolean;
  };
};

export const APPROVAL_NOTE =
  "NOTE: ALL ORDERS TO BE APPROVED BY PETE ROSS, ROB WALKER OR ANDY JOHNSON";

export const DISCLAIMER_TEXT =
  "I understand that these measurements are used to build a custom slab-only door order. I have verified the door measurements, hinge locations, lock preparation, and handing information, and I acknowledge that incorrect measurements may affect fit and product configuration.";

export const MEASUREMENT_EXAMPLES = 'Examples: 80, 80.25, 80 1/4, 2-3/8, 2 3/8, 1/16';

export function parseMeasurement(raw: string): number | null {
  const value = raw.trim();

  if (!value) {
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  const normalized = value.replace(/\s+/g, " ");
  const mixedMatch = normalized.match(/^(\d+)\s*(?:-| )\s*(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);

    if (!denominator) {
      return null;
    }

    return whole + numerator / denominator;
  }

  const fractionMatch = normalized.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);

    if (!denominator) {
      return null;
    }

    return numerator / denominator;
  }

  return null;
}

export function createMeasurementValue(raw: string): MeasurementValue {
  return {
    raw,
    inches: parseMeasurement(raw),
  };
}

export function buildSlabPayload(values: Record<string, string | boolean>): SlabOnlyPayload {
  const now = new Date();

  return {
    form_version: "1.0.0",
    template_id: "custom-door-spec-sheet",
    submission_id: crypto.randomUUID(),
    submitted_at: now.toISOString(),
    order: {
      sales_order_number: String(values.sales_order_number ?? ""),
      approved_by: String(values.approved_by ?? ""),
    },
    measurements: {
      dim_top_to_h1: createMeasurementValue(String(values.dim_top_to_h1 ?? "")),
      dim_top_to_h2: createMeasurementValue(String(values.dim_top_to_h2 ?? "")),
      dim_top_to_h3: createMeasurementValue(String(values.dim_top_to_h3 ?? "")),
      has_lower_4th_hinge: Boolean(values.has_lower_4th_hinge),
      dim_top_to_h4: createMeasurementValue(String(values.dim_top_to_h4 ?? "")),
      width_top: createMeasurementValue(String(values.width_top ?? "")),
      door_width_top_side2_differs: Boolean(values.door_width_top_side2_differs),
      width_side2_top: createMeasurementValue(String(values.width_side2_top ?? "")),
      height_left: createMeasurementValue(String(values.height_left ?? "")),
      height_right: createMeasurementValue(String(values.height_right ?? "")),
      width_bottom: createMeasurementValue(String(values.width_bottom ?? "")),
      door_width_bottom_side2_differs: Boolean(values.door_width_bottom_side2_differs),
      width_side2_bottom: createMeasurementValue(String(values.width_side2_bottom ?? "")),
    },
    hinges: {
      hinge_height: String(values.hinge_height ?? ""),
      hinge_corner_type: String(values.hinge_corner_type ?? ""),
    },
    lock_prep: {
      bore_hole_count: String(values.bore_hole_count ?? ""),
      backset_size: String(values.backset_size ?? ""),
      latch_type: String(values.latch_type ?? ""),
      dim_top_to_center_b1: createMeasurementValue(String(values.dim_top_to_center_b1 ?? "")),
      dim_top_to_center_b2: createMeasurementValue(String(values.dim_top_to_center_b2 ?? "")),
    },
    door: {
      door_swing: String(values.door_swing ?? ""),
      door_type: String(values.door_type ?? ""),
      door_thickness: String(values.door_thickness ?? ""),
      door_construction: String(values.door_construction ?? ""),
      door_species_model: String(values.door_species_model ?? ""),
      door_lite_cutout: String(values.door_lite_cutout ?? ""),
      style_of_glass: String(values.style_of_glass ?? ""),
      size_of_glass: String(values.size_of_glass ?? ""),
    },
    customer: {
      full_name: String(values.full_name ?? ""),
      phone_number: String(values.phone_number ?? ""),
      email: String(values.email ?? ""),
      signature_name: String(values.signature_name ?? ""),
      signed_date: String(values.signed_date ?? ""),
    },
    acknowledgments: {
      measurements_acknowledged: Boolean(values.measurements_acknowledged),
    },
  };
}

export function flattenSlabPayload(payload: SlabOnlyPayload): Record<string, string> {
  return {
    sales_order_number: payload.order.sales_order_number,
    approved_by: payload.order.approved_by,
    dim_top_to_h1: payload.measurements.dim_top_to_h1.raw,
    dim_top_to_h2: payload.measurements.dim_top_to_h2.raw,
    dim_top_to_h3: payload.measurements.dim_top_to_h3.raw,
    has_lower_4th_hinge: payload.measurements.has_lower_4th_hinge ? "Yes" : "Off",
    dim_top_to_h4: payload.measurements.dim_top_to_h4.raw,
    width_top: payload.measurements.width_top.raw,
    door_width_top_side2_differs: payload.measurements.door_width_top_side2_differs ? "Yes" : "Off",
    width_side2_top: payload.measurements.width_side2_top.raw,
    height_left: payload.measurements.height_left.raw,
    height_right: payload.measurements.height_right.raw,
    width_bottom: payload.measurements.width_bottom.raw,
    door_width_bottom_side2_differs: payload.measurements.door_width_bottom_side2_differs ? "Yes" : "Off",
    width_side2_bottom: payload.measurements.width_side2_bottom.raw,
    hinge_height: payload.hinges.hinge_height,
    hinge_corner_type: payload.hinges.hinge_corner_type,
    bore_hole_count: payload.lock_prep.bore_hole_count,
    backset_size: payload.lock_prep.backset_size,
    latch_type: payload.lock_prep.latch_type,
    dim_top_to_center_b1: payload.lock_prep.dim_top_to_center_b1.raw,
    dim_top_to_center_b2: payload.lock_prep.dim_top_to_center_b2.raw,
    door_swing: payload.door.door_swing,
    door_type: payload.door.door_type,
    door_thickness: payload.door.door_thickness,
    door_construction: payload.door.door_construction,
    door_species_model: payload.door.door_species_model,
    door_lite_cutout: payload.door.door_lite_cutout,
    style_of_glass: payload.door.style_of_glass,
    size_of_glass: payload.door.size_of_glass,
    full_name: payload.customer.full_name,
    phone_number: payload.customer.phone_number,
    email: payload.customer.email,
    signature_name: payload.customer.signature_name,
    signed_date: payload.customer.signed_date,
    measurements_acknowledged: payload.acknowledgments.measurements_acknowledged ? "Yes" : "Off",
  };
}
