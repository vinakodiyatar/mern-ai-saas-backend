export const buildPrompt = ({ moduleType, keyword, url, product, audience }) => {
  if (moduleType === "ads") {
    return `You are a performance marketer writing Google Responsive Search Ads. Constraints: headlines <=30 chars, descriptions <=90 chars. Return JSON only:
{
  "ads": [
    {"headline1": "", "headline2": "", "headline3": "", "description1": "", "description2": ""}
  ],
  "notes": ""
}
Input:
- Product/Service: ${product || keyword}
- Target audience: ${audience || "general"}
Provide 3 ad variations optimized for CTR and Quality Score.`;
  }

  return `You are an SEO strategist. Create an SEO-ready article plan.
Input keyword: ${keyword}
Reference URL or topic: ${url || "N/A"}
Return compact JSON only:
{
  "metaTitle": "",
  "metaDescription": "",
  "outline": ["H1", "H2", "H2", "..."],
  "internalLinks": ["slug or anchor"],
  "faqs": [{"q":"","a":""}]
}
Meta title max 60 chars. Meta description 150-160 chars.`;
};
