import React from "react";
import Head from "next/head";
import getConfig from "next/config";

const SEO = ({ title, noTitleTemplate }) => {
  const {
    publicRuntimeConfig: { KM_SITE_NAME, KM_SITE_DESCRIPTION },
  } = getConfig();

  const formattedTitle = title
    ? noTitleTemplate
      ? title
      : `${title} — ${KM_SITE_NAME}`
    : KM_SITE_NAME;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta property="og:title" content={formattedTitle} />
      <meta name="description" content={KM_SITE_DESCRIPTION} />
      <meta property="og:description" content={KM_SITE_DESCRIPTION} />
      <meta property="og:site_name" content={KM_SITE_NAME} />
      <meta property="og:type" content="website" />
    </Head>
  );
};

export default SEO;
