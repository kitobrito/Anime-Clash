// One Piece: 45 collectibles, five Gear forms, generated tokens, and Nakama!
export const ONE_PIECE_CARDS = [
  {
    "id": "op_luffy",
    "name": "Monkey D. Luffy",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Devil Fruit User. Gear Shift (2 Mana): Transform into Gear 2. Once per turn, starting the turn after summoning.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_luffy.webp",
    "attack": 3,
    "health": 5,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "luffy"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "luffy": true
  },
  {
    "id": "op_gear2",
    "name": "Gear 2 — Jet Luffy",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Can attack twice each turn. After each attack, take 1 damage. Gear Shift (3 Mana): Gear 3. Devil Fruit User.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_gear2.webp",
    "attack": 4,
    "health": 6,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "gear2"
          }
        ]
      }
    ],
    "keywords": [
      "Rush",
      "Twin Strike"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "token": true,
    "luffy": true
  },
  {
    "id": "op_gear3",
    "name": "Gear 3 — Gigant Luffy",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Attacks deal 2 damage to adjacent enemy minions. Gear Shift (4 Mana): Choose Bounceman or Snakeman. Devil Fruit User.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_gear3.webp",
    "attack": 6,
    "health": 7,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "gear3"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "token": true,
    "luffy": true
  },
  {
    "id": "op_bounceman",
    "name": "Gear 4 — Bounceman",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Taunt. Rush. The first damage this takes each turn is reduced by 3. Gear Shift (5 Mana): Gear 5. Devil Fruit User.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_bounceman.webp",
    "attack": 8,
    "health": 9,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "bounceman"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt",
      "Rush"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "token": true,
    "luffy": true
  },
  {
    "id": "op_snakeman",
    "name": "Gear 4 — Snakeman",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Evade. Can attack twice each turn. Ignores Taunt. Gear Shift (5 Mana): Gear 5. Devil Fruit User.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_snakeman.webp",
    "attack": 6,
    "health": 7,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "snakeman"
          }
        ]
      }
    ],
    "keywords": [
      "Rush",
      "Evade",
      "Twin Strike"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "token": true,
    "luffy": true
  },
  {
    "id": "op_gear5",
    "name": "Gear 5 — Sun God Nika",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Evade. Can attack twice each turn. Whenever this attacks, turn a random enemy minion into a 1/1 Rubber Toy until the end of its owner’s next turn. Lasts three of your turns, then reverts to Base Luffy at 1 Health. Cannot Gear Shift during your next turn. Devil Fruit User.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_gear5.webp",
    "attack": 10,
    "health": 10,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "gear5"
          }
        ]
      }
    ],
    "keywords": [
      "Rush",
      "Evade",
      "Twin Strike"
    ],
    "legendary": true,
    "devilFruitUser": true,
    "token": true,
    "luffy": true
  },
  {
    "id": "op_zoro",
    "name": "Roronoa Zoro",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Whenever this kills a minion, gain +1 Attack. Arrival: If Luffy is on your battlefield, gain Evade.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_zoro.webp",
    "attack": 5,
    "health": 4,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "zoro"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true
  },
  {
    "id": "op_nami",
    "name": "Nami",
    "faction": "One Piece",
    "type": "minion",
    "cost": 2,
    "text": "Arrival: Add a random Weather spell to your hand. Whenever you cast a Weather spell, draw a card, once per turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_nami.webp",
    "attack": 2,
    "health": 3,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "nami"
          }
        ]
      }
    ]
  },
  {
    "id": "op_usopp",
    "name": "Usopp",
    "faction": "One Piece",
    "type": "minion",
    "cost": 2,
    "text": "Elusive. Whenever an enemy minion attacks, deal 1 damage to it before combat, once per turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_usopp.webp",
    "attack": 2,
    "health": 2,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "usopp"
          }
        ]
      }
    ],
    "keywords": [
      "Elusive"
    ]
  },
  {
    "id": "op_sanji",
    "name": "Sanji",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Rush. Whenever this attacks, restore 2 Health to your Hero. If you control Nami or Robin, gain +2 Attack this turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_sanji.webp",
    "attack": 4,
    "health": 5,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "sanji"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true
  },
  {
    "id": "op_chopper",
    "name": "Tony Tony Chopper",
    "faction": "One Piece",
    "type": "minion",
    "cost": 3,
    "text": "Devil Fruit User. Arrival: Restore 3 Health to a friendly character. Whenever you heal a friendly minion, give it +0/+1 permanently.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_chopper.webp",
    "attack": 2,
    "health": 4,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "chopper"
          }
        ]
      }
    ],
    "devilFruitUser": true,
    "target": {
      "type": "character",
      "side": "friendly"
    }
  },
  {
    "id": "op_robin",
    "name": "Nico Robin",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Devil Fruit User. Whenever an enemy minion attacks, summon a 1/1 Flower Hand with Taunt, once per turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_robin.webp",
    "attack": 3,
    "health": 5,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "robin"
          }
        ]
      }
    ],
    "legendary": true,
    "devilFruitUser": true
  },
  {
    "id": "op_franky",
    "name": "Franky",
    "faction": "One Piece",
    "type": "minion",
    "cost": 5,
    "text": "Taunt. Arrival: Deal 2 damage to a random enemy minion. Whenever this survives damage, gain +1 Attack.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_franky.webp",
    "attack": 5,
    "health": 6,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "franky"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ]
  },
  {
    "id": "op_brook",
    "name": "Brook",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Reborn. Devil Fruit User. Whenever this returns through Reborn, Freeze a random enemy minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_brook.webp",
    "attack": 3,
    "health": 4,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "brook"
          }
        ]
      }
    ],
    "keywords": [
      "Reborn"
    ],
    "devilFruitUser": true
  },
  {
    "id": "op_jinbe",
    "name": "Jinbe",
    "faction": "One Piece",
    "type": "minion",
    "cost": 6,
    "text": "Taunt. Arrival: Deal 2 damage to all enemy minions. Friendly Fish-Men take 1 less damage.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_jinbe.webp",
    "attack": 5,
    "health": 7,
    "tribes": [
      "Straw Hat",
      "Pirate",
      "Fish-Man"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "jinbe"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ],
    "legendary": true
  },
  {
    "id": "op_going_merry",
    "name": "Going Merry",
    "faction": "One Piece",
    "type": "minion",
    "cost": 3,
    "text": "Cannot attack. At the end of your turn, restore 1 Health to all friendly Straw Hat minions.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_going_merry.webp",
    "attack": 0,
    "health": 5,
    "tribes": [
      "Straw Hat",
      "Ship"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "going_merry"
          }
        ]
      }
    ],
    "cantAttack": true
  },
  {
    "id": "op_thousand_sunny",
    "name": "Thousand Sunny",
    "faction": "One Piece",
    "type": "minion",
    "cost": 6,
    "text": "Cannot attack. At the end of your turn, summon a 2/2 Straw Hat Crewman. Whenever you play a Straw Hat minion, give it +1/+1.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_thousand_sunny.webp",
    "attack": 0,
    "health": 8,
    "tribes": [
      "Straw Hat",
      "Ship"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "thousand_sunny"
          }
        ]
      }
    ],
    "cantAttack": true
  },
  {
    "id": "op_ace",
    "name": "Portgas D. Ace",
    "faction": "One Piece",
    "type": "minion",
    "cost": 6,
    "text": "Devil Fruit User. Arrival: Deal 3 damage to all enemy minions. Whenever you cast a Fire spell, deal 2 damage to a random enemy.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_ace.webp",
    "attack": 6,
    "health": 5,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "ace"
          }
        ]
      }
    ],
    "legendary": true,
    "devilFruitUser": true
  },
  {
    "id": "op_sabo",
    "name": "Sabo",
    "faction": "One Piece",
    "type": "minion",
    "cost": 5,
    "text": "Devil Fruit User. Rush. Whenever this attacks, apply Burn to its target. If Luffy is on your battlefield, give him +2 Attack this turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_sabo.webp",
    "attack": 5,
    "health": 5,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "sabo"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true,
    "devilFruitUser": true
  },
  {
    "id": "op_law",
    "name": "Trafalgar D. Water Law",
    "faction": "One Piece",
    "type": "minion",
    "cost": 5,
    "text": "Devil Fruit User. Arrival: Swap an enemy minion’s Attack and Health. Once per turn, you may swap the positions of two minions on the same battlefield.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_law.webp",
    "attack": 4,
    "health": 5,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "law"
          }
        ]
      }
    ],
    "legendary": true,
    "devilFruitUser": true,
    "target": {
      "type": "minion",
      "side": "enemy"
    }
  },
  {
    "id": "op_bepo",
    "name": "Bepo",
    "faction": "One Piece",
    "type": "minion",
    "cost": 3,
    "text": "Taunt. Arrival: If Law is on your battlefield, gain +2/+2.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_bepo.webp",
    "attack": 3,
    "health": 4,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "bepo"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ]
  },
  {
    "id": "op_hancock",
    "name": "Boa Hancock",
    "faction": "One Piece",
    "type": "minion",
    "cost": 6,
    "text": "Devil Fruit User. Arrival: Petrify an enemy minion for one turn. Whenever an enemy minion attacks Hancock, Petrify it after combat if it survives.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_hancock.webp",
    "attack": 4,
    "health": 6,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "hancock"
          }
        ]
      }
    ],
    "legendary": true,
    "devilFruitUser": true,
    "target": {
      "type": "minion",
      "side": "enemy"
    }
  },
  {
    "id": "op_yamato",
    "name": "Yamato",
    "faction": "One Piece",
    "type": "minion",
    "cost": 6,
    "text": "Rush. Devil Fruit User. Whenever this attacks, Freeze its target. Arrival: If Luffy is on your battlefield, gain +1/+1.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_yamato.webp",
    "attack": 6,
    "health": 6,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "yamato"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "legendary": true,
    "devilFruitUser": true
  },
  {
    "id": "op_carrot",
    "name": "Carrot",
    "faction": "One Piece",
    "type": "minion",
    "cost": 3,
    "text": "Rush. Arrival: If you have 5 or more Mana Crystals, gain +2 Attack and Evade this turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_carrot.webp",
    "attack": 3,
    "health": 3,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "carrot"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ]
  },
  {
    "id": "op_kinemon",
    "name": "Kin’emon",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Arrival: Give another friendly minion +2 Attack this turn. Whenever this attacks, remove Burn from friendly characters.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_kinemon.webp",
    "attack": 4,
    "health": 4,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "kinemon"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    }
  },
  {
    "id": "op_bartolomeo",
    "name": "Bartolomeo",
    "faction": "One Piece",
    "type": "minion",
    "cost": 4,
    "text": "Taunt. Devil Fruit User. Adjacent friendly minions take 1 less damage.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_bartolomeo.webp",
    "attack": 2,
    "health": 6,
    "tribes": [
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "bartolomeo"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ],
    "devilFruitUser": true
  },
  {
    "id": "op_fleet_captain",
    "name": "Straw Hat Grand Fleet Captain",
    "faction": "One Piece",
    "type": "minion",
    "cost": 3,
    "text": "Arrival: Give another friendly Straw Hat minion +1/+1. If you control three or more Straw Hats, draw a card.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_fleet_captain.webp",
    "attack": 3,
    "health": 3,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "onePiece",
            "action": "fleet_captain"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "tribe": "Straw Hat"
    }
  },
  {
    "id": "op_mera",
    "name": "Mera Mera no Mi — Flame-Flame Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 4,
    "text": "Permanently give a non-Devil Fruit User +2 Attack and Burn on attack. Drawback: At the end of each of your turns, deal 1 damage to this minion. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_mera.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "mera"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_goro",
    "name": "Goro Goro no Mi — Rumble-Rumble Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 5,
    "text": "Permanently give a non-Devil Fruit User +3 Attack. Whenever it attacks, deal 2 damage to a random enemy minion. Drawback: Whenever it takes damage, deal 1 damage to your Hero. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_goro.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "goro"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_hie",
    "name": "Hie Hie no Mi — Ice-Ice Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 4,
    "text": "Permanently give a non-Devil Fruit User +1/+3. Its attacks Freeze their targets. Drawback: This minion cannot attack on consecutive turns. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_hie.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "hie"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_hana",
    "name": "Hana Hana no Mi — Flower-Flower Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Permanently give a non-Devil Fruit User +1/+2. At the end of your turn, summon a 1/1 Flower Hand. Drawback: Whenever a Flower Hand dies, deal 1 damage to this minion. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_hana.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "hana"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_bara",
    "name": "Bara Bara no Mi — Chop-Chop Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Permanently give a non-Devil Fruit User Evade and +0/+2. Drawback: It takes 2 additional damage from spells. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_bara.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "bara"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_supa",
    "name": "Supa Supa no Mi — Dice-Dice Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 4,
    "text": "Permanently give a non-Devil Fruit User +3 Attack and reduce attack damage taken by 1. Drawback: It cannot receive healing. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_supa.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "supa"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_bomu",
    "name": "Bomu Bomu no Mi — Bomb-Bomb Fruit",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Permanently give a non-Devil Fruit User +2 Attack and Exit: Deal 3 damage to all enemy minions. Drawback: Whenever it attacks, deal 1 damage to adjacent friendly minions. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_bomu.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "bomu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_tori",
    "name": "Tori Tori no Mi, Model: Phoenix",
    "faction": "One Piece",
    "type": "spell",
    "cost": 6,
    "text": "Permanently give a non-Devil Fruit User +2/+3, Reborn, and Lifesteal. Drawback: At the start of your turn, lose 2 Mana this turn while this remains in play. Fruit powers and drawbacks survive Silence. Only one Fruit per minion.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_tori.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "tori"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "nonDevilFruit": true
    },
    "devilFruitSpell": true
  },
  {
    "id": "op_pistol",
    "name": "Gum-Gum Pistol",
    "faction": "One Piece",
    "type": "spell",
    "cost": 2,
    "text": "Deal 3 damage to an enemy minion (5 if you control Luffy).",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_pistol.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "pistol"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    }
  },
  {
    "id": "op_gatling",
    "name": "Gum-Gum Gatling",
    "faction": "One Piece",
    "type": "spell",
    "cost": 4,
    "text": "Deal 1 damage to random enemy minions six times (eight if Luffy is Gear 2 or higher).",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_gatling.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "gatling"
      }
    ]
  },
  {
    "id": "op_red_hawk",
    "name": "Red Hawk",
    "faction": "One Piece",
    "type": "spell",
    "cost": 5,
    "text": "Deal 5 damage to an enemy character and apply Burn. If you control Luffy, also deal 2 damage to adjacent enemy minions.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_red_hawk.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "red_hawk"
      }
    ],
    "target": {
      "type": "character",
      "side": "enemy"
    },
    "fire": true
  },
  {
    "id": "op_oni_giri",
    "name": "Three Sword Style: Oni Giri",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Give a friendly minion +3 Attack this turn. If it is Zoro, it can attack one additional time this turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_oni_giri.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "oni_giri"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    }
  },
  {
    "id": "op_diable",
    "name": "Diable Jambe",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Give a friendly minion +2 Attack and Rush this turn. If it is Sanji, also apply Burn to enemies it damages.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_diable.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "diable"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "fire": true
  },
  {
    "id": "op_thunderbolt",
    "name": "Thunderbolt Tempo",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Deal 2 damage to three random enemy minions. If you control Nami, Freeze damaged enemies.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_thunderbolt.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "thunderbolt"
      }
    ],
    "weather": true
  },
  {
    "id": "op_armament",
    "name": "Armament Haki",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Give a friendly minion +2/+2 permanently and immunity to Attack reduction effects.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_armament.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "armament"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    }
  },
  {
    "id": "op_observation",
    "name": "Observation Haki",
    "faction": "One Piece",
    "type": "spell",
    "cost": 2,
    "text": "Quick Play: When a friendly minion is attacked, give it Evade for that attack and draw a card.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_observation.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "observation"
      }
    ],
    "reactionOnly": true,
    "quickPlay": {
      "windows": [
        "attackDeclared"
      ],
      "filter": {
        "player": "enemy"
      }
    }
  },
  {
    "id": "op_conqueror",
    "name": "Conqueror’s Haki",
    "faction": "One Piece",
    "type": "spell",
    "cost": 6,
    "text": "Destroy all enemy minions with 2 or less Attack. Give survivors -2 Attack until your next turn.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_conqueror.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "conqueror"
      }
    ]
  },
  {
    "id": "op_grand_fleet",
    "name": "Straw Hat Grand Fleet",
    "faction": "One Piece",
    "type": "spell",
    "cost": 7,
    "text": "Summon four 3/3 Grand Fleet Pirates with Rush. If you control Luffy, give them +1/+1.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_grand_fleet.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "grand_fleet"
      }
    ]
  },
  {
    "id": "op_meat",
    "name": "Meat Feast",
    "faction": "One Piece",
    "type": "spell",
    "cost": 2,
    "text": "Restore 4 Health to a friendly character. If the target is Luffy, also give him +1 Attack permanently.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_meat.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "meat"
      }
    ],
    "target": {
      "type": "character",
      "side": "friendly"
    }
  },
  {
    "id": "op_emergency",
    "name": "Emergency Gear Shift",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Quick Play: When Luffy is targeted by an enemy attack or spell, transform him into his next Gear for free. At Gear 3, choose a Gear 4 branch. Cannot target Gear 5.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_emergency.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "emergency"
      }
    ],
    "reactionOnly": true,
    "quickPlay": {
      "windows": [
        "attackDeclared",
        "cardPlayed"
      ],
      "filter": {
        "player": "enemy"
      }
    }
  },
  {
    "id": "op_shackles",
    "name": "Sea-Prism Stone Shackles",
    "faction": "One Piece",
    "type": "spell",
    "cost": 3,
    "text": "Choose an enemy Devil Fruit User. Silence its removable abilities, reduce its Attack to 1 until your next turn, and deal 3 damage (doubled against Fruit Users). Permanent Fruit powers remain.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_shackles.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "shackles"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy",
      "devilFruitUser": true
    }
  },
  {
    "id": "op_buster",
    "name": "Buster Call",
    "faction": "One Piece",
    "type": "spell",
    "cost": 8,
    "text": "Deal 5 damage to all minions. Your Straw Hat minions take 2 less damage from this effect.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_buster.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "buster"
      }
    ]
  },
  {
    "id": "op_will",
    "name": "The Will of D.",
    "faction": "One Piece",
    "type": "spell",
    "cost": 5,
    "text": "Give a friendly Legendary minion +3/+3 and Reborn. If it is Luffy, refresh Gear Shift and reduce its next activation cost by 2.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_will.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "will"
      }
    ],
    "legendary": true,
    "target": {
      "type": "minion",
      "side": "friendly",
      "legendary": true
    }
  },
  {
    "id": "op_nakama",
    "name": "Nakama!",
    "faction": "One Piece",
    "type": "spell",
    "cost": 2,
    "text": "Give a friendly minion +1 Attack this turn. If you control two or more Straw Hats, restore 2 Health to your Hero.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_nakama.webp",
    "effects": [
      {
        "op": "onePiece",
        "action": "nakama"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "heroSpell": true
  },
  {
    "id": "op_flower_hand",
    "name": "Flower Hand",
    "faction": "One Piece",
    "type": "minion",
    "cost": 0,
    "text": "No additional effect.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_flower_hand.webp",
    "attack": 1,
    "health": 1,
    "tribes": [
      "Pirate"
    ],
    "triggers": [],
    "token": true,
    "flowerHand": true
  },
  {
    "id": "op_flower_guard",
    "name": "Flower Hand",
    "faction": "One Piece",
    "type": "minion",
    "cost": 0,
    "text": "Taunt.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_flower_guard.webp",
    "attack": 1,
    "health": 1,
    "tribes": [
      "Pirate"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "token": true,
    "flowerHand": true
  },
  {
    "id": "op_crewman",
    "name": "Straw Hat Crewman",
    "faction": "One Piece",
    "type": "minion",
    "cost": 0,
    "text": "No additional effect.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_crewman.webp",
    "attack": 2,
    "health": 2,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [],
    "token": true
  },
  {
    "id": "op_fleet_pirate",
    "name": "Grand Fleet Pirate",
    "faction": "One Piece",
    "type": "minion",
    "cost": 0,
    "text": "Rush.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_fleet_pirate.webp",
    "attack": 3,
    "health": 3,
    "tribes": [
      "Straw Hat",
      "Pirate"
    ],
    "triggers": [],
    "keywords": [
      "Rush"
    ],
    "token": true
  },
  {
    "id": "op_rubber_toy",
    "name": "Rubber Toy",
    "faction": "One Piece",
    "type": "minion",
    "cost": 0,
    "text": "No additional effect.",
    "art": "🏴‍☠️",
    "image": "art/straw-hats/op_rubber_toy.webp",
    "attack": 1,
    "health": 1,
    "tribes": [
      "Pirate"
    ],
    "triggers": [],
    "token": true
  }
];
