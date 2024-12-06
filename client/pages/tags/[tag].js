import React, { useState, useContext } from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";
import qs from "qs";
import { withAuthServerSideProps } from "../../utils/withAuth";
import SEO from "../../components/SEO";
import Text from "../../components/Text";
import LocaleContext from "../../utils/LocaleContext";
import TorrentList from "../../components/TorrentList";

const Tag = ({ results, token }) => {
  const [torrents, setTorrents] = useState(results?.torrents ?? []);

  const router = useRouter();
  const {
    query: { tag },
  } = router;

  const {
    publicRuntimeConfig: { KM_TORRENT_CATEGORIES, KM_API_URL },
  } = getConfig();

  const { getLocaleString } = useContext(LocaleContext);

  return (
    <>
      <SEO title={`${getLocaleString("tagTaggedWith")} “${tag}”`} />
      <Text as="h1" mb={5}>
        {getLocaleString("tagTaggedWith")} “{tag}”
      </Text>
      {torrents.length ? (
        <TorrentList
          torrents={torrents}
          setTorrents={setTorrents}
          categories={KM_TORRENT_CATEGORIES}
          total={results.total}
          fetchPath={`${KM_API_URL}/torrent/search`}
          token={token}
        />
      ) : (
        <Text color="grey">{getLocaleString("catNoResults")}</Text>
      )}
    </>
  );
};

export const getServerSideProps = withAuthServerSideProps(
  async ({
    token,
    fetchHeaders,
    isPublicAccess,
    query: { tag, page: pageParam },
  }) => {
    if (!token && !isPublicAccess) return { props: {} };

    const {
      publicRuntimeConfig: { KM_API_URL },
    } = getConfig();

    const params = {
      tag: encodeURIComponent(tag),
    };
    const page = pageParam ? parseInt(pageParam) : 0;
    if (page > 0) params.page = page;

    try {
      const searchRes = await fetch(
        `${KM_API_URL}/torrent/search?${qs.stringify(params)}`,
        {
          headers: fetchHeaders,
        }
      );
      if (
        searchRes.status === 403 &&
        (await searchRes.text()) === "User is banned"
      ) {
        throw "banned";
      }
      const results = await searchRes.json();
      return { props: { results, token } };
    } catch (e) {
      if (e === "banned") throw "banned";
      return { props: {} };
    }
  },
  true
);

export default Tag;
