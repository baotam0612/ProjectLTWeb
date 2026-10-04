import { useCallback, useEffect, useState } from "react";

export function usePagedList(fetchPage, filters = {}) {
  const [size, setSize] = useState(10);
  const [cursor, setCursor] = useState({ key: "", index: 0 });
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [request, setRequest] = useState({ key: "", loading: true, error: null });
  const filtersKey = JSON.stringify(filters);
  const cursorKey = `${filtersKey}|${size}`;
  const page = cursor.key === cursorKey ? cursor.index : 0;
  const requestKey = `${cursorKey}|${page}|${version}`;
  const reload = useCallback(() => setVersion(value => value + 1), []);

  useEffect(() => {
    setCursor(current => current.key === cursorKey ? current : { key: cursorKey, index: 0 });
  }, [cursorKey]);

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ key: requestKey, loading: true, error: null });
    // Search is debounced; aborting prevents an older response overwriting a new page.
    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchPage({ ...JSON.parse(filtersKey), page, size }, controller.signal);
        if (controller.signal.aborted) return;
        const lastPage = Math.max(0, data.totalPages - 1);
        if (page > lastPage) {
          setCursor({ key: cursorKey, index: lastPage });
          return;
        }
        setResult({ ...data, key: requestKey });
        setRequest({ key: requestKey, loading: false, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        setRequest({ key: requestKey, loading: false,
          error: error.response?.data?.message || error.message || "Không thể tải dữ liệu" });
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [fetchPage, filtersKey, cursorKey, requestKey, page, size]);

  const loading = request.key !== requestKey || request.loading;
  return {
    items: result.key === requestKey ? result.content : [],
    page, size, totalElements: result.totalElements, totalPages: result.totalPages,
    summary: result.summary,
    loading, error: request.key === requestKey ? request.error : null, reload,
    onPageChange: index => setCursor({ key: cursorKey, index }),
    onSizeChange: value => setSize(value)
  };
}
