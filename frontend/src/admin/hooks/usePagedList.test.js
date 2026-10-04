import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";
import { usePagedList } from "./usePagedList.js";

globalThis.window = { setTimeout, clearTimeout };
const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 250)));

function mount(fetchPage, filters = {}) {
  let current;
  function Harness(props) { current = usePagedList(fetchPage, props.filters); return null; }
  let renderer;
  act(() => { renderer = create(React.createElement(Harness, { filters })); });
  return {
    get current() { return current; },
    filters(value) { act(() => renderer.update(React.createElement(Harness, { filters: value }))); },
    close() { act(() => renderer.unmount()); }
  };
}

function backend(rows) {
  return async ({ page, size, q = "" }) => {
    const matches = rows.filter(row => row.name.includes(q));
    return { content: matches.slice(page * size, (page + 1) * size), number: page, size,
      totalElements: matches.length, totalPages: Math.ceil(matches.length / size) };
  };
}

test("changing page, filter and size returns the correct records and resets to page one", async () => {
  const rows = Array.from({ length: 25 }, (_, id) => ({ id, name: id === 24 ? "needle" : "other" }));
  const view = mount(backend(rows), { q: "" });
  try {
    await settle(); assert.equal(view.current.totalElements, 25); assert.equal(view.current.items.length, 10);
    act(() => view.current.onPageChange(2)); await settle();
    assert.equal(view.current.items.length, 5); assert.equal(view.current.items[0].id, 20);
    view.filters({ q: "needle" }); await settle();
    assert.equal(view.current.page, 0); assert.equal(view.current.totalElements, 1);
    assert.equal(view.current.items[0].id, 24);
    view.filters({ q: "" }); await settle();
    assert.equal(view.current.page, 0);
    act(() => view.current.onPageChange(1)); await settle();
    act(() => view.current.onSizeChange(20)); await settle();
    assert.equal(view.current.page, 0); assert.equal(view.current.items.length, 20);
  } finally { view.close(); }
});

test("deleting the final row of a page moves back to an existing page", async () => {
  const rows = Array.from({ length: 21 }, (_, id) => ({ id, name: "row" }));
  const view = mount(backend(rows));
  try {
    await settle(); act(() => view.current.onPageChange(2)); await settle();
    assert.equal(view.current.items.length, 1);
    rows.pop(); act(() => view.current.reload()); await settle(); await settle();
    assert.equal(view.current.page, 1); assert.equal(view.current.items.length, 10);
    assert.equal(view.current.totalElements, 20);
    rows.splice(0); act(() => view.current.reload()); await settle(); await settle();
    assert.equal(view.current.page, 0); assert.equal(view.current.items.length, 0);
  } finally { view.close(); }
});

test("an older response cannot overwrite newer search results", async () => {
  let resolveOld;
  const fetchPage = ({ q }) => q === "old" ? new Promise(resolve => { resolveOld = resolve; }) :
    Promise.resolve({ content: [{ id: 2, name: "new" }], number: 0, size: 10, totalElements: 1, totalPages: 1 });
  const view = mount(fetchPage, { q: "old" });
  try {
    await settle(); view.filters({ q: "new" }); await settle();
    assert.equal(view.current.items[0].name, "new");
    await act(async () => resolveOld({ content: [{ id: 1, name: "old" }], totalElements: 1, totalPages: 1 }));
    assert.equal(view.current.items[0].name, "new");
  } finally { view.close(); }
});

test("a failed request exposes an error and can be retried", async () => {
  let fails = true;
  const view = mount(async () => {
    if (fails) throw new Error("backend unavailable");
    return { content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 };
  });
  try {
    await settle(); assert.equal(view.current.error, "backend unavailable"); assert.equal(view.current.loading, false);
    fails = false; act(() => view.current.reload()); await settle();
    assert.equal(view.current.error, null); assert.equal(view.current.totalElements, 0);
  } finally { view.close(); }
});
