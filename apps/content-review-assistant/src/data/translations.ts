// ─── English and Roman Urdu Translation Templates ───

export const TRANSLATIONS = {
  en: {
    responsibleUseWarning:
      'This result is decision support only. It does not predict Google\'s algorithm, establish causal refresh impact, guarantee ranking, CTR, traffic, conversion, or revenue improvement, or authorise automatic content changes.',
    confidenceNote:
      'This score represents measured review priority under the supplied inputs. It is not the probability that editing the page will improve traffic.',
    privacyNotice:
      'Your analysis remains in this browser unless you explicitly enable and consent to an external AI explanation.',
    outsideScopeWarning:
      'This input is outside the validated analytical population. Interpret the result with additional caution.',
    ctrDisclaimer:
      'These are interface demonstration categories, not universal SEO benchmarks.',
    riskDisclaimer:
      'Risk categories are explanatory interface categories, not validated production thresholds.',
    humanReviewRequired: 'Human review required: Yes',
    exampleNote:
      'This is a fictional public-safe demonstration and does not represent a real client or webpage.',
    leakageExplanation:
      'The leaky score is invalid because it uses future-derived information.',
  },
  ur: {
    responsibleUseWarning:
      'Yeh result sirf human decision-support ke liye hai. Yeh Google ke algorithm ko predict nahi karta, refresh ka causal impact prove nahi karta, ranking, CTR, traffic, conversion ya revenue improvement guarantee nahi karta, aur automatic content changes ki permission nahi deta.',
    confidenceNote:
      'Yeh score diye gaye inputs ke tehet measured review priority ko darshata hai. Yeh is baat ki probability nahi hai ke page ko edit karna traffic behtar karega.',
    privacyNotice:
      'Aapka analysis is browser mein rehta hai jab tak aap bahar ki AI explanation ko enable aur consent nahi karte.',
    outsideScopeWarning:
      'Yeh input validated analytical population se bahar hai. Nateejay ko zyada ehtiyat se samjhein.',
    ctrDisclaimer:
      'Yeh interface demonstration categories hain, universal SEO benchmarks nahi.',
    riskDisclaimer:
      'Risk categories explanatory interface categories hain, validated production thresholds nahi.',
    humanReviewRequired: 'Human review zaruri hai: Haan',
    exampleNote:
      'Yeh ek fictional public-safe demonstration hai aur kisi real client ya webpage ko represent nahi karta.',
    leakageExplanation:
      'Leaky score invalid hai kyunke yeh future-derived information use karta hai.',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
