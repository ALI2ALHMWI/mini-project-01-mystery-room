const mysteries = [
  {
    id: "mystery-1",
    title: "The Missing Key",
    description: "A temporary mystery used for API testing.",
    story:
      "You enter an old room and discover that the main door is locked. A series of clues may help you escape.",
    questions: [
      {
        id: 1,
        order: 1,
        text: "What follows you when there is light?",
        answer: "shadow",
        hints: [
          "Think about something that follows you.",
          "You can see it when there is light.",
        ],
      },
      {
        id: 2,
        order: 2,
        text: "What can open something that is locked?",
        answer: "key",
        hints: [
          "You can use it to open something.",
          "It is commonly used with a lock.",
        ],
      },
      {
        id: 3,
        order: 3,
        text: "What do you pass through to enter another room?",
        answer: "door",
        hints: [
          "You can open and close it.",
          "You pass through it to enter another place.",
        ],
      },
    ],
    finalReveal: "You discovered the hidden key and escaped the room.",
    nextMysteryId: "mystery-2",
  },

  {
    id: "mystery-2",
    title: "The Silent Library",
    description: "A second temporary mystery used for API testing.",
    story:
      "You enter a silent library where another mystery is waiting to be solved.",
    questions: [
      {
        id: 1,
        order: 1,
        text: "What has pages and can be read?",
        answer: "book",
        hints: ["You can read it.", "It contains pages."],
      },
      {
        id: 2,
        order: 2,
        text: "What tells you the time and often has hands?",
        answer: "clock",
        hints: ["It tells you the time.", "It can have hands and numbers."],
      },
    ],
    finalReveal:
      "You solved the second mystery and discovered the final secret.",
    nextMysteryId: null,
  },
];

export default mysteries;
