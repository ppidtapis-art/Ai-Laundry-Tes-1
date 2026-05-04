type Transaction = {
  id: string;
  wa: string;
  total: number;
  totalKg: number;
};

type UserState = {
  totalKg: number;
  totalBelanja: number;
  bonus30kgUsed: boolean;
  processedIds: string[];
};

type RewardResult = {
  bonusKg: number;
  diskonRp: number;
  level: "Silver" | "Gold" | "Platinum";
  user: UserState;
};

/* =========================
   STORAGE
========================= */
const getDB = (): Record<string, UserState> => {
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
   LEVEL
========================= */
const getLevel = (total: number): "Silver" | "Gold" | "Platinum" => {
  if (total >= 2000000) return "Platinum";
  if (total >= 1000000) return "Gold";
  return "Silver";
};

/* =========================
   NORMALIZE USER
========================= */
const normalizeUser = (user: any): UserState => {
  return {
    totalKg: user?.totalKg || 0,
    totalBelanja: user?.totalBelanja || 0,
    bonus30kgUsed: user?.bonus30kgUsed || false,
    processedIds: user?.processedIds || [],
  };
};

/* =========================
   APPLY REWARD (WRITE)
========================= */
export const applyReward = (trx: Transaction): RewardResult => {
  const db = getDB();
  let user = normalizeUser(db[trx.wa]);

  // 🔒 anti double
  if (user.processedIds.includes(trx.id)) {
    return {
      bonusKg: 0,
      diskonRp: 0,
      level: getLevel(user.totalBelanja),
      user,
    };
  }

  user.processedIds.push(trx.id);

  let bonusKg = 0;

  if (!user.bonus30kgUsed && user.totalKg >= 30) {
    bonusKg = 2.5;
    user.bonus30kgUsed = true;
    user.totalKg -= 30;
  }

  db[trx.wa] = user;
  saveDB(db);

  return {
    bonusKg,
    diskonRp: 0,
    level: getLevel(user.totalBelanja),
    user,
  };
};

/* =========================
   GET INFO
========================= */
export const getRewardInfo = (wa: string) => {
  const transaksi = JSON.parse(localStorage.getItem("transaksi") || "[]");

  const totalKg = transaksi
    .filter((t: any) => t.wa === wa)
    .reduce((s: number, t: any) => {
      const berat = (t.items || [])
        .filter((i: any) => i.tipe === "kg")
        .reduce((a: number, i: any) => a + (i.berat || 0), 0);

      return s + berat;
    }, 0);

  const totalBelanja = transaksi
    .filter((t: any) => t.wa === wa)
    .reduce((s: number, t: any) => s + (t.total || 0), 0);

  const rewardDB = JSON.parse(localStorage.getItem("reward_db") || "{}");

  return {
    totalKg,
    totalBelanja,
    bonus30kgUsed: rewardDB[wa]?.bonus30kgUsed || false,
    level: getLevel(totalBelanja),
  };
};

  /* =========================
     SIMULASI (FIX DI LUAR)
  ========================= */
  export const simulateReward = (trx: Transaction) => {
    const transaksi = JSON.parse(localStorage.getItem("transaksi") || "[]");

    // 🔥 hitung total kg dari transaksi
    const totalKgSebelumnya = transaksi
      .filter((t: any) => t.wa === trx.wa)
      .reduce((s: number, t: any) => {
        const berat = (t.items || [])
          .filter((i: any) => i.tipe === "kg")
          .reduce((a: number, i: any) => a + (i.berat || 0), 0);

        return s + berat;
      }, 0);

    const totalKgSimulasi = totalKgSebelumnya + trx.totalKg;

    let bonusKg = 0;

    const rewardDB = JSON.parse(localStorage.getItem("reward_db") || "{}");
    const user = rewardDB[trx.wa] || { bonus30kgUsed: false };

    if (!user.bonus30kgUsed && totalKgSimulasi >= 30) {
      bonusKg = 2.5;
    }

    return {
      bonusKg,
      akanDapatBonus: bonusKg > 0,
      sisaMenujuBonus: Math.max(0, 30 - totalKgSimulasi),
    };
  
};