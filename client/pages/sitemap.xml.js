import getConfig from "next/config";

const Sitemap = () => {};

export const getServerSideProps = async ({ req, res }) => {
  const {
    publicRuntimeConfig: {
      KM_BASE_URL,
      KM_API_URL,
      KM_ALLOW_UNREGISTERED_VIEW,
    },
    serverRuntimeConfig: { KM_SERVER_SECRET },
  } = getConfig();

  const urls = [KM_BASE_URL, `${KM_BASE_URL}/login`, `${KM_BASE_URL}/register`];

  if (KM_ALLOW_UNREGISTERED_VIEW) {
    try {
      const listRes = await fetch(`${KM_API_URL}/torrent/all`, {
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For":
            req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
          "X-Km-Server-Secret": KM_SERVER_SECRET,
          "X-Km-Public-Access": true,
        },
      });
      const torrents = await listRes.json();
      for (const { infoHash } of torrents) {
        urls.push(`${KM_BASE_URL}/torrent/${infoHash}`);
      }
    } catch (e) {
      console.error(`[km] could not list torrents: ${e}`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (url) => `<url>
        <loc>${url}</loc>
    </url>`
      )
      .join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
