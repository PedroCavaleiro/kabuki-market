import * as yup from "yup";

const httpRegex = /http(s)?:\/\/.*/;
const mongoRegex = /mongodb:\/\/.*/;
const hexRegex = /#([a-f0-9]){6}/i;

const configSchema = yup
  .object({
    envs: yup
      .object({
        KM_SITE_NAME: yup.string().min(1).max(20).required(),
        KM_SITE_DESCRIPTION: yup.string().min(1).max(80).required(),
        KM_ALLOW_REGISTER: yup
          .string()
          .oneOf(["open", "invite", "closed"])
          .required(),
        KM_ALLOW_ANONYMOUS_UPLOADS: yup.boolean().required(),
        KM_MINIMUM_RATIO: yup.number().min(-1).required(),
        KM_MAXIMUM_HIT_N_RUNS: yup.number().integer().min(-1).required(),
        KM_BP_EARNED_PER_GB: yup.number().min(0).required(),
        KM_BP_EARNED_PER_FILLED_REQUEST: yup.number().min(0).required(),
        KM_BP_COST_PER_INVITE: yup.number().min(0).required(),
        KM_BP_COST_PER_GB: yup.number().min(0).required(),
        KM_SITE_WIDE_FREELEECH: yup.boolean().required(),
        KM_TORRENT_CATEGORIES: yup.lazy((value) => {
          const entries = Object.keys(value).reduce((obj, key) => {
            obj[key] = yup
              .array()
              .of(yup.string())
              .min(0)
              .test(
                `${key}-items-unique`,
                `Sources in category "${key}" must be unique`,
                (value) =>
                  value.every(
                    (source) => value.filter((c) => c === source).length === 1
                  )
              );
            return obj;
          }, {});
          return yup.object(entries).required();
        }),
        KM_ALLOW_UNREGISTERED_VIEW: yup.boolean().required(),
        KM_CUSTOM_THEME: yup.object({
          primary: yup.string().matches(hexRegex),
          background: yup.string().matches(hexRegex),
          sidebar: yup.string().matches(hexRegex),
          border: yup.string().matches(hexRegex),
          text: yup.string().matches(hexRegex),
          grey: yup.string().matches(hexRegex),
        }),
        KM_EXTENSION_BLACKLIST: yup.array().of(yup.string()).min(0),
        KM_SITE_DEFAULT_LOCALE: yup
          .string()
          .oneOf(["en", "es", "it", "ru", "de", "zh", "eo", "fr"]),
        KM_BASE_URL: yup.string().matches(httpRegex).required(),
        KM_API_URL: yup.string().matches(httpRegex).required(),
        KM_MONGO_URL: yup.string().matches(mongoRegex).required(),
        KM_DISABLE_EMAIL: yup.boolean(),
        KM_MAIL_FROM_ADDRESS: yup
          .string()
          .email()
          .when("KM_DISABLE_EMAIL", {
            is: (val) => val !== true,
            then: (schema) => schema.required(),
          }),
        KM_SMTP_HOST: yup.string().when("KM_DISABLE_EMAIL", {
          is: (val) => val !== true,
          then: (schema) => schema.required(),
        }),
        KM_SMTP_PORT: yup
          .number()
          .integer()
          .min(1)
          .max(65535)
          .when("KM_DISABLE_EMAIL", {
            is: (val) => val !== true,
            then: (schema) => schema.required(),
          }),
        KM_SMTP_SECURE: yup.boolean().when("KM_DISABLE_EMAIL", {
          is: (val) => val !== true,
          then: (schema) => schema.required(),
        }),
      })
      .strict()
      .noUnknown()
      .required(),
    secrets: yup
      .object({
        KM_JWT_SECRET: yup.string().required(),
        KM_SERVER_SECRET: yup.string().required(),
        KM_ADMIN_EMAIL: yup.string().email().required(),
        KM_SMTP_USER: yup.string(),
        KM_SMTP_PASS: yup.string(),
      })
      .when("envs.KM_DISABLE_EMAIL", {
        is: (val) => val !== true,
        then: (schema) => {
          schema.fields.KM_SMTP_USER = yup.string().required();
          schema.fields.KM_SMTP_PASS = yup.string().required();
          return schema;
        },
      })
      .strict()
      .noUnknown()
      .required(),
  })
  .strict()
  .noUnknown()
  .required();

const validateConfig = async (config) => {
  try {
    process.env = {
      ...process.env,
      ...config.envs,
      ...config.secrets,
    };
    await configSchema.validate(config);
    console.log("[km] configuration is valid");
  } catch (e) {
    console.error("[km] ERROR: invalid configuration:", e.message);
    process.exit(1);
  }
};

export default validateConfig;
