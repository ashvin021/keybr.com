import { test } from "node:test";
import { NotFoundError } from "@fastr/errors";
import { Manifest, ManifestContext } from "@keybr/assets";
import { assert } from "chai";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorPage, inspectError } from "./ErrorPage.tsx";

test("render", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <ErrorPage
        error={{
          expose: true,
          status: 400,
          message: "Bad Request",
        }}
      />
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  assert.deepStrictEqual($("html").attr(), {
    "lang": "en",
    "data-color": "system",
    "data-font": "opensans",
  });
  assert.strictEqual($("title").text(), "400 - Bad Request");
  assert.isTrue($("body").text().includes("400 - Bad Request"));
});

test("inspect error", () => {
  // @ts-expect-error Test invalid arguments.
  assert.isNull(inspectError(undefined));
  // @ts-expect-error Test invalid arguments.
  assert.isNull(inspectError(null));
  // @ts-expect-error Test invalid arguments.
  assert.isNull(inspectError(""));
  // @ts-expect-error Test invalid arguments.
  assert.isNull(inspectError([]));
  // @ts-expect-error Test invalid arguments.
  assert.isNull(inspectError({}));
  // @ts-expect-error Test invalid arguments.
  assert.deepStrictEqual(inspectError({ message: "omg" }), {
    message: "omg",
    status: 500,
    expose: false,
    description: null,
  });
  assert.deepStrictEqual(inspectError(new NotFoundError()), {
    message: "Not Found",
    status: 404,
    expose: true,
    description: null,
  });
  assert.deepStrictEqual(
    inspectError(
      new NotFoundError("OMG", {
        expose: false,
        description: "Page not found",
      }),
    ),
    {
      message: "OMG",
      status: 404,
      expose: false,
      description: "Page not found",
    },
  );
});
