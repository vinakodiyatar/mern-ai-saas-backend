import Joi from "joi";

export const generateSchema = Joi.object({
  moduleType: Joi.string().valid("seo", "ads").default("seo"),
  keyword: Joi.string().allow("", null),
  url: Joi.string().uri().allow("", null),
  product: Joi.string().allow("", null),
  audience: Joi.string().allow("", null),
}).custom((value, helpers) => {
  if (value.moduleType === "seo" && !value.keyword) {
    return helpers.error("any.custom", { message: "Keyword is required for SEO" });
  }
  if (value.moduleType === "ads" && !value.product && !value.keyword) {
    return helpers.error("any.custom", { message: "Product or keyword required for Ads" });
  }
  return value;
});
