// flat-rooms.js: Per-room data for the flat 2D skin (Chapter 1: the spaceship).
// Each room maps the kids' drawing (in IMAGES) to clickable hotspot rectangles [x, y, w, h] (0..1 fractions)
// and a floor walk band [x0, x1, yBack, yFront]. Repeated hot names use an array of [x, y, w, h] rectangles in order.

const FLAT = {
  mays: {
    img: "mays-room",
    floor: [0.10, 0.90, 0.78, 0.92],
    spots: {
      "Door to the hallway": [0.12, 0.49, 0.13, 0.34],
      "Sign: May's room": [0.73, 0.01, 0.23, 0.22],
      "I love ♥ picture": [0.70, 0.24, 0.15, 0.17],
      "Heart shelf": [0.65, 0.41, 0.14, 0.22],
      "Sugar": [0.25, 0.69, 0.06, 0.13],
      "Barbie Dream House": [0.31, 0.45, 0.19, 0.38],
      "May's bed": [0.51, 0.63, 0.41, 0.23],
      "Heart balloons": [
        [0.16, 0.35, 0.07, 0.15],
        [0.25, 0.35, 0.07, 0.16],
        [0.33, 0.32, 0.07, 0.14],
        [0.43, 0.32, 0.07, 0.15],
        [0.51, 0.33, 0.06, 0.15],
        [0.57, 0.35, 0.09, 0.17],
      ],
      "Addie's drawing": [0.01, 0.02, 0.09, 0.12],
    },
  },

  jasins: {
    img: "jasins-room",
    floor: [0.10, 0.90, 0.74, 0.90],
    spots: {
      "Door to the hallway": [0.09, 0.39, 0.18, 0.38],
      "Sign: Jasin's room": [0.09, 0.05, 0.21, 0.23],
      "Soccer ball picture": [0.53, 0.07, 0.14, 0.19],
      "Jasin's medals": [0.67, 0.04, 0.30, 0.46],
      "Soccer-ball balloons": [
        [0.26, 0.33, 0.11, 0.16],
        [0.39, 0.30, 0.09, 0.15],
        [0.58, 0.31, 0.09, 0.15],
      ],
      "Jasin's bed": [0.62, 0.55, 0.26, 0.24],
      "Oil": [0.34, 0.63, 0.06, 0.14],
    },
  },

  olivias: {
    img: "olivias-room",
    floor: [0.10, 0.90, 0.74, 0.90],
    spots: {
      "Door to the hallway": [0.10, 0.35, 0.17, 0.42],
      "Sign: Olivia's room": [0.66, 0.07, 0.25, 0.23],
      "Dance poster": [0.29, 0.17, 0.28, 0.28],
      "Olivia's bed": [0.58, 0.52, 0.33, 0.27],
      "Flour": [0.48, 0.63, 0.07, 0.13],
      "Olivia": [0.31, 0.50, 0.12, 0.28],
    },
  },

  jons: {
    img: "jons-room",
    floor: [0.08, 0.88, 0.68, 0.88],
    spots: {
      "Door to the hallway": [0.01, 0.24, 0.18, 0.46],
      "Picture": [0.25, 0.05, 0.27, 0.33],
      "Sign: Jon's room": [0.58, 0.04, 0.16, 0.24],
      "Robot": [0.31, 0.50, 0.11, 0.18],
      "Little figure": [0.43, 0.46, 0.12, 0.21],
      "Jon's bed": [0.54, 0.50, 0.27, 0.20],
      "iPad": [0.74, 0.43, 0.08, 0.13],
      "Cacao": [0.21, 0.55, 0.07, 0.13],
      "Jon's portal (climb in)": [0.82, 0.24, 0.13, 0.45],
    },
  },

  hideout: {
    img: "spaceship-hideout",
    crop: [0.45, 0.0, 0.55, 1.0],
    floor: [0.20, 0.78, 0.68, 0.84],
    spots: {
      "Climb out of the portal": [0.08, 0.34, 0.14, 0.34],
      "Tall box": [0.21, 0.41, 0.14, 0.24],
      "A mystery egg with a ?": [0.63, 0.52, 0.12, 0.14],
      "Pile of papers": [0.34, 0.63, 0.14, 0.11],
      "Jon": [0.41, 0.35, 0.20, 0.36],
    },
  },

  playroom: {
    img: "playroom",
    floor: [0.10, 0.90, 0.78, 0.92],
    spots: {
      "Door to the hallway": [0.01, 0.34, 0.10, 0.43],
      "TV": [0.36, 0.11, 0.34, 0.33],
      "Beanbag": [0.10, 0.58, 0.19, 0.23],
      "Toy box": [0.38, 0.63, 0.31, 0.19],
      "Blocks": [0.72, 0.60, 0.12, 0.24],
    },
  },

  hub: {
    imgLeft: "kitchen",
    imgRight: "living-room",
    floor: [0.06, 0.94, 0.72, 0.90],
    spots: {
      "Door to the hallway": [0.005, 0.36, 0.055, 0.36],
      "Window": [0.025, 0.13, 0.09, 0.28],
      "Space flower": [0.07, 0.26, 0.035, 0.14],
      "Stove": [0.015, 0.42, 0.10, 0.28],
      "Kitchen drawers": [0.115, 0.48, 0.075, 0.21],
      "Kitchen table": [0.19, 0.41, 0.14, 0.27],
      "Fridge": [0.37, 0.25, 0.085, 0.43],
      "Old TV": [0.385, 0.04, 0.07, 0.21],
      "Kitchen mouse": [0.46, 0.58, 0.05, 0.12],
      "Jasin": [0.51, 0.52, 0.08, 0.26],
      "Chair": [
        [0.545, 0.48, 0.105, 0.30],
        [0.87, 0.48, 0.10, 0.32],
      ],
      "TV": [0.655, 0.06, 0.22, 0.34],
      "Box with faces": [0.705, 0.57, 0.15, 0.22],
      "Boat: leave the ship": [0.94, 0.38, 0.055, 0.36],
    },
  },

  control: {
    img: "control-room",
    floor: [0.12, 0.88, 0.72, 0.90],
    spots: {
      "Door to the hallway": [0.02, 0.66, 0.12, 0.24],
      "Small grey panel": [0.05, 0.54, 0.12, 0.11],
      "Big window": [0.18, 0.30, 0.63, 0.25],
      "Control panel": [0.22, 0.55, 0.50, 0.15],
      "Armory door": [0.82, 0.44, 0.13, 0.27],
      "Keycard reader": [0.95, 0.56, 0.045, 0.07],
    },
  },

  armory: {
    img: "armory",
    floor: [0.12, 0.88, 0.78, 0.92],
    spots: {
      "Door to the control room": [0.06, 0.48, 0.16, 0.30],
      "Small brown blaster": [0.32, 0.19, 0.45, 0.16],
      "Big orange blaster": [0.23, 0.34, 0.60, 0.23],
      "Long black blaster": [0.28, 0.57, 0.49, 0.17],
      "Small weapons": [0.26, 0.76, 0.68, 0.14],
      "Flashlight": [0.81, 0.58, 0.14, 0.16],
    },
  },

  engine: {
    img: "engine-room",
    floor: [0.08, 0.92, 0.77, 0.92],
    spots: {
      "Door to the hallway": [0.005, 0.38, 0.07, 0.38],
      "The engine": [0.07, 0.46, 0.28, 0.32],
      "Jon": [0.33, 0.48, 0.11, 0.30],
      "Red box": [0.50, 0.21, 0.17, 0.12],
      "Olivia's memory pills": [0.55, 0.35, 0.07, 0.11],
      "Locked box": [0.45, 0.63, 0.12, 0.14],
      "Blue water tank": [0.73, 0.45, 0.26, 0.33],
    },
  },

  storage: {
    img: "storage-room",
    floor: [0.08, 0.92, 0.78, 0.92],
    spots: {
      "Door to the hallway": [0.25, 0.35, 0.17, 0.43],
      "Box": [
        [0.05, 0.58, 0.19, 0.22],
        [0.45, 0.59, 0.18, 0.21],
        [0.72, 0.68, 0.07, 0.14],
        [0.82, 0.67, 0.17, 0.21],
      ],
      "Box ?": [0.06, 0.48, 0.12, 0.11],
      "Yeast": [0.18, 0.48, 0.07, 0.11],
      "Green slime": [
        [0.23, 0.78, 0.28, 0.13],
        [0.65, 0.79, 0.30, 0.17],
      ],
      "Spider": [
        [0.52, 0.26, 0.12, 0.13],
        [0.85, 0.24, 0.11, 0.12],
      ],
    },
  },

  bath: {
    img: "bathroom",
    floor: [0.08, 0.92, 0.68, 0.88],
    spots: {
      "Door to the hallway": [0.01, 0.35, 0.12, 0.36],
      "Toilet": [0.34, 0.46, 0.13, 0.23],
      "Sink": [0.56, 0.46, 0.11, 0.21],
      "Mirror": [0.59, 0.32, 0.08, 0.12],
      "Bathtub": [0.77, 0.30, 0.22, 0.38],
      "Rubber duck": [0.78, 0.42, 0.08, 0.08],
    },
  },

  // Hallway: wide scrolling strip (worldW = 2.8 screens wide) using cut-out doors from art/21-hallway-doors.png
  // placed in the game's hallway order (aft Engine Room on the left to fore Control Room on the right).
  hall: {
    img: "hallway-doors",
    worldW: 2.8,
    floor: [0.04, 0.96, 0.70, 0.88],
    // Source crops [sx, sy, sw, sh] in hallway-doors.jpg (fractions 0..1) for each door
    doorCrops: {
      "Door to the engine room": [0.165, 0.28, 0.075, 0.45],
      "Door to the storage": [0.165, 0.28, 0.075, 0.45],
      "Door to the kitchen + rec room": [0.082, 0.25, 0.090, 0.48],
      "Door to the bathroom": [0.215, 0.13, 0.125, 0.61],
      "Door to the Jasin's room": [0.465, 0.25, 0.120, 0.55],
      "Door to the May's room": [0.630, 0.33, 0.130, 0.50],
      "Door to the Olivia's room": [0.330, 0.25, 0.130, 0.53],
      "Door to the Jon's room": [0.770, 0.29, 0.155, 0.55],
      "Door to the playroom": [0.002, 0.23, 0.082, 0.50],
      "Door to the control room": [0.570, 0.39, 0.082, 0.42],
    },
    // Positions [x, y, w, h] where x and w are fractions (0..1) of the full scrolling strip
    spots: {
      "Door to the engine room": [0.02, 0.26, 0.07, 0.46],
      "Door to the storage": [0.11, 0.28, 0.07, 0.44],
      "Door to the kitchen + rec room": [0.20, 0.25, 0.08, 0.47],
      "Door to the bathroom": [0.30, 0.16, 0.09, 0.56],
      "Door to the Jasin's room": [0.41, 0.22, 0.08, 0.50],
      "Door to the May's room": [0.51, 0.26, 0.08, 0.46],
      "Door to the Olivia's room": [0.61, 0.24, 0.08, 0.48],
      "Door to the Jon's room": [0.71, 0.23, 0.08, 0.49],
      "Door to the playroom": [0.81, 0.25, 0.07, 0.47],
      "Door to the control room": [0.90, 0.28, 0.07, 0.44],
    },
  },
};
