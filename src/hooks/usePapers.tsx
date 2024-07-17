import { useMemo } from "react";
import { useRouter } from "next/router";

import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/utils/fetcher";
import { PaperType } from "@/types";

export const usePapers = (user: any) => {
  const router = useRouter();
  const { q, year } = router.query;

  //@ts-ignore
  const getKey = (pageIndex, previousPageData) => {
    // const index = pageIndex + 1;
    // console.log("page =", index, pageIndex, previousPageData);
    if (previousPageData && !previousPageData?.length) {
      return null;
    }
    return `/api/searchPapers?query=${q}&index=${pageIndex}&year=${year}`; // SWR key
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite(
      //@ts-ignore
      q && user?.id ? getKey : null,
      fetcher,
      {
        initialSize: 1,
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        onErrorRetry: (error: any, key, config, revalidate, { retryCount }) => {
          //FIXME:
          // Never retry on 500.
          if (error.status === 500) return;
        },
      }
    );

  // console.log({ isLoading });

  const papers: PaperType[] = useMemo(
    () => (data ? [].concat(...data).filter(Boolean) : []), //TODO:
    [data]
  );

  const response = {
    papers,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  };

  if (error) {
    return response;
  }

  return response;
};
