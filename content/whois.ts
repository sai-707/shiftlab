// Server only. Fictional registration records for practice.
export type WhoisRecord = { registrar: string; registered: string; ageDays: number; owner: string; country: string; note: string };

export const WHOIS: Record<string, WhoisRecord> = {
  "harborpine-logistics.test": { registrar: "Northgate Registrar", registered: "2014-03-12", ageDays: 4604, owner: "Harbor & Pine Logistics", country: "IN", note: "Our own domain. Long-lived and registered to the company." },
  "harborpine-helpdesk.test": { registrar: "QuickReg Ltd", registered: "2026-10-22", ageDays: 2, owner: "Privacy protected", country: "Hidden", note: "Two days old, imitates our name, owner hidden. Strongly suspicious." },
  "harborpine-verify.test": { registrar: "QuickReg Ltd", registered: "2026-10-23", ageDays: 1, owner: "Privacy protected", country: "Hidden", note: "Registered yesterday. New look-alike domains are a classic phishing sign." },
  "harborpine-hr.test": { registrar: "QuickReg Ltd", registered: "2026-10-20", ageDays: 4, owner: "Privacy protected", country: "Hidden", note: "Four days old look-alike of our HR site." },
  "jobseek-mail.test": { registrar: "BudgetNames", registered: "2026-10-15", ageDays: 9, owner: "Privacy protected", country: "Hidden", note: "Nine days old, hidden owner." },
  "oceanlink-freight.test": { registrar: "Northgate Registrar", registered: "2016-06-02", ageDays: 3787, owner: "OceanLink Freight Pty", country: "AU", note: "Old, named owner, a real supplier." },
  "bluecrate-supplies.test": { registrar: "Northgate Registrar", registered: "2019-09-18", ageDays: 2593, owner: "BlueCrate Supplies Ltd", country: "GB", note: "Established supplier. The domain is real even though this email was not safe." },
  "shopdeals-weekly.test": { registrar: "BudgetNames", registered: "2021-04-07", ageDays: 2026, owner: "ShopDeals Media", country: "US", note: "A real marketing company. Annoying, not dangerous." },
  "freemail-box.test": { registrar: "Northgate Registrar", registered: "2012-01-30", ageDays: 5016, owner: "FreeMail Box Inc", country: "US", note: "A free mail provider. Anyone can sign up, so it says little about the sender." },
  "parcel-track-now.test": { registrar: "QuickReg Ltd", registered: "2026-10-23", ageDays: 1, owner: "Privacy protected", country: "Hidden", note: "Registered yesterday and pretends to be a delivery company." },
  "filedrop-personal.test": { registrar: "BudgetNames", registered: "2025-11-11", ageDays: 347, owner: "Privacy protected", country: "Hidden", note: "A personal file-sharing service, not approved for company data." },
};
