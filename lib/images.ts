// Product placeholder visuals — clean, minimal, photo-like feel.
// NOT gradient blobs. Subtle warm tones with product-specific treatment.

export interface ProductVisual {
  bg: string;       // background class
  ring: string;     // inner ring/border class
  iconBg: string;   // icon container
}

const VISUALS: Record<string, ProductVisual> = {
  "prod-1":  { bg: "bg-[#FEF2F2]", ring: "ring-red-200", iconBg: "bg-red-500" },
  "prod-2":  { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-500" },
  "prod-3":  { bg: "bg-[#FEF3C7]", ring: "ring-amber-200", iconBg: "bg-amber-700" },
  "prod-4":  { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-5":  { bg: "bg-[#F0F9FF]", ring: "ring-sky-200", iconBg: "bg-sky-500" },
  "prod-6":  { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-500" },
  "prod-7":  { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-600" },
  "prod-8":  { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-600" },
  "prod-9":  { bg: "bg-[#FEF3C7]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-10": { bg: "bg-[#F7FEE7]", ring: "ring-lime-200", iconBg: "bg-lime-700" },
  "prod-11": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-400" },
  "prod-12": { bg: "bg-[#ECFDF5]", ring: "ring-emerald-200", iconBg: "bg-emerald-600" },
  "prod-13": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-700" },
  "prod-14": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-500" },
  "prod-15": { bg: "bg-[#F8FAFC]", ring: "ring-slate-200", iconBg: "bg-slate-300" },
  "prod-16": { bg: "bg-[#FFFBEB]", ring: "ring-orange-100", iconBg: "bg-orange-200" },
  "prod-17": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-300" },
  "prod-18": { bg: "bg-[#FFFBEB]", ring: "ring-amber-300", iconBg: "bg-amber-500" },
  "prod-19": { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-500" },
  "prod-20": { bg: "bg-[#FEFCE8]", ring: "ring-yellow-200", iconBg: "bg-yellow-500" },
  "prod-21": { bg: "bg-[#FFF1F2]", ring: "ring-pink-200", iconBg: "bg-pink-400" },
  "prod-22": { bg: "bg-[#FFF1F2]", ring: "ring-rose-200", iconBg: "bg-rose-400" },
  "prod-23": { bg: "bg-[#FFF1F2]", ring: "ring-pink-200", iconBg: "bg-pink-500" },
  "prod-24": { bg: "bg-[#F9FAFB]", ring: "ring-gray-200", iconBg: "bg-gray-300" },
  "prod-25": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-500" },
  "prod-26": { bg: "bg-[#FEFCE8]", ring: "ring-yellow-200", iconBg: "bg-yellow-400" },
  "prod-27": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-28": { bg: "bg-[#FEF2F2]", ring: "ring-red-200", iconBg: "bg-red-700" },
  "prod-29": { bg: "bg-[#FFF1F2]", ring: "ring-rose-200", iconBg: "bg-rose-400" },
  "prod-30": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-600" },
  "prod-31": { bg: "bg-[#F7FEE7]", ring: "ring-lime-200", iconBg: "bg-lime-700" },
  "prod-32": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-33": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-700" },
  "prod-34": { bg: "bg-[#FFF1F2]", ring: "ring-rose-200", iconBg: "bg-rose-500" },
  "prod-35": { bg: "bg-[#F0FDF4]", ring: "ring-emerald-200", iconBg: "bg-emerald-600" },
  "prod-36": { bg: "bg-[#F7FEE7]", ring: "ring-lime-200", iconBg: "bg-lime-600" },
  "prod-37": { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-400" },
  "prod-38": { bg: "bg-[#FAFAFA]", ring: "ring-neutral-300", iconBg: "bg-neutral-800" },
  "prod-39": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-300" },
  "prod-40": { bg: "bg-[#F0F9FF]", ring: "ring-sky-200", iconBg: "bg-sky-500" },
  "prod-41": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-500" },
  "prod-42": { bg: "bg-[#FDF4FF]", ring: "ring-purple-200", iconBg: "bg-purple-700" },
  "prod-43": { bg: "bg-[#FAFAFA]", ring: "ring-neutral-200", iconBg: "bg-neutral-400" },
  "prod-44": { bg: "bg-[#FEFCE8]", ring: "ring-yellow-200", iconBg: "bg-yellow-600" },
  "prod-45": { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-600" },
  "prod-46": { bg: "bg-[#FAF7F0]", ring: "ring-amber-200", iconBg: "bg-amber-700" },
  "prod-47": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-48": { bg: "bg-[#FDF2F8]", ring: "ring-pink-200", iconBg: "bg-pink-600" },
  "prod-49": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-700" },
  "prod-50": { bg: "bg-[#FFFBEB]", ring: "ring-yellow-200", iconBg: "bg-yellow-700" },
  "prod-51": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-500" },
  "prod-52": { bg: "bg-[#FDF4FF]", ring: "ring-purple-200", iconBg: "bg-purple-500" },
  "prod-53": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-700" },
  "prod-54": { bg: "bg-[#FFF7ED]", ring: "ring-orange-200", iconBg: "bg-orange-600" },
  "prod-55": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-500" },
  "prod-56": { bg: "bg-[#EFF6FF]", ring: "ring-blue-200", iconBg: "bg-blue-700" },
  "prod-57": { bg: "bg-[#F0FDF4]", ring: "ring-emerald-200", iconBg: "bg-emerald-700" },
  "prod-58": { bg: "bg-[#EFF6FF]", ring: "ring-sky-200", iconBg: "bg-sky-600" },
  "prod-59": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-green-800" },
  "prod-60": { bg: "bg-[#F7F3E8]", ring: "ring-amber-200", iconBg: "bg-amber-800" },
  "prod-61": { bg: "bg-[#FDF6EC]", ring: "ring-orange-300", iconBg: "bg-orange-800" },
  "prod-62": { bg: "bg-[#FFFBEB]", ring: "ring-amber-300", iconBg: "bg-amber-700" },
  "prod-63": { bg: "bg-[#FBF7F1]", ring: "ring-amber-200", iconBg: "bg-amber-700" },
  "prod-64": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-500" },
  "prod-65": { bg: "bg-[#F0F9FF]", ring: "ring-sky-200", iconBg: "bg-sky-600" },
  "prod-66": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-67": { bg: "bg-[#FAFAF9]", ring: "ring-stone-200", iconBg: "bg-stone-400" },
  "prod-68": { bg: "bg-[#EFF6FF]", ring: "ring-blue-200", iconBg: "bg-blue-400" },
  "prod-69": { bg: "bg-[#FFFBEB]", ring: "ring-amber-200", iconBg: "bg-amber-600" },
  "prod-70": { bg: "bg-[#F0FDF4]", ring: "ring-green-200", iconBg: "bg-lime-700" },
  "prod-71": { bg: "bg-[#FBF7F1]", ring: "ring-amber-300", iconBg: "bg-amber-800" },
  "prod-72": { bg: "bg-[#F0F9FF]", ring: "ring-rose-100", iconBg: "bg-rose-400" },
};

const DEFAULT_VISUAL: ProductVisual = {
  bg: "bg-[#FAFAF9]",
  ring: "ring-stone-200",
  iconBg: "bg-stone-400",
};

export function productVisual(key: string): ProductVisual {
  return VISUALS[key] ?? DEFAULT_VISUAL;
}

// Legacy gradient fallback
export function gradientFor(key: string): string {
  const v = productVisual(key);
  return `linear-gradient(135deg, transparent 0%, transparent 100%)`;
}
