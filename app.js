const DB_NAME = "boussole-db";
const STORE = "logs";
const LANG_KEY = "boussole.lang";
const FALLBACK_KEY = "boussole.logs";
const SEED_KEY = "boussole.seeded";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const i18n = {
  fr: {
    hydration: "Hydratation",
    activity: "Activité",
    now: "maintenant",
    today: "aujourd'hui",
    yesterday: "hier",
    water: "Eau",
    electrolytes: "Électrolytes",
    substance: "Substance",
    add: "Ajouter",
    addWater: "Eau",
    addSubstance: "Substance",
    waterSub: "eau · électrolytes",
    substanceSub: "ajouter une prise",
    noEntries: "Aucune entrée pour l'instant. Ajoute un verre ou une prise quand tu veux garder le fil.",
    good: "Dernière eau il y a {time}. Tu tiens le cap.",
    nudge: "{time} sans eau —<br>un petit verre ?",
    warning: "Presque {time} sans eau. Bois quelque chose si tu peux.",
    noWater: "Pas encore d'eau notée — commence quand tu veux.",
    totalToday: "{amount} aujourd'hui",
    takes: "{count} prises",
    elecOk: "électrolytes ok",
    elecNudge: "pense au sel",
    pickSubstance: "Quelle substance ?",
    step1: "étape 1 sur 2",
    step2: "étape 2 sur 2",
    dose: "Dose",
    time: "Heure",
    current: "Maintenant",
    otherTime: "Autre heure",
    confirm: "Confirmer",
    back: "Retour",
    amount: "Quantité",
    format: "Format",
    language: "Langue",
    infoTitle: "Info",
    about: "Boussole garde les données sur cet appareil. Les messages sont informatifs, non médicaux, et pensés pour aider à espacer, boire et repérer les mélanges risqués.",
    offline: "Application PWA hors-ligne",
    source: "Sources",
    clearData: "Effacer les données",
    clearDone: "Données effacées.",
    rdrTitle: "Réduction des risques",
    rdrIntro: "Consulte les durées, effets et interactions. Les avertissements apparaissent aussi après ajout d'une prise récente.",
    recentLog: "Journal substances",
    interactions: "Mélange à surveiller",
    effects: "Effets",
    duration: "Durée",
    dosage: "Dosage",
    risks: "Risques",
    interactionsTitle: "Interactions",
    sourceLink: "Source Psychonautwiki"
  },
  en: {
    hydration: "Hydration",
    activity: "Activity",
    now: "now",
    today: "today",
    yesterday: "yesterday",
    water: "Water",
    electrolytes: "Electrolytes",
    substance: "Substance",
    add: "Add",
    addWater: "Water",
    addSubstance: "Substance",
    waterSub: "water · electrolytes",
    substanceSub: "log an intake",
    noEntries: "No entries yet. Add water or an intake whenever you want to keep track.",
    good: "Last water {time} ago. You're doing well.",
    nudge: "{time} without water —<br>maybe a small glass?",
    warning: "Almost {time} without water. Drink something if you can.",
    noWater: "No water logged yet — start whenever you want.",
    totalToday: "{amount} today",
    takes: "{count} logs",
    elecOk: "electrolytes ok",
    elecNudge: "think about salt",
    pickSubstance: "Which substance?",
    step1: "step 1 of 2",
    step2: "step 2 of 2",
    dose: "Dose",
    time: "Time",
    current: "Now",
    otherTime: "Other time",
    confirm: "Confirm",
    back: "Back",
    amount: "Amount",
    format: "Format",
    language: "Language",
    infoTitle: "Info",
    about: "Boussole keeps data on this device. Messages are informational, non-medical, and meant to help with spacing, hydration, and risky combinations.",
    offline: "Offline PWA",
    source: "Sources",
    clearData: "Clear data",
    clearDone: "Data cleared.",
    rdrTitle: "Harm reduction",
    rdrIntro: "Check durations, effects, and interactions. Warnings also appear after logging a recent intake.",
    recentLog: "Substance log",
    interactions: "Combination to watch",
    effects: "Effects",
    duration: "Duration",
    dosage: "Dosage",
    risks: "Risks",
    interactionsTitle: "Interactions",
    sourceLink: "Psychonautwiki source"
  }
};

const substances = {
  alcool: substance("🍺", "Alcool", "Alcohol", "oral", [
    dose("leger", "1 verre", "10 g ethanol", "light", "1 drink", "10 g ethanol"),
    dose("commun", "2 verres", "20 g ethanol", "common", "2 drinks", "20 g ethanol"),
    dose("fort", "4 verres", "40 g ethanol", "strong", "4 drinks", "40 g ethanol"),
    dose("lourd", "7+ verres", "70+ g ethanol", "heavy", "7+ drinks", "70+ g ethanol")
  ], "30-90 min", "3-6 h", "Désinhibition, détente, coordination réduite.", "Altération du jugement, nausées, black-out, déshydratation.", "Évite surtout kétamine, GHB/GBL, cocaïne et MDMA.", "https://psychonautwiki.org/wiki/Alcohol"),
  cannabis: substance("🌿", "Cannabis", "Cannabis", "fumé / comestible", [
    dose("leger", "¼ joint", "fumé", "light", "1/4 joint", "smoked"),
    dose("commun", "½ joint", "fumé", "common", "1/2 joint", "smoked"),
    dose("fort", "10 mg THC", "comestible", "strong", "10 mg THC", "edible"),
    dose("lourd", "20 mg THC", "comestible", "heavy", "20 mg THC", "edible")
  ], "0-60 min", "2-8 h", "Relaxation, modification des perceptions, appétit.", "Anxiété, paranoïa, somnolence. Les comestibles montent lentement.", "Peut intensifier fortement LSD et champignons.", "https://psychonautwiki.org/wiki/Cannabis"),
  ecstasy: substance("💊", "Ecstasy (MDMA)", "Ecstasy (MDMA)", "oral", [
    dose("leger", "½ taz", "~60 mg", "light", "1/2 pill", "~60 mg"),
    dose("commun", "1 taz", "~120 mg", "common", "1 pill", "~120 mg"),
    dose("fort", "1½ taz", "~180 mg", "strong", "1.5 pills", "~180 mg"),
    dose("lourd", "2 taz", "~240 mg", "heavy", "2 pills", "~240 mg")
  ], "20-70 min", "3-6 h", "Empathie, énergie, stimulation, chaleur corporelle.", "Déshydratation ou excès d'eau, hyperthermie, redose compulsive, pureté inconnue.", "Évite alcool, cocaïne, speed et 3-MMC.", "https://psychonautwiki.org/wiki/MDMA", "mdma"),
  mdma: substance("✨", "MDMA", "MDMA", "oral", [
    dose("leger", "60 mg", "léger", "light", "60 mg", "light"),
    dose("commun", "100 mg", "commun", "common", "100 mg", "common"),
    dose("fort", "140 mg", "fort", "strong", "140 mg", "strong"),
    dose("lourd", "180+ mg", "lourd", "heavy", "180+ mg", "heavy")
  ], "20-70 min", "3-6 h", "Empathie, énergie, stimulation.", "Hyperthermie, hyponatrémie, baisse de moral après coup.", "Évite alcool, cocaïne, speed et 3-MMC.", "https://psychonautwiki.org/wiki/MDMA", "mdma"),
  ketamine: substance("❄️", "Kétamine", "Ketamine", "sniffé / oral", [
    dose("leger", "1 bump", "~40 mg", "light", "1 bump", "~40 mg"),
    dose("commun", "2 bumps", "~80 mg", "common", "2 bumps", "~80 mg"),
    dose("fort", "150 mg", "sniffé", "strong", "150 mg", "snorted"),
    dose("lourd", "300 mg", "oral", "heavy", "300 mg", "oral")
  ], "5-30 min", "1-2 h", "Dissociation, flottement, anesthésie partielle.", "Chutes, confusion, nausées, perte de conscience à forte dose.", "Très risqué avec alcool ou dépresseurs.", "https://psychonautwiki.org/wiki/Ketamine"),
  cocaine: substance("▫️", "Cocaïne", "Cocaine", "sniffé / fumé", [
    dose("leger", "½ ligne", "~25 mg", "light", "1/2 line", "~25 mg"),
    dose("commun", "1 ligne", "~50 mg", "common", "1 line", "~50 mg"),
    dose("fort", "2 lignes", "~100 mg", "strong", "2 lines", "~100 mg"),
    dose("lourd", "3+ lignes", "150+ mg", "heavy", "3+ lines", "150+ mg")
  ], "1-15 min", "30-90 min", "Stimulation, confiance, vigilance.", "Anxiété, tension cardiaque, redoses fréquentes.", "Alcool forme de la cocaéthylène, plus toxique pour le coeur.", "https://psychonautwiki.org/wiki/Cocaine"),
  lsd: substance("🌈", "LSD", "LSD", "tab / goutte", [
    dose("leger", "½ tab", "~50 µg", "light", "1/2 tab", "~50 µg"),
    dose("commun", "1 tab", "~100 µg", "common", "1 tab", "~100 µg"),
    dose("fort", "2 tabs", "~200 µg", "strong", "2 tabs", "~200 µg"),
    dose("lourd", "3+ tabs", "300+ µg", "heavy", "3+ tabs", "300+ µg")
  ], "20-90 min", "8-12 h", "Visuels, pensée associative, émotions amplifiées.", "Anxiété, confusion, durée longue, environnement important.", "Cannabis peut potentialiser fortement l'expérience.", "https://psychonautwiki.org/wiki/LSD"),
  champignons: substance("🍄", "Champignons", "Mushrooms", "oral", [
    dose("leger", "0,5 g", "sec", "light", "0.5 g", "dried"),
    dose("commun", "1,5 g", "sec", "common", "1.5 g", "dried"),
    dose("fort", "3,5 g", "sec", "strong", "3.5 g", "dried"),
    dose("lourd", "5+ g", "sec", "heavy", "5+ g", "dried")
  ], "20-60 min", "4-6 h", "Visuels, introspection, émotions amplifiées.", "Nausées, anxiété, confusion selon contexte.", "Cannabis peut rendre l'expérience plus intense.", "https://psychonautwiki.org/wiki/Psilocybin_mushrooms"),
  speed: substance("⚡", "Speed", "Speed", "oral / sniffé", [
    dose("leger", "~10 mg", "oral", "light", "~10 mg", "oral"),
    dose("commun", "~25 mg", "oral", "common", "~25 mg", "oral"),
    dose("fort", "~50 mg", "oral", "strong", "~50 mg", "oral"),
    dose("lourd", "75+ mg", "oral", "heavy", "75+ mg", "oral")
  ], "10-60 min", "6-10 h", "Stimulation, endurance, baisse de fatigue.", "Tension cardiaque, mâchoire, insomnie, redoses.", "Évite MDMA et autres stimulants.", "https://psychonautwiki.org/wiki/Amphetamine"),
  "3mmc": substance("3️⃣", "3-MMC", "3-MMC", "oral / sniffé", [
    dose("leger", "75 mg", "oral", "light", "75 mg", "oral"),
    dose("commun", "150 mg", "oral", "common", "150 mg", "oral"),
    dose("fort", "250 mg", "oral", "strong", "250 mg", "oral"),
    dose("lourd", "350+ mg", "oral", "heavy", "350+ mg", "oral")
  ], "10-45 min", "2-4 h", "Stimulation, empathie, envie de parler.", "Redoses compulsives, tension, descente difficile.", "Évite MDMA et autres stimulants sérotoninergiques.", "https://psychonautwiki.org/wiki/3-MMC")
};

const interactionRules = [
  rule(["alcool", "ketamine"], "Tres dangereux", "Risque de perte de conscience.", "Very dangerous", "Higher risk of losing consciousness."),
  rule(["alcool", "mdma"], "Dangereux", "Augmente la déshydratation et la toxicité.", "Dangerous", "Increases dehydration and toxicity."),
  rule(["alcool", "cocaine"], "Tres dangereux", "Forme de la cocaéthylène, risque cardiaque.", "Very dangerous", "Forms cocaethylene, increasing cardiac risk."),
  rule(["mdma", "cocaine"], "Tres dangereux", "Surtension cardiovasculaire.", "Very dangerous", "Higher cardiovascular strain."),
  rule(["mdma", "3mmc"], "Tres dangereux", "Syndrome sérotoninergique potentiel.", "Very dangerous", "Potential serotonin syndrome risk."),
  rule(["cannabis", "lsd"], "Dangereux", "Potentialise fortement l'expérience.", "Dangerous", "Can strongly intensify the experience.")
];

const substanceInfo = {
  alcool: {
    category: { fr: "Dépresseur", en: "Depressant" },
    duration: [{ route: "Oral", onset: "15-30 min", duration: "~1h par verre standard" }],
    risks: [
      "Déshydratation accélérée — altère la rétention d'eau",
      "Très dangereux avec Kétamine et GHB/GBL",
      "Dangereux avec MDMA — augmente déshydratation et toxicité",
      "Forme de la cocaéthylène avec cocaïne — risque cardiaque"
    ],
    sensations: { fr: "Tu te sentiras d'abord plus léger(e) et confiant(e) — c'est la désinhibition qui commence. Les sons et les lumières te sembleront plus amusants. Au fur et à mesure, tes mouvements deviennent moins précis, ta vision peut se flouter, et ta conscience de l'espace se brouille. Si tu commences à avoir du mal à marcher droit, à bafouiller, ou que la pièce tourne, c'est que tu as peut-être trop bu. Assieds-toi près d'une toilette et reste hydraté(e). Important : tu vas perdre une partie de ton jugement — fixe tes limites AVANT de boire, et aie quelqu'un de confiance avec toi.", en: "You'll feel lighter and more confident at first — that's the disinhibition kicking in. Sounds and lights seem more fun. As you drink more, your movements become less precise, your vision may blur, and your spatial awareness fades. If you struggle to walk straight, slur your words, or feel the room spinning, you may have drunk too much. Sit near a bathroom and stay hydrated. Important: you'll lose some judgment — set your limits BEFORE drinking, and have someone trustworthy with you." }
  },
  cannabis: {
    category: { fr: "Psychédélique", en: "Psychedelic" },
    duration: [
      { route: "Fumé", onset: "5-10 min", duration: "1-3h" },
      { route: "Comestible", onset: "20-90 min", duration: "3-6h" }
    ],
    risks: ["Anxiété et paranoïa possibles", "Comestibles : onset lent, attention aux redoses", "Potentialise fortement LSD et champignons"],
    sensations: { fr: "Tes sens s'affinent — la musique te semble plus riche, les odeurs plus prononcées. Tu te sentiras plus lourd(e) mais décontracté(e). Tes pensées peuvent devenir lentes ou en boucle. Attention : le cannabis peut déclencher de l'anxiété ou de la paranoïa, surtout si tu n'as pas l'habitude. Si ça arrive, rappelle-toi que c'est temporaire, reste assis(e) dans un endroit sûr, contrôle ta respiration (inspire 4 sec, retiens 4 sec, expire 4 sec), et entouré(e) de gens de confiance. Avec les comestibles, la patience est cruciale — attends au moins 2 heures avant d'en reprendre, même si tu ne sens rien.", en: "Your senses sharpen — music sounds richer, smells more pronounced. You'll feel heavier but relaxed. Your thoughts may slow down or loop. Beware: cannabis can trigger anxiety or paranoia, especially if you're not used to it. If it happens, remember it's temporary, stay in a safe place, control your breathing (inhale 4 sec, hold 4 sec, exhale 4 sec), and surround yourself with trusted people. With edibles, patience is crucial — wait at least 2 hours before taking more, even if you feel nothing." }
  },
  ecstasy: {
    category: { fr: "Empathogène", en: "Empathogen" },
    duration: [{ route: "Oral", onset: "30-60 min", duration: "3-6h" }],
    risks: ["Composition inconnue — teste si possible", "Hyperthermie possible", "Boire 250-500 ml/h si tu bouges", "Redose risquée avant 3h"],
    sensations: { fr: "Tu vas sentir une montée progressive de bien-être — progressivement tu deviens plus social(e), plus connecté(e) aux autres, tu ressens de l'empathie intense. Ton corps te plaît — tu veux danser ou bouger. La transpiration peut être abondante. Tes muscles pourraient se crisper légèrement (particulièrement la mâchoire — attention à ton dentier si tu en as un). La première demi-heure peut être inconfortable ou donner de l'anxiété. Si tu transpires beaucoup, change de vêtements humides, reste hydraté(e) (250–500 ml/h), et prends des pauses régulières loin de la piste de danse. Si tu sens une trop forte augmentation de ta température corporelle ou des palpitations, va immédiatement en zone froide et demande de l'aide.", en: "You'll feel a gradual rise in well-being — progressively becoming more social, more connected to others, feeling intense empathy. You like your body — you want to dance or move. You might sweat heavily. Your muscles could tighten slightly (especially your jaw — watch out for teeth grinding). The first half-hour might feel uncomfortable or anxious. If you sweat a lot, change out of wet clothes, stay hydrated (250–500 ml/h), and take regular breaks away from the dance floor. If your body temperature spikes or you feel heart palpitations, go to a cool area immediately and ask for help." }
  },
  mdma: {
    category: { fr: "Empathogène", en: "Empathogen" },
    duration: [{ route: "Oral", onset: "30-60 min", duration: "3-6h" }],
    risks: ["Hyperthermie — pauses régulières", "Déshydratation ou excès d'eau", "Très dangereux avec 3-MMC", "Neurotoxicité potentielle à hautes doses répétées"],
    sensations: { fr: "Tu sentiras une montée progressive : d'abord une légère euphorie, puis une vague de bien-être physique et émotionnel. Tes sens s'aiguisent — les sons et les textures deviennent plus vifs. Tu pourrais transpirer, avoir les pupilles dilatées, ou grimacer involontairement. Si tu sens une montée d'anxiété au début, respire profondément — ça passe généralement en 20 min. Si tu sens ta température corporelle monter trop ou que tu commences à avoir un malaise, va immédiatement dans un endroit frais, assieds-toi, bois de l'eau lentement, et fais signe à quelqu'un de confiance.", en: "You'll feel a gradual rush: first light euphoria, then a wave of physical and emotional well-being. Your senses sharpen — sounds and textures become vivid. You might sweat, have dilated pupils, or grimace involuntarily. If you feel initial anxiety, breathe deeply — it usually passes in 20 min. If your body temperature rises too much or you feel unwell, go to a cool place immediately, sit down, drink water slowly, and signal someone you trust." }
  },
  ketamine: {
    category: { fr: "Dissociatif", en: "Dissociative" },
    duration: [
      { route: "Sniffé", onset: "5-15 min", duration: "45-90 min" },
      { route: "Oral", onset: "15-25 min", duration: "1-2h" }
    ],
    risks: ["Très dangereux avec alcool", "K-hole possible à forte dose", "Tolérance rapide", "Dépresseur du système nerveux central"],
    sensations: { fr: "Tu vas te sentir détaché(e) de ton corps — comme flotter ou observer la scène depuis l'extérieur. Les douleurs disparaissent. À faible dose, c'est léger et agréable. À dose plus élevée, la distorsion devient intense : le temps ralentit ou s'efface, les sons se déforment. À très hautes doses tu peux entrer dans un k-hole : tu ne peux presque plus bouger, tu es complètement détaché(e) du réel, mais conscient(e). C'est généralement inoffensif mais très désorienting. IMPORTANT : reste assis(e) à l'écart de la foule avant d'essayer, aie quelqu'un de confiance à proximité, et ne bouge pas si tu ne peux pas. Évite absolument de conduire ou nager. Si tu paniques dans un k-hole, rappelle-toi que c'est temporaire et tu récupéreras bientôt.", en: "You'll feel detached from your body — like floating or watching the scene from outside. Pain disappears. At low doses, it's light and pleasant. At higher doses, distortion becomes intense: time slows or vanishes, sounds warp. At very high doses you can enter a k-hole: you can barely move, you're completely disconnected from reality but conscious. It's usually harmless but very disorienting. IMPORTANT: sit away from the crowd before trying it, have someone trustworthy nearby, and don't move if you can't. Never drive or swim. If you panic in a k-hole, remember it's temporary and you'll recover soon." }
  },
  cocaine: {
    category: { fr: "Stimulant", en: "Stimulant" },
    duration: [
      { route: "Sniffé", onset: "1-5 min", duration: "20-45 min" },
      { route: "Fumé", onset: "<1 min", duration: "5-15 min" }
    ],
    risks: ["Redose compulsive fréquente", "Très dangereux avec alcool", "Très dangereux avec MDMA", "Risque cardiaque à hautes doses"],
    sensations: { fr: "L'effet est ultra-rapide et ultra-intense : tu te sentiras invulnérable, parfait(e), plein(e) d'énergie. Le high est extraordinaire mais fugace — généralement 15–30 min seulement. Ensuite tu veux redoser immédiatement. C'est le piège : la cocaïne crée un cycle redose très compulsif. Si tu commences à sentir des palpitations, une accélération du cœur très rapide, ou une anxiété intense, ARRÊTE. Demande de l'aide médicale si le cœur s'accélère dangereusement. Ne redose pas rapidement — attends au moins 30–45 min. Le lendemain tu seras épuisé(e) et déprimé(e). Attention : mixer avec l'alcool crée une toxine cardiaque (cocaéthylène) très dangereuse.", en: "The effect is ultra-fast and ultra-intense: you'll feel invincible, perfect, full of energy. The high is extraordinary but fleeting — usually only 15–30 min. Then you want to redose immediately. That's the trap: cocaine creates a very compulsive redose cycle. If you start feeling heart palpitations, very rapid heartbeat, or intense anxiety, STOP. Seek medical help if your heart accelerates dangerously. Don't redose quickly — wait at least 30–45 min. Tomorrow you'll be exhausted and depressed. Warning: mixing with alcohol creates a very dangerous heart toxin (cocaethylene)." }
  },
  lsd: {
    category: { fr: "Psychédélique", en: "Psychedelic" },
    duration: [{ route: "Oral", onset: "30-90 min", duration: "8-12h" }],
    risks: ["Bad trip possible — set & setting essentiels", "Ne pas redoser trop tôt", "Potentialisé par cannabis", "Durée longue — prévoir 12h"],
    sensations: { fr: "La montée est progressive — tu commenceras à sentir des changements subtils, une légère euphorie, puis la réalité se distordra lentement. Les couleurs deviennent plus vives, les motifs bougent, tes pensées deviennent associatives et imprévisibles. À plus hautes doses, les hallucinations deviennent très visuelles. Une bad trip peut survenir si tu es anxieux(se) ou mal à l'aise dans l'environnement : paranoia, boucles de pensées négatives, panique. C'est la raison pour laquelle ton état d'esprit (set) et ton environnement (setting) sont CRUCIAUX. Si tu commences à stresser, va dans un endroit calme, change d'environnement, parle à quelqu'un de confiance. La durée est très longue — 8–12h — donc planifie ta soirée sans obligations importantes. N'essaie pas de conduire. Si tu paniques, rappelle-toi que ce n'est que temporaire.", en: "The come-up is gradual — you'll start feeling subtle changes, light euphoria, then reality slowly distorts. Colors become vivid, patterns move, your thoughts become associative and unpredictable. At higher doses, hallucinations become very visual. A bad trip can happen if you're anxious or uncomfortable in your environment: paranoia, negative thought loops, panic. That's why your mindset (set) and environment (setting) are CRUCIAL. If you start stressing, go to a calm place, change your surroundings, talk to someone you trust. Duration is very long — 8–12h — so plan your evening without major obligations. Don't try to drive. If you panic, remember it's only temporary." }
  },
  champignons: {
    category: { fr: "Psychédélique", en: "Psychedelic" },
    duration: [{ route: "Oral", onset: "20-60 min", duration: "4-6h" }],
    risks: ["Anxiété et confusion possibles", "Set & setting critiques", "Potentialisé par cannabis"],
    sensations: { fr: "Tu seras envahi(e) par des pensées profondes et introspectives — le monde extérieur s'efface un peu et tes émotions remontent à la surface. Les hallucinations commencent légères (motifs qui bougent) puis deviennent plus intenses : géométries fractales, dissolution des limites entre toi et ton environnement. À hautes doses, l'expérience devient très intense et peut être écrasante. Tu pourrais te sentir vulnérable émotionnellement — c'est normal et c'est le but. Si tu te sens paniqué(e) ou dépassé(e), reste couché(e), respire profondément, rappelle-toi que c'est temporaire, et demande du soutien. Le crash d'anxiété peut être puissant à hautes doses. Espace-toi suffisamment de responsabilités. Aie un espace calme, sombre, et une personne de confiance à proximité.", en: "You'll be flooded with deep, introspective thoughts — the outside world fades a bit and your emotions rise to the surface. Hallucinations start light (moving patterns) then become more intense: fractal geometries, dissolving boundaries between you and your surroundings. At high doses, the experience becomes very intense and can feel overwhelming. You might feel emotionally vulnerable — that's normal and part of it. If you feel panicked or overwhelmed, lie down, breathe deeply, remember it's temporary, and ask for support. Anxiety can spike at high doses. Give yourself space from responsibilities. Have a quiet, dark space and a trusted person nearby." }
  },
  speed: {
    category: { fr: "Stimulant", en: "Stimulant" },
    duration: [
      { route: "Oral", onset: "30-60 min", duration: "4-8h" },
      { route: "Sniffé", onset: "5-10 min", duration: "3-5h" }
    ],
    risks: ["Crash brutal après — fatigue extrême, dépression possible", "Surtension cardiovasculaire à hautes doses", "Forte tendance au redosage — risque de consommation compulsive"],
    sensations: { fr: "Tu sentiras une montée d'énergie et de clarté mentale. Ton cœur s'accélère légèrement, tu te sens invulnérable et super social. La fatigue disparaît — ce qui te permet de danser ou de rester actif pendant longtemps. Attention : cette impression d'énergie infinie est une illusion. Ton corps se fatigue réellement. Si tu sens que ton cœur s'accélère trop, que tu as des tremblements, ou que tu sèches la bouche extrêmement, prends une pause, assieds-toi, bois de l'eau. Le lendemain tu seras très fatigué(e) — anticipe un repos complet.", en: "You'll feel a rush of energy and mental clarity. Your heart races slightly, you feel invincible and super social. Fatigue disappears — letting you dance or stay active for hours. Warning: this feeling of infinite energy is an illusion. Your body is actually tiring out. If your heart races too much, you shake, or you're extremely dry-mouthed, take a break, sit down, drink water. Tomorrow you'll be exhausted — plan for full rest." }
  },
  "3mmc": {
    category: { fr: "Stimulant · Empathogène", en: "Stimulant · Empathogen" },
    duration: [
      { route: "Oral", onset: "20-40 min", duration: "2-4h" },
      { route: "Sniffé", onset: "5-15 min", duration: "1-2h" }
    ],
    risks: ["Très forte envie de redoser", "Très dangereux avec MDMA", "Risque cardiovasculaire à hautes doses"],
    sensations: { fr: "Tu te sentiras rapidement boosté(e) : euphorie, énergie, forte envie de parler et de socialiser. C'est comme une version courte du MDMA. Le problème : la durée est courte (2–4h) donc tu repars en crash rapidement, et c'est extrêmement addictif mentalement. L'envie de redoser est compulsive — beaucoup de gens finissent par en reprendre plusieurs fois dans la nuit. Si tu commences à sentir ton cœur s'emballer, de la paranoia, ou de l'anxiété intense, arrête complètement. Fixe-toi une limite AVANT de commencer (par exemple, une seule prise) et aie quelqu'un qui peut te dire non si tu tries de redoser. Le lendemain tu seras très fatigué(e) et déprimé(e). La 3-MMC est neurotoxique répétée — évite les usages fréquents.", en: "You'll quickly feel boosted: euphoria, energy, strong urge to talk and socialize. It's like a shorter version of MDMA. The problem: the duration is short (2–4h) so you come down quickly, and it's extremely mentally addictive. The urge to redose is compulsive — many people end up taking it multiple times in one night. If you start feeling your heart racing, paranoia, or intense anxiety, stop completely. Set a limit BEFORE you start (like one dose only) and have someone who can tell you 'no' if you try to redose. Tomorrow you'll be exhausted and depressed. 3-MMC is neurotoxic with repeated use — avoid frequent use." }
  }
};

let state = {
  lang: localStorage.getItem(LANG_KEY) || "fr",
  logs: [],
  selectedEntry: null,
  lastWarning: null,
  pendingRdrSubstance: null
};

let dbPromise;
let waveAnimation = 0;
let sheetResetTimer = 0;

function substance(icon, fr, en, route, doses, onset, duration, effects, risks, interactions, source, family) {
  return { icon, family: family || null, name: { fr, en }, route, doses, onset, duration, effects, risks, interactions, source };
}

function dose(key, frLabel, frDetail, enLabel, enDetail, enMeta) {
  return {
    key,
    label: { fr: frLabel, en: enLabel },
    detail: { fr: frDetail, en: enDetail },
    meta: { fr: frDetail, en: enMeta || enDetail }
  };
}

function rule(ids, levelFr, textFr, levelEn, textEn) {
  return { ids, level: { fr: levelFr, en: levelEn }, text: { fr: textFr, en: textEn } };
}

function t(key, values = {}) {
  let text = i18n[state.lang][key] || i18n.fr[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, value);
  });
  return text;
}

function labelForDose(key) {
  const map = {
    fr: { leger: "léger", commun: "commun", fort: "fort", lourd: "lourd" },
    en: { leger: "light", commun: "common", fort: "strong", lourd: "heavy" }
  };
  return map[state.lang][key] || key;
}

function cssDose(key) {
  return ({ leger: "dose-leger", commun: "dose-commun", fort: "dose-fort", lourd: "dose-lourd" })[key] || "dose-commun";
}

async function openDb() {
  if (!("indexedDB" in window)) return null;
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

async function getLogs() {
  try {
    const db = await openDb();
    if (!db) return JSON.parse(localStorage.getItem(FALLBACK_KEY) || "[]");
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return JSON.parse(localStorage.getItem(FALLBACK_KEY) || "[]");
  }
}

async function putLog(entry) {
  state.logs.push(entry);
  await saveLog(entry);
  render();
}

async function saveLog(entry) {
  try {
    const db = await openDb();
    if (!db) throw new Error("No IndexedDB");
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state.logs));
  }
}

async function clearLogs() {
  state.logs = [];
  state.lastWarning = null;
  localStorage.setItem(SEED_KEY, "1");
  try {
    const db = await openDb();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch {
    localStorage.removeItem(FALLBACK_KEY);
  }
  render();
}

function seedLogs() {
  if (state.logs.length || localStorage.getItem(SEED_KEY)) return;
  const now = new Date();
  state.logs = [
    substanceEntry("cannabis", substances.cannabis.doses[0], offsetDate(now, -22 * 60)),
    waterEntry(500, offsetDate(now, -(19 * 60 + 40))),
    waterEntry(750, offsetDate(now, -5 * 60)),
    electrolyteEntry("1 sachet", offsetDate(now, -(4 * 60 + 30))),
    substanceEntry("ecstasy", substances.ecstasy.doses[1], offsetDate(now, -4 * 60)),
    waterEntry(500, offsetDate(now, -(2 * 60 + 30)))
  ];
}

function offsetDate(reference, minutesOffset) {
  const date = new Date(reference);
  date.setMinutes(date.getMinutes() + minutesOffset, 0, 0);
  return date;
}

function waterEntry(amount, date) {
  return {
    id: crypto.randomUUID(),
    type: "water",
    amount,
    detail: `${amount} ml`,
    createdAt: new Date().toISOString(),
    occurredAt: date.toISOString()
  };
}

function electrolyteEntry(detail, date) {
  return {
    id: crypto.randomUUID(),
    type: "electrolyte",
    detail,
    createdAt: new Date().toISOString(),
    occurredAt: date.toISOString()
  };
}

function substanceEntry(substanceId, selectedDose, date) {
  return {
    id: crypto.randomUUID(),
    type: "substance",
    substanceId,
    family: substances[substanceId].family,
    doseKey: selectedDose.key,
    doseLabel: selectedDose.label,
    doseDetail: selectedDose.detail,
    createdAt: new Date().toISOString(),
    occurredAt: date.toISOString()
  };
}

function sortedLogs(filter) {
  return state.logs
    .filter((entry) => !filter || filter(entry))
    .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));
}

function getRoute() {
  const hash = location.hash || "#/";
  if (hash.startsWith("#/substances/")) return { name: "substance", id: decodeURIComponent(hash.replace("#/substances/", "")) };
  if (hash === "#/rdr") return { name: "rdr" };
  if (hash === "#/info") return { name: "info" };
  return { name: "home" };
}

function render() {
  document.documentElement.lang = state.lang;

  const route = getRoute();
  $("#app").dataset.screen = route.name;
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.route === route.name || (route.name === "substance" && item.dataset.route === "rdr")));

  if (route.name === "rdr") renderRdr();
  else if (route.name === "info") renderInfo();
  else if (route.name === "substance") renderSubstancePage(route.id);
  else renderHome();

  renderActions(route);
  renderSheetRoot();
  window.requestAnimationFrame(initWave);
}

function renderHome() {
  $("#app").innerHTML = `
    ${hydrationCard()}
    <section>
      <div class="section-head">
        <h1 class="section-title">${t("activity")}</h1>
      </div>
      ${streamMarkup(sortedLogs())}
    </section>
    ${state.lastWarning ? warningMarkup(state.lastWarning) : ""}
    <div class="scroll-end-spacer"></div>
  `;
}

function hydrationCard() {
  const waterLogs = sortedLogs((entry) => entry.type === "water");
  const lastWater = waterLogs[waterLogs.length - 1];
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayWater = waterLogs.filter((entry) => new Date(entry.occurredAt) >= todayStart);
  const total = todayWater.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const elecToday = state.logs.some((entry) => entry.type === "electrolyte" && new Date(entry.occurredAt) >= todayStart);
  const totalLabel = formatWater(total);
  const takeCount = todayWater.length;
  let message = t("noWater");

  if (lastWater) {
    const hours = (now.getTime() - new Date(lastWater.occurredAt).getTime()) / 3600000;
    const time = relativeDuration(new Date(lastWater.occurredAt), true);
    if (hours >= 4.75) message = t("warning", { time });
    else if (hours >= 2.5) message = t("nudge", { time });
    else message = t("good", { time });
  }

  return `
    <section class="hydration-card" aria-label="${t("hydration")}">
      <div class="card-eyebrow">💧 ${t("hydration")}</div>
      <div class="card-message">${highlightFirstTime(message)}</div>
      <div class="card-stats">
        <span class="stat-pill water-pill">🌊 ${t("totalToday", { amount: totalLabel })}</span>
        <span class="stat-pill takes-pill">${t("takes", { count: takeCount })}</span>
        <span class="stat-pill elec-pill">🧂 ${elecToday || total < 1500 ? t("elecOk") : t("elecNudge")}</span>
      </div>
      <div class="wave-bg"><div class="wave-bg-shape w1"></div><div class="wave-bg-shape w2"></div></div>
    </section>
  `;
}

function highlightFirstTime(text) {
  return text.replace(/(\d+h\d*|\d+min|[0-9.,]+ h)/, "<em>$1</em>");
}

function renderRdr() {
  $("#app").innerHTML = `
    <section class="rdr-intro">
      <div class="rdr-title">${t("rdrTitle")}</div>
      <div class="rdr-subtitle">${state.lang === "fr"
        ? "Infos sur les effets, doses et risques de chaque substance. Données tirées de Psychonautwiki, sans jugement."
        : "Information about effects, doses, and risks for each substance. Based on Psychonautwiki, without judgement."}</div>
    </section>
    <section>
      <div class="section-label">${state.lang === "fr" ? "Substances" : "Substances"}</div>
      <div class="rdr-substance-grid">
        ${Object.entries(substances).map(([id, sub]) => {
          const info = substanceInfo[id];
          const duration = info?.duration?.[0]?.duration || sub.duration;
          return `
            <button class="substance-card" data-action="open-rdr-info" data-info-substance="${id}">
              <span class="card-icon">${sub.icon}</span>
              <span class="card-name">${rdrSubstanceName(id)}</span>
              <span class="card-meta">
                <span class="card-category">${info?.category?.[state.lang] || sub.route}</span>
                <span class="card-duration">${duration}</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
    <div class="scroll-end-spacer"></div>
  `;
  if (state.pendingRdrSubstance) {
    const id = state.pendingRdrSubstance;
    state.pendingRdrSubstance = null;
    requestAnimationFrame(() => openRdrInfo(id));
  }
}

function rdrSubstanceName(id) {
  if (id === "ecstasy") return "Ecstasy";
  return substances[id]?.name[state.lang] || id;
}

function renderInfo() {
  $("#app").innerHTML = `
    <div class="section-label">${state.lang === "fr" ? "À propos" : "About"}</div>
    <section class="about-card">
      <div class="about-text about-lead">${state.lang === "fr" ? "Profite à fond. Reste prudent·e. Veille sur les autres ! ✨" : "Have fun. Stay aware. Look out for others! ✨"}</div>
      <div class="about-text">${state.lang === "fr" ? "Une boussole pour naviguer ton festival. Tu peux suivre ton hydratation et tes prises. Pour un voyage plus safe, tu peux trouver les effets, doses approximatives et contre-indications. Les données ne quittent pas ton téléphone." : "A compass for navigating your festival. For a safer journey, you can find the effects, approximative doses, and counter-indications. Your data does not leave your phone. ."}</div>
      <div class="about-text">${state.lang === "fr" ? "Cette app ne remplace pas un professionnel de santé. En cas de doute, rapproche toi de l'organisation ou appelle le 15." : "This app does not replace medical advice. If in doubt, contact the staff or call local emergency services."}</div>
      <div class="about-version">v1.0.0 · Open source · ${state.lang === "fr" ? "Fait avec ❤️ pour la fête" : "Made with ❤️ for safer parties"}</div>
    </section>

    <div class="section-label">${t("language")}</div>
    <section class="settings-card">
      <div class="settings-row is-static">
        <span class="row-icon">🌐</span>
        <div class="row-body">
          <div class="row-label">${state.lang === "fr" ? "Langue de l'app" : "App language"}</div>
        </div>
        <div class="row-right">
          <div class="lang-toggle">
            <button class="lang-btn ${state.lang === "fr" ? "active" : ""}" data-action="set-lang" data-lang="fr">FR</button>
            <button class="lang-btn ${state.lang === "en" ? "active" : ""}" data-action="set-lang" data-lang="en">EN</button>
          </div>
        </div>
      </div>
    </section>

    <div class="section-label">${state.lang === "fr" ? "Urgences" : "Emergency"}</div>
    <section class="emergency-card">
      <div class="emergency-header">
        <span class="emergency-icon">🚨</span>
        <div>
          <div class="emergency-title">${state.lang === "fr" ? "Si quelque chose tourne mal" : "If something goes wrong"}</div>
          <div class="emergency-subtitle">${state.lang === "fr" ? "Numéros utiles · signets pour zones sans réseau" : "Useful numbers · bookmarks for low-signal areas"}</div>
        </div>
      </div>
      <div class="emergency-contacts">
        <a class="emergency-row" href="tel:15">
          <span class="emergency-row-icon">🏥</span>
          <span class="emergency-row-body"><span class="emergency-row-name">SAMU</span><span class="emergency-row-detail">${state.lang === "fr" ? "Urgence médicale · France" : "Medical emergency · France"}</span></span>
          <span class="emergency-row-number">15</span>
        </a>
        <a class="emergency-row" href="tel:3114">
          <span class="emergency-row-icon">💬</span>
          <span class="emergency-row-body"><span class="emergency-row-name">3114</span><span class="emergency-row-detail">${state.lang === "fr" ? "Numéro national de prévention du suicide" : "National suicide prevention hotline"}</span></span>
          <span class="emergency-row-number">3114</span>
        </a>
        <div class="emergency-row is-static">
          <span class="emergency-row-icon">⛺</span>
          <span class="emergency-row-body"><span class="emergency-row-name">${state.lang === "fr" ? "Medic de festival" : "Festival medic"}</span><span class="emergency-row-detail">${state.lang === "fr" ? "Emplacement et contact à définir sur place" : "Location and contact to fill in on site"}</span></span>
          <span class="emergency-row-number is-muted">—</span>
        </div>
      </div>
      <div class="emergency-note">${state.lang === "fr" ? "En cas de surdose ou de malaise grave : allonge la personne en position latérale de sécurité et appelle le 15. Ne la laisse jamais seule." : "In case of overdose or serious distress: place the person in recovery position and call emergency services. Never leave them alone."}</div>
    </section>

    <div class="section-label">${t("source")}</div>
    <section class="settings-card">
      <a class="settings-row" href="https://psychonautwiki.org" target="_blank" rel="noreferrer">
        <span class="row-icon">📖</span>
        <span class="row-body"><span class="row-label">Psychonautwiki</span><span class="row-sub">${state.lang === "fr" ? "Source principale des données substances" : "Main source for substance data"}</span></span>
        <span class="row-right"><span class="row-chevron">›</span></span>
      </a>
      <a class="settings-row" href="https://www.drogues-info-service.fr" target="_blank" rel="noreferrer">
        <span class="row-icon">🧪</span>
        <span class="row-body"><span class="row-label">DroguesInfo Service</span><span class="row-sub">0 800 23 13 13 · ${state.lang === "fr" ? "gratuit, anonyme" : "free, anonymous"}</span></span>
        <span class="row-right"><span class="row-chevron">›</span></span>
      </a>
    </section>

    <div class="section-label">${state.lang === "fr" ? "Partager" : "Share"}</div>
    <section class="qr-card">
      <div class="qr-code"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h29v29H0z"/><path stroke="#000000" d="M0 0.5h7m2 0h1m1 0h1m1 0h1m2 0h1m2 0h1m2 0h7M0 1.5h1m5 0h1m4 0h5m1 0h2m3 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m2 0h2m2 0h1m2 0h5m1 0h1m1 0h3m1 0h1M0 3.5h1m1 0h3m1 0h1m3 0h6m2 0h1m3 0h1m1 0h3m1 0h1M0 4.5h1m1 0h3m1 0h1m2 0h2m1 0h3m1 0h3m3 0h1m1 0h3m1 0h1M0 5.5h1m5 0h1m1 0h3m2 0h2m4 0h1m2 0h1m5 0h1M0 6.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 7.5h1m2 0h1m1 0h1m2 0h2m1 0h1M0 8.5h1m2 0h1m1 0h2m1 0h1m2 0h1m3 0h2m4 0h1m1 0h1M0 9.5h5m2 0h1m1 0h1m2 0h1m1 0h2m4 0h1m1 0h1m2 0h1m2 0h1M0 10.5h1m1 0h3m1 0h1m2 0h1m1 0h2m3 0h2m1 0h2m2 0h1m1 0h3M1 11.5h2m2 0h1m2 0h5m1 0h1m1 0h1m2 0h1m2 0h1m3 0h2M0 12.5h2m1 0h2m1 0h1m1 0h4m3 0h3m1 0h5m1 0h1m1 0h2M1 13.5h1m5 0h1m2 0h3m6 0h3M1 14.5h1m1 0h1m1 0h3m1 0h2m1 0h1m4 0h1m2 0h2m2 0h5M0 15.5h1m2 0h3m1 0h2m1 0h6m1 0h3m2 0h1m2 0h1m1 0h1M0 16.5h2m1 0h1m1 0h4m2 0h1m1 0h3m1 0h1m1 0h3m1 0h1m3 0h1M5 17.5h1m3 0h1m6 0h2m3 0h3m1 0h1m2 0h1M0 18.5h1m1 0h1m1 0h6m1 0h1m1 0h1m2 0h2m2 0h2m1 0h1m3 0h2M2 19.5h1m1 0h2m2 0h6m3 0h6m1 0h1m2 0h2M0 20.5h1m1 0h2m1 0h3m2 0h1m1 0h1m1 0h3m3 0h5m1 0h1M8 21.5h4m1 0h1m3 0h2m1 0h1m3 0h1m1 0h3M0 22.5h7m2 0h6m5 0h1m1 0h1m1 0h1m2 0h1M0 23.5h1m5 0h1m1 0h2m3 0h1m1 0h2m1 0h1m1 0h1m3 0h5M0 24.5h1m1 0h3m1 0h1m2 0h1m1 0h2m1 0h1m2 0h1m2 0h5m3 0h1M0 25.5h1m1 0h3m1 0h1m1 0h2m3 0h2m2 0h2m1 0h1m1 0h6M0 26.5h1m1 0h3m1 0h1m2 0h2m2 0h2m3 0h3m3 0h3m1 0h1M0 27.5h1m5 0h1m3 0h1m1 0h1m2 0h3m1 0h2m2 0h2m2 0h1M0 28.5h7m1 0h1m4 0h2m2 0h1m1 0h3m2 0h2m1 0h1"/></svg></div>
      <div class="qr-url">boussole.valentinmouret.io</div>
      <div class="qr-caption">${state.lang === "fr" ? "Scanner pour ouvrir l'app" : "Scan to open the app"}</div>
    </section>

    <div class="section-label">${state.lang === "fr" ? "Données" : "Data"}</div>
    <section class="settings-card">
      <button class="settings-row danger" data-action="open-clear-confirm">
        <span class="row-icon">🗑️</span>
        <span class="row-body"><span class="row-label">${state.lang === "fr" ? "Effacer toutes les données" : "Clear all data"}</span><span class="row-sub">${state.lang === "fr" ? "Journal, historique, préférences" : "Logs, history, preferences"}</span></span>
      </button>
    </section>
  `;
}

function renderSubstancePage(id) {
  const sub = substances[id];
  const info = substanceInfo[id];
  if (!sub) {
    location.hash = "#/rdr";
    return;
  }
  const sensations = info?.sensations?.[state.lang] || "";
  $("#app").innerHTML = `
    <article class="substance-page screen-card">
      <a class="back-btn" href="#/rdr">← ${t("back")}</a>
      <h1>${sub.icon} ${sub.name[state.lang]}</h1>
      <p>${sub.route} · ${sub.onset} · ${sub.duration}</p>
      <ul class="detail-list">
        <li><strong>${t("effects")}</strong><p>${sub.effects}</p></li>
        ${sensations ? `<li><strong>${state.lang === "fr" ? "Ce que tu vas ressentir" : "What you might feel"}</strong><p>${sensations}</p></li>` : ""}
        <li><strong>${t("duration")}</strong><p>${sub.onset} onset · ${sub.duration}</p></li>
        <li><strong>${t("dosage")}</strong><p>${sub.doses.map((item) => `${labelForDose(item.key)}: ${item.label[state.lang]} (${item.detail[state.lang]})`).join(" · ")}</p></li>
        <li><strong>${t("risks")}</strong><p>${(info?.risks || []).join(" · ") || sub.risks}</p></li>
        <li><strong>${t("interactionsTitle")}</strong><p>${sub.interactions}</p></li>
      </ul>
      <p><a class="source-link" href="${sub.source}" target="_blank" rel="noreferrer">${t("sourceLink")}</a></p>
    </article>
  `;
}

function renderActions(route) {
  const visible = route.name === "home";
  $("#actionBar").style.display = visible ? "grid" : "none";
  if (!visible) {
    $("#actionBar").innerHTML = "";
    return;
  }
  $("#actionBar").innerHTML = `
    <button class="add-btn water" data-action="open-water">
      <span class="add-plus">+</span>
      <span class="add-text"><span class="add-label">${t("addWater")}</span><span class="add-sub">${t("waterSub")}</span></span>
    </button>
    <button class="add-btn substance" data-action="open-substance">
      <span class="add-plus">+</span>
      <span class="add-text"><span class="add-label">${t("addSubstance")}</span><span class="add-sub">${t("substanceSub")}</span></span>
    </button>
  `;
}

function streamMarkup(logs) {
  const rows = logs.map((entry, index) => {
    const previous = logs[index - 1];
    const separatorLabel = timeSeparator(entry.occurredAt);
    const previousSeparatorLabel = previous ? timeSeparator(previous.occurredAt) : "";
    const separator = !previous || separatorLabel !== previousSeparatorLabel
      ? `<div class="stream-sep"><span class="stream-sep-label">${separatorLabel}</span><div class="stream-sep-line"></div></div>`
      : "";
    return `${separator}${entryMarkup(entry)}`;
  }).join("");

  return `
    <div class="stream" id="stream">
      <canvas class="wave-canvas" id="waveCanvas"></canvas>
      ${rows || `<div class="empty-state">${t("noEntries")}</div>`}
      <div class="stream-now"><span class="stream-now-label">${t("now")} · ${clock(new Date())}</span><div class="stream-now-line"></div></div>
    </div>
  `;
}

function entryMarkup(entry) {
  const type = entry.type === "electrolyte" ? "electrolyte" : entry.type;
  const title = entryTitle(entry);
  const detail = entryDetail(entry);
  return `
    <button class="stream-entry" data-entry="${entry.id}" data-type="${type}">
      <span class="entry-spacer"></span>
      <span class="entry-body">
        <span class="entry-name">${title}</span>
        <span class="entry-detail">${detail}</span>
      </span>
      <span class="entry-time">${relativeLabel(new Date(entry.occurredAt))}</span>
    </button>
  `;
}

function entryTitle(entry) {
  if (entry.type === "water") return t("water");
  if (entry.type === "electrolyte") return t("electrolytes");
  return substances[entry.substanceId]?.name[state.lang] || entry.substanceId;
}

function entryDetail(entry) {
  if (entry.type === "substance") {
    return `${entry.doseLabel[state.lang]} · ${entry.doseDetail[state.lang]} <span class="dose-badge ${cssDose(entry.doseKey)}">${labelForDose(entry.doseKey)}</span>`;
  }
  return entry.detail;
}

function warningMarkup(warning) {
  return `
    <section class="warning-card">
      <strong>${t("interactions")} · ${warning.level[state.lang]}</strong>
      <p>${warning.text[state.lang]}</p>
    </section>
  `;
}

function timeSeparator(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = date.toDateString() === today.toDateString();
  const wasYesterday = date.toDateString() === yesterday.toDateString();
  const label = sameDay ? t("today") : wasYesterday ? t("yesterday") : new Intl.DateTimeFormat(state.lang === "fr" ? "fr-FR" : "en-US", { day: "2-digit", month: "short" }).format(date);
  const hour = sameDay && date.getMinutes() >= 30 ? date.getHours() + 1 : date.getHours();
  return `${label} · ${hour}h`;
}

function clock(date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function relativeLabel(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 0) return clock(date);
  if (diff < 60 * 60 * 1000) return state.lang === "fr" ? `il y a ${Math.max(1, Math.round(diff / 60000))}min` : `${Math.max(1, Math.round(diff / 60000))}m ago`;
  if (diff < 24 * 60 * 60 * 1000) return state.lang === "fr" ? `il y a ${relativeDuration(date, true)}` : `${relativeDuration(date, true)} ago`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const label = date.toDateString() === yesterday.toDateString() ? t("yesterday") : timeSeparator(date.toISOString()).split(" · ")[0];
  return `${label} ${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
}

function relativeDuration(date) {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
}

function formatWater(amount) {
  if (amount >= 1000) return `${(amount / 1000).toLocaleString(state.lang === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 1 })} L`;
  return `${amount} ml`;
}

function renderSheetRoot() {
  $("#sheetRoot").innerHTML = `
    <div class="sheet-overlay" id="waterOverlay">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="waterTitle">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <div class="sheet-title" id="waterTitle">${t("add")}</div>
          <button class="sheet-close" data-action="close-sheet" aria-label="Fermer">x</button>
        </div>
        <form class="sheet-body" data-form="water" novalidate>
          <div class="type-toggle">
            <button type="button" class="type-btn sel-water" data-water-type="water"><span class="type-btn-icon">💧</span><span class="type-btn-text"><span class="type-btn-label">${t("water")}</span><span class="type-btn-sub">ml</span></span></button>
            <button type="button" class="type-btn" data-water-type="electrolyte"><span class="type-btn-icon">🧂</span><span class="type-btn-text"><span class="type-btn-label">${t("electrolytes")}</span><span class="type-btn-sub">sachet · comprimé</span></span></button>
          </div>
          <div data-water-panel="water">
            <div class="sheet-label">${t("amount")}</div>
            <div class="preset-grid">
              ${[250, 500, 750, 1000].map((amount) => `<button type="button" class="preset-btn" data-amount="${amount}"><span class="pval">${amount === 1000 ? "1" : amount}</span><span class="punit">${amount === 1000 ? "litre" : "ml"}</span></button>`).join("")}
              <button type="button" class="preset-btn autre" data-amount="custom"><span class="pval">Autre</span></button>
            </div>
            <div class="custom-row" data-custom-water><input class="custom-input" type="number" inputmode="numeric" min="1" max="5000" placeholder="ex. 330"><span class="custom-unit">ml</span></div>
          </div>
          <div data-water-panel="electrolyte" hidden>
            <div class="sheet-label">${t("format")}</div>
            <div class="preset-grid">
              ${["1 sachet", "2 sachets", "1 comprimé", "Poudre", "Autre"].map((item) => `<button type="button" class="preset-btn" data-electrolyte="${item}"><span class="pval">${item}</span><span class="punit"></span></button>`).join("")}
            </div>
          </div>
          ${timePicker("water")}
          <button type="submit" class="confirm-btn" disabled>${t("confirm")}</button>
        </form>
      </div>
    </div>

    <div class="sheet-overlay" id="substanceOverlay">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="subTitle">
        <div class="sheet-handle"></div>
        <div class="sheet-header substance-sheet-header">
          <button type="button" class="sheet-back is-hidden" data-action="sub-back" aria-label="${t("back")}">←</button>
          <div class="sheet-heading">
            <div class="sheet-title" id="subTitle">${t("pickSubstance")}</div>
            <div class="sheet-step" id="subStep">${t("step1")}</div>
          </div>
          <button class="sheet-close" data-action="close-sheet" aria-label="Fermer">x</button>
        </div>
        <form class="sheet-body" data-form="substance" novalidate>
          <div class="step-page active" data-sub-step="1">
            <div class="substance-grid">
              ${Object.entries(substances).map(([id, sub]) => {
                const warn = interactionForSubstanceId(id);
                return `<button type="button" class="substance-btn${warn ? " has-interaction" : ""}" data-substance="${id}">
                  <span class="substance-btn-icon">${sub.icon}</span>
                  <span class="substance-btn-label">${sub.name[state.lang]}</span>
                  ${warn ? `<span class="substance-warn-badge">${warn.level.fr === "Tres dangereux" ? "🔴" : "🟠"}</span>` : ""}
                </button>`;
              }).join("")}
            </div>
          </div>
          <div class="step-page" data-sub-step="2">
            <div id="substanceInteractionWarning"></div>
            <div>
              <div class="sheet-label" id="doseLabel">${t("dose")}</div>
              <div class="dose-preset-grid" id="doseGrid"></div>
            </div>
            ${timePicker("substance")}
            <button type="button" class="rdr-substance-link" id="rdrSubstanceLink" data-action="open-rdr-from-sheet"></button>
            <button type="submit" class="confirm-btn sub-confirm" disabled>${t("confirm")}</button>
          </div>
        </form>
      </div>
    </div>

    <div class="sheet-overlay" id="rdrInfoOverlay">
      <div class="sheet info-sheet" role="dialog" aria-modal="true" aria-labelledby="infoSheetTitle">
        <div class="sheet-handle"></div>
        <div class="sheet-header info-sheet-header">
          <div class="sheet-title" id="infoSheetTitle"></div>
          <button class="sheet-close" data-action="close-rdr-info" aria-label="Fermer">x</button>
        </div>
        <div class="sheet-body info-sheet-body">
          <div class="info-hero">
            <span class="info-hero-icon" id="infoHeroIcon"></span>
            <div>
              <div class="info-hero-name" id="infoHeroName"></div>
              <div class="info-hero-cat" id="infoHeroCat"></div>
            </div>
          </div>
          <div>
            <div class="sheet-label">${t("effects")}</div>
            <div class="info-text" id="infoEffects"></div>
          </div>
          <div id="sensationsContainer">
            <div class="sheet-label">${state.lang === "fr" ? "Ce que tu vas ressentir" : "What you might feel"}</div>
            <div class="info-text" id="infoSensations"></div>
          </div>
          <div>
            <div class="sheet-label">${t("duration")}</div>
            <div class="info-duration" id="infoDuration"></div>
          </div>
          <div>
            <div class="sheet-label">${t("dosage")}</div>
            <div class="info-dose-grid" id="infoDoses"></div>
          </div>
          <div>
            <div class="sheet-label">${t("risks")}</div>
            <ul class="info-risks" id="infoRisks"></ul>
          </div>
          <a class="wiki-link" id="infoWiki" href="#" target="_blank" rel="noreferrer">
            <span>🔗</span>
            <span>Psychonautwiki</span>
            <span class="wiki-signal">${state.lang === "fr" ? "nécessite une connexion" : "requires connection"}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="confirm-overlay" id="clearConfirmOverlay">
      <div class="confirm-sheet">
        <div class="confirm-handle"></div>
        <div class="confirm-title">${state.lang === "fr" ? "Effacer toutes les données ?" : "Clear all data?"}</div>
        <div class="confirm-text">${state.lang === "fr" ? "Tout le journal d'hydratation et de substances sera supprimé. Cette action est irréversible." : "All hydration and substance logs will be deleted. This cannot be undone."}</div>
        <div class="confirm-actions">
          <button class="btn-danger" data-action="confirm-clear-data">${state.lang === "fr" ? "Effacer définitivement" : "Delete permanently"}</button>
          <button class="btn-cancel" data-action="close-clear-confirm">${state.lang === "fr" ? "Annuler" : "Cancel"}</button>
        </div>
      </div>
    </div>
  `;
}

function timePicker(scope) {
  return `
    <div>
      <div class="sheet-label">${t("time")}</div>
      <div class="time-row">
        <button type="button" class="time-btn sel" data-time="${scope}:now"><span class="time-btn-icon">⚡</span><span class="time-btn-label">${t("current")}</span></button>
        <button type="button" class="time-btn" data-time="${scope}:other"><span class="time-btn-icon">🕐</span><span class="time-btn-label">${t("otherTime")}</span></button>
      </div>
      <div class="custom-row" data-time-custom="${scope}"><input class="time-input" type="time"></div>
    </div>
  `;
}

function openSheet(id) {
  window.clearTimeout(sheetResetTimer);
  $(`#${id}`).classList.add("open");
}

function openRdrInfo(id) {
  const sub = substances[id];
  const info = substanceInfo[id];
  const overlay = $("#rdrInfoOverlay");
  if (!sub || !info || !overlay) return;

  $("#infoSheetTitle").textContent = rdrSubstanceName(id);
  $("#infoHeroIcon").textContent = sub.icon;
  $("#infoHeroName").textContent = rdrSubstanceName(id);
  $("#infoHeroCat").textContent = info.category[state.lang];
  $("#infoEffects").textContent = sub.effects;
  const sensationsText = info.sensations?.[state.lang] || "";
  if (sensationsText) {
    $("#infoSensations").textContent = sensationsText;
    $("#infoSensations").parentElement.style.display = "block";
  } else {
    $("#infoSensations").parentElement.style.display = "none";
  }
  $("#infoDuration").innerHTML = info.duration.map((item) => `
    <div class="duration-row">
      <span class="duration-route">${item.route}</span>
      <span class="duration-vals">${state.lang === "fr" ? "Début" : "Onset"} <strong>${item.onset}</strong><span class="duration-sep">·</span>${state.lang === "fr" ? "Durée" : "Duration"} <strong>${item.duration}</strong></span>
    </div>
  `).join("");
  $("#infoDoses").innerHTML = sub.doses.map((item) => `
    <div class="info-dose-card">
      <span class="dose-name"><span class="dose-badge ${cssDose(item.key)}">${labelForDose(item.key)}</span></span>
      <span class="dose-detail">${item.label[state.lang]} · ${item.detail[state.lang]}</span>
    </div>
  `).join("");
  $("#infoRisks").innerHTML = info.risks.map((risk) => `<li>${risk}</li>`).join("");
  $("#infoWiki").href = sub.source;
  $(".info-sheet-body", overlay).scrollTop = 0;
  overlay.classList.add("open");
}

function closeSheets() {
  $$(".sheet-overlay").forEach((sheet) => sheet.classList.remove("open"));
  window.clearTimeout(sheetResetTimer);
  sheetResetTimer = window.setTimeout(renderSheetRoot, 380);
}

function selectedDate(form, scope) {
  const other = $(`[data-time="${scope}:other"]`, form)?.classList.contains("sel");
  if (!other) return new Date();
  const value = $(`[data-time-custom="${scope}"] input`, form)?.value;
  if (!value) return new Date();
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() > Date.now()) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function selectTimeButton(button) {
  const [scope, kind] = button.dataset.time.split(":");
  $$(`[data-time^="${scope}:"]`).forEach((item) => item.classList.toggle("sel", item === button));
  $(`[data-time-custom="${scope}"]`)?.classList.toggle("vis", kind === "other");
}

function isRecentPast(iso, windowHours = 12) {
  const diff = Date.now() - new Date(iso).getTime();
  return diff >= 0 && diff <= windowHours * 60 * 60 * 1000;
}

function interactionForSubstanceIds(ids) {
  const currentIds = ids.filter(Boolean);
  const recent = state.logs.filter((item) => {
    return item.type === "substance" && isRecentPast(item.occurredAt);
  });

  for (const item of recent) {
    const previousIds = [item.substanceId, item.family].filter(Boolean);
    const combined = new Set([...currentIds, ...previousIds]);
    for (const ruleItem of interactionRules) {
      if (ruleItem.ids.every((id) => combined.has(id))) {
        return ruleItem;
      }
    }
  }
  return null;
}

function interactionForSubstanceId(substanceId) {
  const sub = substances[substanceId];
  return interactionForSubstanceIds([substanceId, sub?.family]);
}

function interactionFor(entry) {
  return interactionForSubstanceIds([entry.substanceId, entry.family]);
}

function initWave() {
  cancelAnimationFrame(waveAnimation);
  const stream = $("#stream");
  const canvas = $("#waveCanvas");
  if (!stream || !canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = { water: "#3DDBD9", electrolyte: "#A78BFA", substance: "#FF6B6B" };
  const amp = 11;
  const center = 18;
  const wavelength = 145;
  let phase = 0;

  function resize() {
    const h = Math.max(stream.scrollHeight, 160);
    canvas.width = 36;
    canvas.height = h;
    canvas.style.height = `${h}px`;
  }

  function dots() {
    const streamRect = stream.getBoundingClientRect();
    return $$(".stream-entry", stream).map((el) => {
      const rect = el.getBoundingClientRect();
      return { y: rect.top - streamRect.top + rect.height / 2, color: colors[el.dataset.type] || colors.water };
    });
  }

  function xFor(y) {
    return center + amp * Math.sin((2 * Math.PI * y) / wavelength + phase);
  }

  function frame() {
    resize();
    const h = canvas.height;
    ctx.clearRect(0, 0, canvas.width, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(61,219,217,0.05)");
    grad.addColorStop(0.45, "rgba(61,219,217,0.28)");
    grad.addColorStop(0.85, "rgba(61,219,217,0.75)");
    grad.addColorStop(1, "rgba(61,219,217,0.95)");
    ctx.save();
    ctx.beginPath();
    for (let y = 0; y <= h; y += 2) {
      const x = xFor(y);
      if (y === 0) ctx.moveTo(x, 0);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(61,219,217,0.45)";
    ctx.stroke();
    ctx.restore();

    dots().forEach((dot) => {
      const x = xFor(dot.y);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, dot.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.fill();
      ctx.restore();
    });

    const tipX = xFor(h);
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(61,219,217,0.9)";
    ctx.beginPath();
    ctx.arc(tipX, h - 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3DDBD9";
    ctx.fill();
    ctx.restore();

    phase -= 0.018;
    waveAnimation = requestAnimationFrame(frame);
  }
  frame();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action], [data-amount], [data-electrolyte], [data-water-type], [data-time], [data-substance], [data-dose], .sheet-overlay");
  if (!target) return;

  if (target.classList.contains("sheet-overlay") && target === event.target) closeSheets();
  if (target.classList.contains("confirm-overlay") && target === event.target) target.classList.remove("open");
  if (target.dataset.action === "open-water") openSheet("waterOverlay");
  if (target.dataset.action === "open-substance") openSheet("substanceOverlay");
  if (target.dataset.action === "open-rdr-info") openRdrInfo(target.dataset.infoSubstance);
  if (target.dataset.action === "close-sheet") closeSheets();
  if (target.dataset.action === "close-rdr-info") closeSheets();
  if (target.dataset.action === "open-rdr-from-sheet") {
    state.pendingRdrSubstance = target.dataset.substanceId;
    closeSheets();
    window.clearTimeout(sheetResetTimer); // cancel the renderSheetRoot timer — render() will rebuild sheets
    window.location.hash = "#/rdr";
  }
  if (target.dataset.action === "open-clear-confirm") $("#clearConfirmOverlay")?.classList.add("open");
  if (target.dataset.action === "close-clear-confirm") $("#clearConfirmOverlay")?.classList.remove("open");
  if (target.dataset.action === "confirm-clear-data") {
    $("#clearConfirmOverlay")?.classList.remove("open");
    await clearLogs();
  }
  if (target.dataset.action === "toggle-lang") {
    state.lang = state.lang === "fr" ? "en" : "fr";
    localStorage.setItem(LANG_KEY, state.lang);
    render();
  }
  if (target.dataset.action === "set-lang") {
    state.lang = target.dataset.lang;
    localStorage.setItem(LANG_KEY, state.lang);
    render();
  }
  if (target.dataset.action === "clear-data") {
    await clearLogs();
  }
  if (target.dataset.time) selectTimeButton(target);

  if (target.dataset.waterType) {
    const form = target.closest("[data-form='water']");
    $$("[data-water-type]", form).forEach((btn) => btn.classList.remove("sel-water", "sel-elec"));
    target.classList.add(target.dataset.waterType === "water" ? "sel-water" : "sel-elec");
    $$("[data-water-panel]", form).forEach((panel) => panel.hidden = panel.dataset.waterPanel !== target.dataset.waterType);
    $$(".preset-btn", form).forEach((btn) => btn.classList.remove("sel-water", "sel-elec"));
    delete form.dataset.waterAmount;
    delete form.dataset.electrolyte;
    $("[data-custom-water]", form).classList.remove("vis");
    $(".confirm-btn", form).disabled = true;
  }

  if (target.dataset.amount) {
    const form = target.closest("[data-form='water']");
    $$("[data-amount]", form).forEach((btn) => btn.classList.remove("sel-water"));
    target.classList.add("sel-water");
    form.dataset.waterAmount = target.dataset.amount;
    $("[data-custom-water]", form).classList.toggle("vis", target.dataset.amount === "custom");
    $(".confirm-btn", form).disabled = target.dataset.amount === "custom" && !$("[data-custom-water] input", form).value;
  }

  if (target.dataset.electrolyte) {
    const form = target.closest("[data-form='water']");
    $$("[data-electrolyte]", form).forEach((btn) => btn.classList.remove("sel-elec"));
    target.classList.add("sel-elec");
    form.dataset.electrolyte = target.dataset.electrolyte;
    $(".confirm-btn", form).disabled = false;
  }

  if (target.dataset.substance) {
    const form = target.closest("[data-form='substance']");
    const sub = substances[target.dataset.substance];
    form.dataset.selectedSubstance = target.dataset.substance;
    $("[data-sub-step='1']", form).classList.remove("active");
    $("[data-sub-step='2']", form).classList.add("active");
    $(".sheet-back", $("#substanceOverlay")).classList.remove("is-hidden");
    $("#subTitle").textContent = sub.name[state.lang];
    $("#subStep").textContent = t("step2");
    $("#doseLabel").textContent = `${t("dose")} · ${sub.name[state.lang]}`;
    $("#doseGrid").innerHTML = sub.doses.map((item) => `
      <button type="button" class="dose-preset-btn" data-dose="${item.key}">
        <span class="dose-badge ${cssDose(item.key)}">${labelForDose(item.key)}</span>
        <span class="dose-detail">${item.label[state.lang]} · ${item.detail[state.lang]}</span>
      </button>
    `).join("");

    const substanceId = target.dataset.substance;
    const warning = interactionForSubstanceId(substanceId);
    const warningEl = $("#substanceInteractionWarning");
    if (warning) {
      const isDangerous = warning.level.fr === "Tres dangereux";
      warningEl.innerHTML = `<div class="interaction-warning-card ${isDangerous ? "level-tres-dangereux" : "level-dangereux"}">
        <strong>${isDangerous ? "🔴" : "🟠"} ${warning.level[state.lang]}</strong>
        <p>${warning.text[state.lang]}</p>
      </div>`;
    } else {
      warningEl.innerHTML = "";
    }

    const rdrLink = $("#rdrSubstanceLink");
    rdrLink.textContent = state.lang === "fr" ? "Voir dans RDR →" : "See in RDR →";
    rdrLink.dataset.substanceId = substanceId;
  }

  if (target.dataset.action === "sub-back") {
    const form = $("#substanceOverlay [data-form='substance']");
    $("[data-sub-step='2']", form).classList.remove("active");
    $("[data-sub-step='1']", form).classList.add("active");
    $(".sheet-back", $("#substanceOverlay")).classList.add("is-hidden");
    $("#subTitle").textContent = t("pickSubstance");
    $("#subStep").textContent = t("step1");
    $(".confirm-btn", form).disabled = true;
  }

  if (target.dataset.dose) {
    const form = target.closest("[data-form='substance']");
    $$("[data-dose]", form).forEach((btn) => btn.classList.remove("sel"));
    target.classList.add("sel");
    form.dataset.selectedDose = target.dataset.dose;
    $(".confirm-btn", form).disabled = false;
  }
});

document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-custom-water] input");
  if (!input) return;
  const form = input.closest("[data-form='water']");
  const customSelected = $("[data-amount='custom']", form)?.classList.contains("sel-water");
  $(".confirm-btn", form).disabled = customSelected && !input.value;
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === "water") {
    const isWater = $("[data-water-type='water']", form).classList.contains("sel-water");
    const date = selectedDate(form, "water");
    if (isWater) {
      const selectedAmount = form.dataset.waterAmount;
      const amount = selectedAmount === "custom" ? Number($("[data-custom-water] input", form).value) : Number(selectedAmount || 0);
      if (amount > 0) await putLog(waterEntry(amount, date));
    } else {
      if (form.dataset.electrolyte) await putLog(electrolyteEntry(form.dataset.electrolyte, date));
    }
    closeSheets();
  }

  if (form.dataset.form === "substance") {
    const substanceId = form.dataset.selectedSubstance;
    const doseKey = form.dataset.selectedDose;
    if (!substanceId || !doseKey) return;
    const sub = substances[substanceId];
    const selectedDose = sub.doses.find((item) => item.key === doseKey);
    const entry = substanceEntry(substanceId, selectedDose, selectedDate(form, "substance"));
    state.lastWarning = interactionFor(entry);
    await putLog(entry);
    closeSheets();
  }
});

window.addEventListener("hashchange", render);

async function boot() {
  state.logs = await getLogs();
  const hadLogs = state.logs.length > 0;
  seedLogs();
  if (!hadLogs && state.logs.length) {
    await Promise.all(state.logs.map((entry) => saveLog(entry)));
    localStorage.setItem(SEED_KEY, "1");
  }
  render();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
