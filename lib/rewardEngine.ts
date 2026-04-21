type Transaction = {
  wa: string;
  total: number;
  totalKg: number;
};

type RewardState = {
  bonusCount: number;
};

type RewardResult = {
  bonusKg: number;
  diskonRp: number;
  level: "Silver" | "Gold" | "Platinum";
  updatedState: RewardState;
};

/* =========================
   STORAGE HELPER
========================= */
const getDB = () => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem("reward_db") || "{}");
  } catch {
    return {};
  }
};

const saveDB = (db: any) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("reward_db", JSON.stringify(db));
};

/* =========================
   LEVEL SYSTEM
========================= */
const getLevel = (total: number) => {
  if (total >= 2000000) return "Platinum";
  if (total >= 1000000) return "Gold";
  return "Silver";
};

/* =========================
   REWARD ENGINE
========================= */
export const rewardEngine = (trx: Transaction): RewardResult => {
  const db = getDB();

  if (!db[trx.wa]) {
    db[trx.wa] = {
      bonusCount: 0,
      totalKg: 0,
      totalBelanja: 0,
    };
  }

  db[trx.wa].totalKg += trx.totalKg;
  db[trx.wa].totalBelanja += trx.total;

  let bonusKg = 0;

  // 🔥 BONUS RULE (30kg → 2.5kg, max 3x)
  if (db[trx.wa].bonusCount < 3 && db[trx.wa].totalKg >= 30) {
    bonusKg = 2.5;
    db[trx.wa].bonusCount += 1;

    // 🔥 reset 30kg setelah dipakai
    db[trx.wa].totalKg -= 30;
  }

  // 🔥 LEVEL RULE
  const level = getLevel(db[trx.wa].totalBelanja);

  // 🔥 DISKON RULE (opsional bisa kamu tambah nanti)
  let diskonRp = 0;

  // SAVE STATE
  saveDB(db);

  return {
    bonusKg,
    diskonRp,
    level,
    updatedState: db[trx.wa],
  };
};