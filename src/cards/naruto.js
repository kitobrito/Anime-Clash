// Naruto: 45 collectibles, 9 generated tokens, and one Hero Spell.
export const NARUTO_CARDS = [
  {
    "id": "konohamaru",
    "name": "Konohamaru",
    "faction": "Naruto",
    "type": "minion",
    "cost": 1,
    "text": "Arrival: Gain +1/+1 if Naruto Uzumaki is on your battlefield.",
    "art": "🍃",
    "jutsu": false,
    "attack": 1,
    "health": 1,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "konohamaru"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/konohamaru.webp"
  },
  {
    "id": "naruto_uzumaki",
    "name": "Naruto Uzumaki",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Arrival: Summon a copy of this minion at the end of this turn. If Sakura and Sasuke are on your battlefield, gain +1/+1.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "naruto_uzumaki"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/naruto_uzumaki.webp"
  },
  {
    "id": "sakura_haruno",
    "name": "Sakura Haruno",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Arrival: Restore 3 Health to an ally. If Naruto and Sasuke are on your battlefield, gain +1/+1.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "sakura_haruno"
          }
        ]
      }
    ],
    "target": {
      "type": "character",
      "side": "friendly"
    },
    "image": "art/hidden-leaf/sakura_haruno.webp"
  },
  {
    "id": "sasuke_uchiha",
    "name": "Sasuke Uchiha",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Evade. Arrival: If Naruto and Sakura are on your battlefield, gain +1/+1.",
    "art": "🍃",
    "jutsu": false,
    "attack": 4,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "sasuke_uchiha"
          }
        ]
      }
    ],
    "keywords": [
      "Evade"
    ],
    "image": "art/hidden-leaf/sasuke_uchiha.webp"
  },
  {
    "id": "kakashi_hatake",
    "name": "Kakashi Hatake",
    "faction": "Naruto",
    "type": "minion",
    "cost": 6,
    "text": "Evade. Arrival: Give your Naruto, Sasuke, and Sakura +1/+1. Whenever you cast a Jutsu, deal 1 damage to a random enemy.",
    "art": "🍃",
    "jutsu": false,
    "attack": 5,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "kakashi_hatake"
          }
        ]
      },
      {
        "on": "cardPlayed",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "kakashi_hatake"
          }
        ]
      }
    ],
    "keywords": [
      "Evade"
    ],
    "legendary": true,
    "image": "art/hidden-leaf/kakashi_hatake.webp"
  },
  {
    "id": "rock_lee",
    "name": "Rock Lee",
    "faction": "Naruto",
    "type": "minion",
    "cost": 2,
    "text": "Rush. After this attacks and survives, gain +1 Attack.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 2,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "rock_lee"
          }
        ]
      },
      {
        "on": "afterAttack",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "rock_lee"
          }
        ]
      }
    ],
    "keywords": [
      "Rush"
    ],
    "image": "art/hidden-leaf/rock_lee.webp"
  },
  {
    "id": "might_guy",
    "name": "Might Guy",
    "faction": "Naruto",
    "type": "minion",
    "cost": 5,
    "text": "Arrival: Give your Rock Lee +2/+2. Whenever a friendly minion attacks, give it +1 Attack this turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 5,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "might_guy"
          }
        ]
      },
      {
        "on": "attackDeclared",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "might_guy"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/might_guy.webp"
  },
  {
    "id": "hinata_hyuga",
    "name": "Hinata Hyuga",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Whenever Naruto takes damage, restore 2 Health to him. Arrival: Give an enemy minion -1 Attack until your next turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 4,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "hinata_hyuga"
          }
        ]
      },
      {
        "on": "damageDealt",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "hinata_hyuga"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/hinata_hyuga.webp"
  },
  {
    "id": "neji_hyuga",
    "name": "Neji Hyuga",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Evade. Whenever this attacks a minion, remove its keywords until your next turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 4,
    "health": 4,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "neji_hyuga"
          }
        ]
      },
      {
        "on": "attackDeclared",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "neji_hyuga"
          }
        ]
      }
    ],
    "keywords": [
      "Evade"
    ],
    "image": "art/hidden-leaf/neji_hyuga.webp"
  },
  {
    "id": "shikamaru_nara",
    "name": "Shikamaru Nara",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Arrival: Choose an enemy minion. It cannot attack during its controller’s next turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 4,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "shikamaru_nara"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/shikamaru_nara.webp"
  },
  {
    "id": "choji_akimichi",
    "name": "Choji Akimichi",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Taunt. Whenever this takes damage and survives, gain +1 Attack.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "choji_akimichi"
          }
        ]
      },
      {
        "on": "damageDealt",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "choji_akimichi"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/choji_akimichi.webp"
  },
  {
    "id": "ino_yamanaka",
    "name": "Ino Yamanaka",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Arrival: Take control of an enemy minion with 2 or less Attack until the end of your turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "ino_yamanaka"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy",
      "maxAttack": 2
    },
    "image": "art/hidden-leaf/ino_yamanaka.webp"
  },
  {
    "id": "kiba_inuzuka",
    "name": "Kiba Inuzuka",
    "faction": "Naruto",
    "type": "minion",
    "cost": 2,
    "text": "Arrival: Summon Akamaru, a 1/1 Beast with Rush.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 2,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "kiba_inuzuka"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/kiba_inuzuka.webp"
  },
  {
    "id": "shino_aburame",
    "name": "Shino Aburame",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Whenever this damages an enemy minion, give it -1 Attack permanently.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "shino_aburame"
          }
        ]
      },
      {
        "on": "damageDealt",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "shino_aburame"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/shino_aburame.webp"
  },
  {
    "id": "tenten",
    "name": "Tenten",
    "faction": "Naruto",
    "type": "minion",
    "cost": 2,
    "text": "Whenever you cast a Jutsu, deal 1 damage to a random enemy minion.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "tenten"
          }
        ]
      },
      {
        "on": "cardPlayed",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "tenten"
          }
        ]
      }
    ],
    "image": "art/hidden-leaf/tenten.webp"
  },
  {
    "id": "jiraiya",
    "name": "Jiraiya",
    "faction": "Naruto",
    "type": "minion",
    "cost": 7,
    "text": "Arrival: Summon two 2/2 Toads with Taunt. Whenever you cast a Jutsu, restore 2 Health to your Hero.",
    "art": "🍃",
    "jutsu": false,
    "attack": 6,
    "health": 6,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "jiraiya"
          }
        ]
      },
      {
        "on": "cardPlayed",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "jiraiya"
          }
        ]
      }
    ],
    "legendary": true,
    "image": "art/hidden-leaf/jiraiya.webp"
  },
  {
    "id": "tsunade",
    "name": "Tsunade",
    "faction": "Naruto",
    "type": "minion",
    "cost": 7,
    "text": "Arrival: Restore 5 Health to all friendly characters. Whenever a friendly minion is healed, give it +1 Attack.",
    "art": "🍃",
    "jutsu": false,
    "attack": 5,
    "health": 8,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "tsunade"
          }
        ]
      },
      {
        "on": "characterHealed",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "tsunade"
          }
        ]
      }
    ],
    "legendary": true,
    "image": "art/hidden-leaf/tsunade.webp"
  },
  {
    "id": "hiruzen_sarutobi",
    "name": "Hiruzen Sarutobi",
    "faction": "Naruto",
    "type": "minion",
    "cost": 8,
    "text": "Arrival: Deal 2 damage to all enemy minions. Your other friendly Leaf Village minions have +1/+1.",
    "art": "🍃",
    "jutsu": false,
    "attack": 6,
    "health": 7,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "hiruzen_sarutobi"
          }
        ]
      }
    ],
    "legendary": true,
    "image": "art/hidden-leaf/hiruzen_sarutobi.webp",
    "aura": {
      "target": {
        "minions": {
          "side": "friendly",
          "excludeSelf": true,
          "faction": "Naruto"
        }
      },
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "rasengan",
    "name": "Rasengan",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "Deal 1 damage to an enemy minion and Freeze it for 1 turn. When the Freeze ends, deal 3 damage to it.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "rasengan"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/rasengan.webp"
  },
  {
    "id": "sexy_jutsu",
    "name": "Sexy Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Give an enemy minion -2 Attack for 1 turn. Give a friendly Naruto +0/+1 and Taunt.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "sexy_jutsu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/sexy_jutsu.webp"
  },
  {
    "id": "harem_jutsu",
    "name": "Harem Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 4,
    "text": "Give all enemy minions -3 Attack for 1 turn. Give all friendly Naruto Uzumakis +0/+2 and Taunt.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "harem_jutsu"
      }
    ],
    "image": "art/hidden-leaf/harem_jutsu.webp"
  },
  {
    "id": "chidori",
    "name": "Chidori",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "Deal 4 damage to an enemy character. If Sasuke is on your battlefield, deal 2 more.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "chidori"
      }
    ],
    "target": {
      "type": "character",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/chidori.webp"
  },
  {
    "id": "shadow_clone_jutsu",
    "name": "Shadow Clone Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "Summon two 1/1 Shadow Clones. If Naruto is on your battlefield, summon two more.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "shadow_clone_jutsu"
      }
    ],
    "image": "art/hidden-leaf/shadow_clone_jutsu.webp"
  },
  {
    "id": "fire_style_fireball_jutsu",
    "name": "Fire Style: Fireball Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 4,
    "text": "Deal 3 damage to an enemy minion and 1 to adjacent enemies (2 instead if you control Sasuke).",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "fire_style_fireball_jutsu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/fire_style_fireball_jutsu.webp"
  },
  {
    "id": "substitution_jutsu",
    "name": "Substitution Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Quick Play: When a friendly minion is attacked, return it to your hand and summon a 0/2 Wooden Log with Taunt in its place.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "substitution_jutsu"
      }
    ],
    "image": "art/hidden-leaf/substitution_jutsu.webp",
    "quickPlay": {
      "windows": [
        "attackDeclared"
      ],
      "filter": {
        "player": "enemy",
        "target": {
          "side": "friendly"
        }
      }
    },
    "reactionOnly": true
  },
  {
    "id": "gentle_fist",
    "name": "Gentle Fist",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Give a friendly minion +2 Attack this turn. The next enemy minion it damages loses all keywords until your next turn.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "gentle_fist"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "image": "art/hidden-leaf/gentle_fist.webp"
  },
  {
    "id": "shadow_possession_jutsu",
    "name": "Shadow Possession Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "An enemy minion cannot attack or use activated abilities during its controller’s next turn. Draw a card.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "shadow_possession_jutsu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/shadow_possession_jutsu.webp"
  },
  {
    "id": "eight_gates_gate_of_opening",
    "name": "Eight Gates: Gate of Opening",
    "faction": "Naruto",
    "type": "spell",
    "cost": 4,
    "text": "Give a friendly minion +4 Attack and Rush this turn. At the end of the turn, deal 3 damage to it.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "eight_gates_gate_of_opening"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "image": "art/hidden-leaf/eight_gates_gate_of_opening.webp"
  },
  {
    "id": "summoning_jutsu_gamabunta",
    "name": "Summoning Jutsu: Gamabunta",
    "faction": "Naruto",
    "type": "spell",
    "cost": 7,
    "text": "Summon Gamabunta, a 7/7 Toad with Taunt. If you control Naruto or Jiraiya, give it Rush.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "summoning_jutsu_gamabunta"
      }
    ],
    "image": "art/hidden-leaf/summoning_jutsu_gamabunta.webp"
  },
  {
    "id": "thousand_years_of_death",
    "name": "Thousand Years of Death",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Deal 2 damage to an enemy minion. If it survives, return it to its owner’s hand. If you control Kakashi, draw a card.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "thousand_years_of_death"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "image": "art/hidden-leaf/thousand_years_of_death.webp"
  },
  {
    "id": "iruka_umino",
    "name": "Iruka Umino",
    "faction": "Naruto",
    "type": "minion",
    "cost": 2,
    "text": "Arrival: Give a friendly minion with 2 or less Attack +1/+1.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "iruka_umino"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly",
      "maxAttack": 2
    },
    "extra": true,
    "image": "art/hidden-leaf/iruka_umino.webp"
  },
  {
    "id": "anko_mitarashi",
    "name": "Anko Mitarashi",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Arrival: Deal 1 damage to an enemy minion. If it survives, give it Poisonous until the end of its next turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 3,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "anko_mitarashi"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "extra": true,
    "image": "art/hidden-leaf/anko_mitarashi.webp"
  },
  {
    "id": "asuma_sarutobi",
    "name": "Asuma Sarutobi",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Arrival: Give your Shikamaru, Ino, and Choji +1/+1. Whenever one of them attacks, deal 1 damage to its target before combat.",
    "art": "🍃",
    "jutsu": false,
    "attack": 4,
    "health": 4,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "asuma_sarutobi"
          }
        ]
      },
      {
        "on": "attackDeclared",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "asuma_sarutobi"
          }
        ]
      }
    ],
    "extra": true,
    "image": "art/hidden-leaf/asuma_sarutobi.webp"
  },
  {
    "id": "kurenai_yuhi",
    "name": "Kurenai Yuhi",
    "faction": "Naruto",
    "type": "minion",
    "cost": 4,
    "text": "Arrival: An enemy minion cannot attack during its controller’s next turn. If you control Hinata, Kiba, or Shino, draw a card.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "kurenai_yuhi"
          }
        ]
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "extra": true,
    "image": "art/hidden-leaf/kurenai_yuhi.webp"
  },
  {
    "id": "yamato",
    "name": "Yamato",
    "faction": "Naruto",
    "type": "minion",
    "cost": 5,
    "text": "Taunt. Arrival: Summon two 0/2 Wooden Barriers with Taunt.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 6,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "yamato"
          }
        ]
      }
    ],
    "keywords": [
      "Taunt"
    ],
    "extra": true,
    "image": "art/hidden-leaf/yamato.webp"
  },
  {
    "id": "sai",
    "name": "Sai",
    "faction": "Naruto",
    "type": "minion",
    "cost": 3,
    "text": "Arrival: Summon a 2/1 Ink Beast with Rush. Whenever you cast a Jutsu, give your Ink Beasts +1 Attack this turn.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 4,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "sai"
          }
        ]
      },
      {
        "on": "cardPlayed",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "sai"
          }
        ]
      }
    ],
    "extra": true,
    "image": "art/hidden-leaf/sai.webp"
  },
  {
    "id": "minato_namikaze",
    "name": "Minato Namikaze",
    "faction": "Naruto",
    "type": "minion",
    "cost": 7,
    "text": "Rush. Evade. Arrival: Return an enemy minion to its owner’s hand. When a friendly minion is attacked, you may swap its position with Minato, making Minato the new target.",
    "art": "🍃",
    "jutsu": false,
    "attack": 5,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "minato_namikaze"
          }
        ]
      },
      {
        "on": "attackDeclared",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "minato_namikaze"
          }
        ]
      }
    ],
    "keywords": [
      "Rush",
      "Evade"
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "legendary": true,
    "extra": true,
    "image": "art/hidden-leaf/minato_namikaze.webp"
  },
  {
    "id": "hashirama_senju",
    "name": "Hashirama Senju",
    "faction": "Naruto",
    "type": "minion",
    "cost": 9,
    "text": "Arrival: Summon two 3/5 Wood Golems with Taunt. At the end of your turn, restore 2 Health to all friendly minions.",
    "art": "🍃",
    "jutsu": false,
    "attack": 7,
    "health": 9,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "hashirama_senju"
          }
        ]
      },
      {
        "on": "endOfTurn",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "hashirama_senju"
          }
        ]
      }
    ],
    "legendary": true,
    "extra": true,
    "image": "art/hidden-leaf/hashirama_senju.webp"
  },
  {
    "id": "tobirama_senju",
    "name": "Tobirama Senju",
    "faction": "Naruto",
    "type": "minion",
    "cost": 7,
    "text": "Arrival: Deal 3 damage to all enemy minions. Whenever an enemy minion dies during your turn, summon a 1/1 Water Clone.",
    "art": "🍃",
    "jutsu": false,
    "attack": 6,
    "health": 6,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [
      {
        "on": "battlecry",
        "effects": [
          {
            "op": "naruto",
            "action": "tobirama_senju"
          }
        ]
      },
      {
        "on": "minionDied",
        "effects": [
          {
            "op": "naruto",
            "action": "event",
            "ability": "tobirama_senju"
          }
        ]
      }
    ],
    "legendary": true,
    "extra": true,
    "image": "art/hidden-leaf/tobirama_senju.webp"
  },
  {
    "id": "byakugan",
    "name": "Byakugan",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Reveal all enemy Stealth minions. Give a friendly minion +1 Attack and the ability to ignore Taunt this turn.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "byakugan"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "extra": true,
    "image": "art/hidden-leaf/byakugan.webp"
  },
  {
    "id": "eight_trigrams_sixty_four_palms",
    "name": "Eight Trigrams: Sixty-Four Palms",
    "faction": "Naruto",
    "type": "spell",
    "cost": 5,
    "text": "Deal 1 damage to an enemy minion eight times. If you control Neji or Hinata, that minion also loses all keywords.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "eight_trigrams_sixty_four_palms"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "extra": true,
    "image": "art/hidden-leaf/eight_trigrams_sixty_four_palms.webp"
  },
  {
    "id": "shadow_strangle_jutsu",
    "name": "Shadow Strangle Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 4,
    "text": "An enemy minion cannot attack during its controller’s next turn. Deal 3 damage to it at the start of your next turn.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "shadow_strangle_jutsu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "enemy"
    },
    "extra": true,
    "image": "art/hidden-leaf/shadow_strangle_jutsu.webp"
  },
  {
    "id": "expansion_jutsu",
    "name": "Expansion Jutsu",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "Give a friendly minion +2/+4 and Taunt until your next turn. If the target is Choji, the bonus is permanent.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "expansion_jutsu"
      }
    ],
    "target": {
      "type": "minion",
      "side": "friendly"
    },
    "extra": true,
    "image": "art/hidden-leaf/expansion_jutsu.webp"
  },
  {
    "id": "flying_thunder_god_technique",
    "name": "Flying Thunder God Technique",
    "faction": "Naruto",
    "type": "spell",
    "cost": 3,
    "text": "Quick Play: When a friendly minion is attacked, return it to your hand and deal 3 damage to the attacker. If you control Minato, return the attacker to its owner’s hand instead.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "flying_thunder_god_technique"
      }
    ],
    "extra": true,
    "image": "art/hidden-leaf/flying_thunder_god_technique.webp",
    "quickPlay": {
      "windows": [
        "attackDeclared"
      ],
      "filter": {
        "player": "enemy",
        "target": {
          "side": "friendly"
        }
      }
    },
    "reactionOnly": true
  },
  {
    "id": "wood_style_deep_forest_emergence",
    "name": "Wood Style: Deep Forest Emergence",
    "faction": "Naruto",
    "type": "spell",
    "cost": 8,
    "text": "Summon three 2/4 Wood Golems with Taunt. If you control Hashirama, give them +2/+2.",
    "art": "🍃",
    "jutsu": true,
    "effects": [
      {
        "op": "naruto",
        "action": "wood_style_deep_forest_emergence"
      }
    ],
    "extra": true,
    "image": "art/hidden-leaf/wood_style_deep_forest_emergence.webp"
  },
  {
    "id": "shadow_clone",
    "name": "Shadow Clone",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "No additional effect.",
    "art": "🍃",
    "jutsu": false,
    "attack": 1,
    "health": 1,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "image": "art/hidden-leaf/shadow_clone.webp",
    "token": true
  },
  {
    "id": "akamaru",
    "name": "Akamaru",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Rush.",
    "art": "🍃",
    "jutsu": false,
    "attack": 1,
    "health": 1,
    "tribes": [
      "Beast"
    ],
    "triggers": [],
    "keywords": [
      "Rush"
    ],
    "image": "art/hidden-leaf/akamaru.webp",
    "token": true
  },
  {
    "id": "summoned_toad",
    "name": "Summoned Toad",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Taunt.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 2,
    "tribes": [
      "Toad"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/summoned_toad.webp",
    "token": true
  },
  {
    "id": "wooden_log",
    "name": "Wooden Log",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Taunt. Cannot attack.",
    "art": "🍃",
    "jutsu": false,
    "attack": 0,
    "health": 2,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/wooden_log.webp",
    "token": true,
    "cantAttack": true
  },
  {
    "id": "gamabunta",
    "name": "Gamabunta",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Taunt.",
    "art": "🍃",
    "jutsu": false,
    "attack": 7,
    "health": 7,
    "tribes": [
      "Toad"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/gamabunta.webp",
    "token": true
  },
  {
    "id": "wooden_barrier",
    "name": "Wooden Barrier",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Taunt. Cannot attack.",
    "art": "🍃",
    "jutsu": false,
    "attack": 0,
    "health": 2,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/wooden_barrier.webp",
    "token": true,
    "cantAttack": true
  },
  {
    "id": "ink_beast",
    "name": "Ink Beast",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Rush.",
    "art": "🍃",
    "jutsu": false,
    "attack": 2,
    "health": 1,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "keywords": [
      "Rush"
    ],
    "image": "art/hidden-leaf/ink_beast.webp",
    "token": true
  },
  {
    "id": "wood_golem",
    "name": "Wood Golem",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "Taunt.",
    "art": "🍃",
    "jutsu": false,
    "attack": 3,
    "health": 5,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "keywords": [
      "Taunt"
    ],
    "image": "art/hidden-leaf/wood_golem.webp",
    "token": true
  },
  {
    "id": "water_clone",
    "name": "Water Clone",
    "faction": "Naruto",
    "type": "minion",
    "cost": 0,
    "text": "No additional effect.",
    "art": "🍃",
    "jutsu": false,
    "attack": 1,
    "health": 1,
    "tribes": [
      "Shinobi"
    ],
    "triggers": [],
    "image": "art/hidden-leaf/water_clone.webp",
    "token": true
  },
  {
    "id": "shadow_clone_technique",
    "name": "Shadow Clone Technique",
    "faction": "Naruto",
    "type": "spell",
    "cost": 2,
    "text": "Summon a 1/1 Shadow Clone.",
    "art": "🍃",
    "jutsu": false,
    "effects": [
      {
        "op": "naruto",
        "action": "shadow_clone_technique"
      }
    ],
    "heroSpell": true,
    "needsBoardSpace": true,
    "image": "art/hidden-leaf/shadow_clone.webp"
  }
];
