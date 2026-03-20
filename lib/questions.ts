export type Option = {
  label: string;
  value: string;
  image?: string; // path to image in /public/images/options/
  description?: string;
  colorHex?: string;
};

export type Question = {
  id: string;
  text: string;
  subtext?: string;
  type: "single" | "multi" | "text" | "yesno";
  options?: Option[];
  image?: string; // path to image in /public/images/questions/
  placeholder?: string;
  allowCustom?: boolean;
  customLabel?: string;
  required?: boolean;
  multiline?: boolean;
  showIf?: (answers: Record<string, string | string[]>) => boolean;
};

const isPrehungFlow = (answers: Record<string, string | string[]>) =>
  answers["q1_unitType"] !== "slab";

const hasSidelights = (answers: Record<string, string | string[]>) =>
  answers["q11_sidelights"] === "1side" ||
  answers["q11_sidelights"] === "2side";

export const customerInfoQuestions: Question[] = [
  {
    id: "customerName",
    text: "What's your name?",
    subtext: "Contractor or customer name",
    type: "text",
    placeholder: "Your full name",
    required: true,
  },
  {
    id: "phone",
    text: "What's your phone number?",
    type: "text",
    placeholder: "(555) 555-5555",
    required: true,
  },
  {
    id: "address",
    text: "What's the project address?",
    type: "text",
    placeholder: "Street address",
    required: true,
  },
  {
    id: "cityStateZip",
    text: "City, State, and ZIP?",
    type: "text",
    placeholder: "City, ST 00000",
    required: true,
  },
  {
    id: "q_installation",
    text: "Do you want us to install the door?",
    type: "single",
    options: [
      {
        label: "Yes — Please install it",
        value: "yes",
        description: "We'll handle the installation",
      },
      {
        label: "No — I'll handle it",
        value: "no",
        description: "Customer or contractor will install",
      },
    ],
  },
  {
    id: "q_contractor",
    text: "Do you have a contractor to install?",
    type: "single",
    allowCustom: true,
    customLabel: "Yes — Contractor name",
    options: [
      {
        label: "No Contractor",
        value: "none",
        description: "I don't have a contractor yet",
      },
    ],
  },
];

export const doorQuestions: Question[] = [
  {
    id: "q1_unitType",
    text: "Do you need a prehung unit or slab only?",
    subtext: "Slab-only requests now open the custom slab spec workflow in this form.",
    type: "single",
    options: [
      {
        label: "Prehung Unit",
        value: "prehung",
        description: "Complete unit with frame and components",
      },
      {
        label: "Slab Only",
        value: "slab",
        description: "Door slab only — use the in-app custom slab spec workflow",
      },
    ],
  },
  {
    id: "q2_material",
    text: "What kind of door material?",
    type: "single",
    image: "/images/questions/q2_material.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "Steel",
        value: "steel",
        image: "/images/options/steel_door.jpg",
        description: "Durable, secure, and energy efficient",
      },
      {
        label: "Fiberglass",
        value: "fiberglass",
        image: "/images/options/fiberglass_door.jpg",
        description: "Low maintenance with flexible finish options",
      },
    ],
  },
  {
    id: "q3_fireRated",
    text: "Does the fiberglass door need to be fire rated?",
    type: "single",
    showIf: (answers) =>
      isPrehungFlow(answers) && answers["q2_material"] === "fiberglass",
    options: [
      {
        label: "Yes — Fire Rated",
        value: "yes",
        description: "Required for code or project conditions",
      },
      {
        label: "No Fire Rating Needed",
        value: "no",
        description: "Standard fiberglass configuration",
      },
    ],
  },
  {
    id: "q4_fiberglassFinish",
    text: "What kind of fiberglass finish?",
    type: "single",
    image: "/images/questions/q3_fiberglass.jpg",
    showIf: (answers) =>
      isPrehungFlow(answers) && answers["q2_material"] === "fiberglass",
    options: [
      {
        label: "Smooth to Paint",
        value: "smooth",
        image: "/images/options/smooth_fiberglass.jpg",
        description: "Primed surface ready for paint",
      },
      {
        label: "Textured to Stain",
        value: "textured",
        image: "/images/options/textured_fiberglass.jpg",
        description: "Wood-grain texture for stain finishes",
      },
    ],
  },
  {
    id: "q5_prefinish",
    text: "Do you want the fiberglass door pre-finished?",
    type: "single",
    showIf: (answers) =>
      isPrehungFlow(answers) && answers["q2_material"] === "fiberglass",
    options: [
      {
        label: "Yes — Pre-finished",
        value: "yes",
        description: "Factory-finished before delivery",
      },
      {
        label: "No — Finish Later",
        value: "no",
        description: "We'll leave it ready for jobsite finishing",
      },
    ],
  },
  {
    id: "q6_width",
    text: "What width do you need?",
    subtext: "Standard door widths",
    type: "single",
    image: "/images/questions/q4_width.jpg",
    allowCustom: true,
    customLabel: "Custom width (enter inches)",
    showIf: isPrehungFlow,
    options: [
      {
        label: '2/8 (32")',
        value: "2/8",
        description: "32 inches wide",
      },
      {
        label: '3/0 (36")',
        value: "3/0",
        description: "36 inches wide — most common",
      },
    ],
  },
  {
    id: "q7_height",
    text: "What height is the door?",
    type: "single",
    image: "/images/questions/q5_height.jpg",
    allowCustom: true,
    customLabel: "Custom height",
    showIf: isPrehungFlow,
    options: [
      {
        label: '6\'8"',
        value: "6/8",
        description: "Standard height — 80 inches",
      },
      {
        label: '7\'0"',
        value: "7/0",
        description: "84 inches",
      },
      {
        label: '8\'0"',
        value: "8/0",
        description: "96 inches",
      },
    ],
  },
  {
    id: "q8_swing",
    text: "What way does the door swing?",
    subtext: "Use the swing chart below if you need a quick reference.",
    type: "single",
    image: "/images/questions/q8_swing.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "In-Swing",
        value: "inswing",
        image: "/images/options/inswing.jpg",
        description: "Door opens inward into the home",
      },
      {
        label: "Out-Swing",
        value: "outswing",
        image: "/images/options/outswing.jpg",
        description: "Door opens outward away from the home",
      },
    ],
  },
  {
    id: "q9_hand",
    text: "Does the door swing to the Right or Left?",
    subtext: "Standing on the outside looking in.",
    type: "single",
    image: "/images/questions/q9_hand.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "Right Hand",
        value: "right",
        image: "/images/options/right_hand.jpg",
        description: "Hinges on the right, handle on the left",
      },
      {
        label: "Left Hand",
        value: "left",
        image: "/images/options/left_hand.jpg",
        description: "Hinges on the left, handle on the right",
      },
    ],
  },
  {
    id: "q10_lock",
    text: "What kind of lock bore will your door have?",
    type: "single",
    image: "/images/questions/q10_lock.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "Single Bore",
        value: "single",
        image: "/images/options/single_bore.jpg",
        description: "One hole for a standard knob or lever",
      },
      {
        label: "Double Bore",
        value: "double",
        image: "/images/options/double_bore.jpg",
        description: "Two holes for knob plus deadbolt",
      },
      {
        label: "Multi-Point Lock",
        value: "multipoint",
        image: "/images/options/multipoint.jpg",
        description: "Multiple locking points for extra security",
      },
    ],
  },
  {
    id: "q11_design",
    text: "What design panel style do you want?",
    subtext: "Choose a style, or select Other to describe it / reference an inspiration photo.",
    type: "single",
    image: "/images/questions/q11_design.jpg",
    showIf: isPrehungFlow,
    allowCustom: true,
    customLabel: "Other / inspiration photo reference",
    options: [
      {
        label: "Flush",
        value: "flush",
        image: "/images/options/flush.jpg",
        description: "Flat, smooth surface — modern look",
      },
      {
        label: "1-Panel",
        value: "1panel",
        image: "/images/options/1panel.jpg",
        description: "One large raised panel",
      },
      {
        label: "2-Panel",
        value: "2panel",
        image: "/images/options/2panel.jpg",
        description: "Two stacked raised panels",
      },
      {
        label: "3-Panel",
        value: "3panel",
        image: "/images/options/3panel.jpg",
        description: "Three stacked raised panels",
      },
      {
        label: "4-Panel",
        value: "4panel",
        image: "/images/options/4panel.jpg",
        description: "Classic four-panel design",
      },
      {
        label: "6-Panel",
        value: "6panel",
        image: "/images/options/6panel.jpg",
        description: "Traditional six-panel Colonial style",
      },
    ],
  },
  {
    id: "q12_glassLite",
    text: "Do you want a glass lite in your door?",
    subtext: "Choose an option, or select Other to describe it / reference an inspiration photo.",
    type: "single",
    image: "/images/questions/q12_glass.jpg",
    showIf: isPrehungFlow,
    allowCustom: true,
    customLabel: "Other / inspiration photo reference",
    options: [
      {
        label: "No Glass",
        value: "none",
        description: "Solid door, no glass",
      },
      {
        label: "Full View",
        value: "fullview",
        image: "/images/options/full_view.jpg",
        description: "Full-length glass panel",
      },
      {
        label: "1/2 View",
        value: "halfview",
        image: "/images/options/half_view.jpg",
        description: "Glass in the top half",
      },
      {
        label: "3/4 View",
        value: "34view",
        image: "/images/options/34_view.jpg",
        description: "Glass in three-quarters of the door",
      },
      {
        label: "Shaker Lite",
        value: "shaker",
        image: "/images/options/shaker.jpg",
        description: "Small decorative window insert",
      },
    ],
  },
  {
    id: "q11_sidelights",
    text: "Do you have or want sidelights or a transom?",
    type: "single",
    image: "/images/questions/q13_sidelights.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "None",
        value: "none",
        description: "Just the door, no additions",
      },
      {
        label: "1 Sidelight",
        value: "1side",
        image: "/images/options/1sidelight.jpg",
        description: "One glass panel on the side",
      },
      {
        label: "2 Sidelights",
        value: "2side",
        image: "/images/options/2sidelight.jpg",
        description: "Glass panels on both sides",
      },
      {
        label: "Transom",
        value: "transom",
        image: "/images/options/transom.jpg",
        description: "Glass panel above the door",
      },
    ],
  },
  {
    id: "q12_sidelightSize",
    text: "What size are the sidelights?",
    type: "single",
    image: "/images/questions/q14_slsize.jpg",
    showIf: (answers) => isPrehungFlow(answers) && hasSidelights(answers),
    options: [
      {
        label: '12"',
        value: "12",
        description: "12 inches wide",
      },
      {
        label: '14"',
        value: "14",
        description: "14 inches wide",
      },
    ],
  },
  {
    id: "q13_sidelightType",
    text: "Is your sidelight a Direct Set or Panel Set?",
    type: "single",
    image: "/images/questions/q15_sltype.jpg",
    showIf: (answers) => isPrehungFlow(answers) && hasSidelights(answers),
    options: [
      {
        label: "Direct Set",
        value: "directset",
        image: "/images/options/direct_set.jpg",
        description: "Fixed glass, no frame panel",
      },
      {
        label: "Panel Set",
        value: "panelset",
        image: "/images/options/panel_set.jpg",
        description: "Framed panel with glass options",
      },
    ],
  },
  {
    id: "q14_panelSetLite",
    text: "What lite style for the panel set sidelight?",
    type: "single",
    image: "/images/questions/q16_panellite.jpg",
    showIf: (answers) =>
      isPrehungFlow(answers) && answers["q13_sidelightType"] === "panelset",
    options: [
      {
        label: "Full Lite",
        value: "full",
        image: "/images/options/sl_full.jpg",
        description: "Full-length glass",
      },
      {
        label: "1/2 Lite",
        value: "half",
        image: "/images/options/sl_half.jpg",
        description: "Glass in top half",
      },
      {
        label: "3/4 Lite",
        value: "34",
        image: "/images/options/sl_34.jpg",
        description: "Glass in three-quarters",
      },
      {
        label: "Shaker Lite",
        value: "shaker",
        image: "/images/options/sl_shaker.jpg",
        description: "Decorative small window",
      },
    ],
  },
  {
    id: "q15_jambSize",
    text: "What jamb size do you need?",
    type: "single",
    image: "/images/questions/q17_jamb.jpg",
    allowCustom: true,
    customLabel: "Custom jamb size (enter measurement)",
    showIf: isPrehungFlow,
    options: [
      {
        label: '4-9/16"',
        value: "4-9/16",
        image: "/images/options/jamb_2x4.jpg",
        description: 'Standard for a 2x4 wall',
      },
      {
        label: '6-9/16"',
        value: "6-9/16",
        image: "/images/options/jamb_2x6.jpg",
        description: 'Standard for a 2x6 wall',
      },
    ],
  },
  {
    id: "q16_hingeColor",
    text: "What color hinges do you want?",
    subtext: "Choose from the finish options below.",
    type: "single",
    image: "/images/questions/q19_hinges.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "Matte Black",
        value: "matteblack",
        colorHex: "#1f1f1f",
        description: "Bold, modern look",
      },
      {
        label: "Satin Nickel",
        value: "satinnickel",
        colorHex: "#b8bcc3",
        description: "Soft silver, most popular",
      },
      {
        label: "Brushed Chrome",
        value: "brushedchrome",
        colorHex: "#d8dee6",
        description: "Bright, reflective silver",
      },
      {
        label: "Polished Brass",
        value: "polishedbrass",
        colorHex: "#d4a437",
        description: "Traditional warm gold",
      },
      {
        label: "Oil Rubbed Bronze",
        value: "oilbronze",
        colorHex: "#5b4636",
        description: "Dark, antique bronze finish",
      },
    ],
  },
  {
    id: "q17_cladding",
    text: "Do you want metal cladding?",
    subtext: "If not, we'll quote a paintable trim material in lieu of maintenance-free PVC.",
    type: "single",
    image: "/images/questions/q21_cladding.jpg",
    showIf: isPrehungFlow,
    options: [
      {
        label: "Yes — Metal Cladding",
        value: "yes",
        image: "/images/options/metal_cladding.jpg",
        description: "Exterior protection with metal-wrapped trim",
      },
      {
        label: "No — Paintable Trim Material",
        value: "no",
        image: "/images/options/pvc_brickmold.jpg",
        description: "Paintable low-maintenance trim alternative",
      },
    ],
  },
  {
    id: "q18_claddingColor",
    text: "What color cladding?",
    subtext: "Choose a stock color or enter a special-order color.",
    type: "single",
    image: "/images/questions/q22_claddingcolor.jpg",
    showIf: (answers) => isPrehungFlow(answers) && answers["q17_cladding"] === "yes",
    allowCustom: true,
    customLabel: "Special-order color (enter name or code)",
    options: [
      {
        label: "Stock White",
        value: "white",
        colorHex: "#f8fafc",
        description: "Classic bright white",
      },
      {
        label: "Stock Black",
        value: "black",
        colorHex: "#111827",
        description: "Bold, modern black",
      },
      {
        label: "Stock Bronze",
        value: "bronze",
        colorHex: "#6f4e37",
        description: "Warm dark bronze",
      },
    ],
  },
  {
    id: "q19_specialInstructions",
    text: "Any special instructions?",
    subtext: "Share ADA requirements, inspiration photo links, site notes, or anything else we should know.",
    type: "text",
    multiline: true,
    placeholder: "Example: ADA threshold needed, match existing glass, inspiration photo link, preferred scheduling notes...",
    showIf: isPrehungFlow,
  },
];
