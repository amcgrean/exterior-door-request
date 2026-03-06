export type Option = {
  label: string;
  value: string;
  image?: string; // path to image in /public/images/options/
  description?: string;
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
  showIf?: (answers: Record<string, string | string[]>) => boolean;
};

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
];

export const doorQuestions: Question[] = [
  {
    id: "q1_doorType",
    text: "Are you looking for an Interior or Exterior door?",
    type: "single",
    image: "/images/questions/q1_door_type.jpg",
    options: [
      {
        label: "Exterior Door",
        value: "exterior",
        image: "/images/options/exterior_door.jpg",
        description: "Designed for outside entry points",
      },
      {
        label: "Interior Door",
        value: "interior",
        image: "/images/options/interior_door.jpg",
        description: "For rooms inside your home",
      },
    ],
  },
  {
    id: "q2_material",
    text: "What kind of door material?",
    type: "single",
    image: "/images/questions/q2_material.jpg",
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
        description: "Low maintenance, authentic wood look",
      },
    ],
  },
  {
    id: "q3_fiberglassFinish",
    text: "What kind of fiberglass finish?",
    type: "single",
    image: "/images/questions/q3_fiberglass.jpg",
    showIf: (answers) => answers["q2_material"] === "fiberglass",
    options: [
      {
        label: "Smooth to Paint",
        value: "smooth",
        image: "/images/options/smooth_fiberglass.jpg",
        description: "Primed surface, ready for any paint color",
      },
      {
        label: "Textured to Stain",
        value: "textured",
        image: "/images/options/textured_fiberglass.jpg",
        description: "Wood-grain texture, ideal for staining",
      },
    ],
  },
  {
    id: "q4_width",
    text: "What width do you need?",
    subtext: "Standard door widths",
    type: "single",
    image: "/images/questions/q4_width.jpg",
    allowCustom: true,
    customLabel: "Custom width (enter inches)",
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
    id: "q5_height",
    text: "What height is the door?",
    type: "single",
    image: "/images/questions/q5_height.jpg",
    allowCustom: true,
    customLabel: "Custom height",
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
    id: "q6_actualHeight",
    text: "Do you know the actual height measurement?",
    subtext: "Enter the exact measurement if known",
    type: "text",
    placeholder: 'e.g. 80-1/4" or "not sure"',
  },
  {
    id: "q7_openingType",
    text: "What kind of door opening is it?",
    type: "single",
    image: "/images/questions/q7_opening.jpg",
    options: [
      {
        label: "Frame Dimension",
        value: "frame",
        image: "/images/options/frame_dim.jpg",
        description: "Measured to outside of existing frame",
      },
      {
        label: "Rough Opening",
        value: "rough",
        image: "/images/options/rough_opening.jpg",
        description: "Measured to the framing structure",
      },
      {
        label: "Brick to Brick Opening",
        value: "brick",
        image: "/images/options/brick_opening.jpg",
        description: "Measured between brick or masonry",
      },
    ],
  },
  {
    id: "q8_swing",
    text: "What way does the door swing?",
    type: "single",
    image: "/images/questions/q8_swing.jpg",
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
        description: "Door opens outward away from home",
      },
    ],
  },
  {
    id: "q9_hand",
    text: "Does the door swing to the Right or Left?",
    subtext: "Standing on the OUTSIDE looking in",
    type: "single",
    image: "/images/questions/q9_hand.jpg",
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
        description: "Two holes for knob + deadbolt",
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
    type: "single",
    image: "/images/questions/q11_design.jpg",
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
    type: "single",
    image: "/images/questions/q12_glass.jpg",
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
        description: "Glass in three-quarters of door",
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
    id: "q13_sidelights",
    text: "Do you have or want sidelights or a transom?",
    type: "single",
    image: "/images/questions/q13_sidelights.jpg",
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
    id: "q14_sidelightSize",
    text: "What size are the sidelights?",
    type: "single",
    image: "/images/questions/q14_slsize.jpg",
    showIf: (answers) =>
      answers["q13_sidelights"] === "1side" ||
      answers["q13_sidelights"] === "2side",
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
    id: "q15_sidelightType",
    text: "Is your sidelight a Direct Set or Panel Set?",
    type: "single",
    image: "/images/questions/q15_sltype.jpg",
    showIf: (answers) =>
      answers["q13_sidelights"] === "1side" ||
      answers["q13_sidelights"] === "2side",
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
    id: "q16_panelSetLite",
    text: "What lite style for the panel set sidelight?",
    type: "single",
    image: "/images/questions/q16_panellite.jpg",
    showIf: (answers) => answers["q15_sidelightType"] === "panelset",
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
    id: "q17_jambSize",
    text: "What jamb size do you need?",
    type: "single",
    image: "/images/questions/q17_jamb.jpg",
    allowCustom: true,
    customLabel: "Custom jamb size (enter measurement)",
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
    id: "q18_actualJamb",
    text: "What is the actual jamb size measurement?",
    type: "text",
    placeholder: 'e.g. 5-1/4" or "not sure"',
  },
  {
    id: "q19_hingeColor",
    text: "What color hinges do you want?",
    type: "single",
    image: "/images/questions/q19_hinges.jpg",
    options: [
      {
        label: "Matte Black",
        value: "matteblack",
        image: "/images/options/hinge_matteblack.jpg",
        description: "Bold, modern look",
      },
      {
        label: "Satin Nickel",
        value: "satinnickel",
        image: "/images/options/hinge_satinnickel.jpg",
        description: "Soft silver, most popular",
      },
      {
        label: "Brushed Chrome",
        value: "brushedchrome",
        image: "/images/options/hinge_chrome.jpg",
        description: "Bright, reflective silver",
      },
      {
        label: "Polished Brass",
        value: "polishedbrass",
        image: "/images/options/hinge_brass.jpg",
        description: "Traditional warm gold",
      },
      {
        label: "Oil Rubbed Bronze",
        value: "oilbronze",
        image: "/images/options/hinge_bronze.jpg",
        description: "Dark, antique bronze finish",
      },
    ],
  },
  {
    id: "q20_sill",
    text: "What kind of sill do you want?",
    type: "single",
    image: "/images/questions/q20_sill.jpg",
    options: [
      {
        label: "Adjustable Sill",
        value: "adjustable",
        image: "/images/options/adjustable_sill.jpg",
        description: "Height can be adjusted for fit",
      },
      {
        label: "ADA Sill",
        value: "ada",
        image: "/images/options/ada_sill.jpg",
        description: "Low-profile for accessibility",
      },
    ],
  },
  {
    id: "q21_cladding",
    text: "Do you want metal cladding?",
    subtext: "If no, we will assume PVC Brickmold",
    type: "single",
    image: "/images/questions/q21_cladding.jpg",
    options: [
      {
        label: "Yes — Metal Cladding",
        value: "yes",
        image: "/images/options/metal_cladding.jpg",
        description: "Aluminum or steel exterior protection",
      },
      {
        label: "No — PVC Brickmold",
        value: "no",
        image: "/images/options/pvc_brickmold.jpg",
        description: "Maintenance-free PVC trim",
      },
    ],
  },
  {
    id: "q22_claddingColor",
    text: "What color cladding?",
    type: "single",
    image: "/images/questions/q22_claddingcolor.jpg",
    showIf: (answers) => answers["q21_cladding"] === "yes",
    allowCustom: true,
    customLabel: "Special order color (enter name or code)",
    options: [
      {
        label: "Stock White",
        value: "white",
        image: "/images/options/cladding_white.jpg",
        description: "Classic bright white",
      },
      {
        label: "Stock Black",
        value: "black",
        image: "/images/options/cladding_black.jpg",
        description: "Bold, modern black",
      },
      {
        label: "Stock Bronze",
        value: "bronze",
        image: "/images/options/cladding_bronze.jpg",
        description: "Warm dark bronze",
      },
    ],
  },
  {
    id: "q23_contractor",
    text: "Do you have a contractor to install?",
    type: "single",
    allowCustom: true,
    customLabel: "Yes — Contractor name",
    options: [
      {
        label: "No Contractor",
        value: "none",
        description: "I don't have a contractor",
      },
    ],
  },
  {
    id: "q24_installation",
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
];
