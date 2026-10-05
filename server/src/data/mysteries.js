const mysteries = [
  {
    id: "mystery-1",
    title: "The Five O'Clock Coffee",
    description:
      "A businessman dies seconds after drinking coffee. The timeline points to something that was added after the coffee was poured.",
    story:
      "At 4:59 PM, wealthy businessman Daniel Reed takes one final sip of coffee in his office and collapses almost immediately. The medical examiner confirms a fast-acting poison caused the death. The poison should have acted within about a minute of being swallowed.\n\n" +
      "Three people entered the office before the death:\n" +
      "• The secretary arrived at 4:15 PM and placed an empty cup, a sugar bowl, and a spoon on the desk.\n" +
      "• The business partner arrived at 4:30 PM, poured the hot coffee, and left.\n" +
      "• The server arrived at 4:45 PM and added several ice cubes because the coffee was still too hot.\n\n" +
      "The coffee had been sitting on the desk since 4:30 PM, but Daniel did not become ill until he drank it at 4:59 PM. The investigator believes the delay is the key to the case.",
    questions: [
      {
        id: 1,
        order: 1,
        text: "Who was the last person to handle the cup before Daniel drank the coffee?",
        answer: "the server",
        hints: [
          "Use the timeline. Compare the time each person entered the office.",
          "The last person to touch the cup was the person who added something to it at 4:45 PM.",
        ],
      },
      {
        id: 2,
        order: 2,
        text: "Why did the poison not affect Daniel when the coffee was poured at 4:30 PM?",
        answer: "the ice",
        hints: [
          "Look for something added after the coffee was poured.",
          "If the poison was trapped in something frozen, it would not mix with the coffee until that material melted.",
        ],
      },
      {
        id: 3,
        order: 3,
        text: "Where was the poison hidden?",
        answer: "the ice cubes",
        hints: [
          "The poison needed to remain separate from the hot coffee until shortly before Daniel drank it.",
          "The ice cubes melted into the coffee and released the poison.",
        ],
      },
    ],
    finalReveal:
      "The poison was hidden inside the ice cubes added by the server. The coffee was poured at 4:30 PM, but the poison remained trapped while the cubes were frozen. As the ice melted, the poison entered the coffee. Daniel drank the contaminated coffee at 4:59 PM and died shortly afterward. The server was responsible for the poisoning.",
    nextMysteryId: "mystery-2",
    unlocked: true,
  },

  {
    id: "mystery-2",
    title: "The Rainy Gallery",
    description:
      "A valuable painting disappears during a storm. One suspect's story conflicts with a physical detail at the scene.",
    story:
      "A valuable painting disappears from the city gallery during a heavy evening storm. Investigators confirm that the thief entered and escaped through an uncovered courtyard. The courtyard was muddy and exposed to the rain, and security footage shows the thief spent at least five minutes crossing it.\n\n" +
      "Three suspects were near the gallery:\n" +
      "• Sami says he stayed inside his parked car and never stepped into the rain.\n" +
      "• Fadi says he walked through the area and waited under the cafe awning when the rain became heavy.\n" +
      "• Shadi says he rode his bicycle straight home before the storm became worse.\n\n" +
      "The investigator checks the courtyard camera, the weather conditions, and the condition of each suspect's shoes and clothing. One statement cannot be true.",
    questions: [
      {
        id: 1,
        order: 1,
        text: "What physical evidence should the thief have after crossing the courtyard?",
        answer: "muddy shoes",
        hints: [
          "The courtyard was uncovered, wet, and muddy.",
          "Someone who spent five minutes crossing it should leave the scene with mud on their shoes.",
        ],
      },
      {
        id: 2,
        order: 2,
        text: "Which suspect's story conflicts with the condition of the cafe?",
        answer: "Fadi",
        hints: [
          "Check the detail about where Fadi says he waited.",
          "The cafe awning had been removed for maintenance earlier that day.",
        ],
      },
      {
        id: 3,
        order: 3,
        text: "Why is Fadi's statement impossible?",
        answer: "the awning was removed",
        hints: [
          "His story depends on a shelter that was not available that night.",
          "The cafe awning had been removed for maintenance, so he could not have waited under it.",
        ],
      },
    ],
    finalReveal:
      "Fadi is the thief. He claimed that he escaped the rain under the cafe awning, but the awning had been removed for maintenance before the storm. His story places him at a shelter that did not exist. The muddy courtyard also provides the physical evidence expected from anyone who crossed the escape route. Fadi's false alibi exposes him.",
    nextMysteryId: "mystery-3",
    unlocked: false,
  },

  {
    id: "mystery-3",
    title: "The Midnight Flight",
    description:
      "A passenger is poisoned on a private flight. A short power interruption reveals who had the opportunity to reach the victim.",
    story:
      "At 11:18 PM, a passenger on a private flight is found unconscious in his seat. He later dies from a fast-acting poison. The flight crew confirms that the victim was served a sealed bottle of water at 10:55 PM. The bottle was still sealed when it left the galley.\n\n" +
      "At 11:12 PM, the cabin lights briefly failed for about one minute while the crew reset an electrical panel. During the blackout, the victim's bottle was opened and the poison was introduced.\n\n" +
      "Three people could have been near the victim:\n" +
      "• The pilot says he remained in the cockpit and communicated with air traffic control during the entire reset.\n" +
      "• The flight attendant says she was in the rear galley resetting the electrical panel.\n" +
      "• Dr. Owen, a passenger and friend of the victim, says he stayed in his seat and never left it.\n\n" +
      "The investigator checks the galley panel, the cockpit log, and the victim's bottle. The aircraft also records passenger seat occupancy. The evidence shows that the person who poisoned the bottle had to leave their original position during the blackout.",
    questions: [
      {
        id: 1,
        order: 1,
        text: "What had to happen to the victim's water bottle before the poison could be swallowed?",
        answer: "the bottle had to be opened",
        hints: [
          "The bottle was sealed when it was served.",
          "The poison could not enter a sealed bottle without first opening it.",
        ],
      },
      {
        id: 2,
        order: 2,
        text: "Which suspect had an opportunity to approach the victim during the blackout?",
        answer: "Dr. Owen",
        hints: [
          "The pilot was recorded in the cockpit and the flight attendant was at the rear electrical panel.",
          "The remaining suspect claimed he stayed in his seat, but the seat sensor shows his seat was empty during the blackout.",
        ],
      },
      {
        id: 3,
        order: 3,
        text: "What evidence proves Dr. Owen left his seat during the blackout?",
        answer: "the seat sensor",
        hints: [
          "The aircraft records whether a passenger's seat is occupied.",
          "The sensor shows Dr. Owen's seat was empty during the exact minute when the bottle was opened.",
        ],
      },
    ],
    finalReveal:
      "Dr. Owen poisoned the victim. The sealed bottle could only be contaminated after it was opened. During the one-minute blackout, the pilot remained in the cockpit and the flight attendant was at the rear electrical panel. Dr. Owen's seat sensor shows that he left his seat during that same minute, giving him the opportunity to open the bottle and add the poison before returning to his seat.",
    nextMysteryId: null,
    unlocked: false,
  },
];

export default mysteries;
