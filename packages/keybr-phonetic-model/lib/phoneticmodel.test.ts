import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { toCodePoints } from "@keybr/unicode";
import { assert } from "chai";
import { TransitionTableBuilder } from "./builder.ts";
import { Filter } from "./filter.ts";
import { Letter } from "./letter.ts";
import { makePhoneticModel } from "./phoneticmodel.ts";

test("generate text from an empty transition table", () => {
  const alphabet = [0x0020, 0x0061, 0x0062, 0x0063, 0x0064];

  const builder = new TransitionTableBuilder(4, alphabet);

  const model = makePhoneticModel(Language.EN, builder.build());
  const { letters } = model;
  const [a, b, c, d] = letters;

  assert.deepStrictEqual(letters, [
    new Letter(0x0061, 0.0, "A"),
    new Letter(0x0062, 0.0, "B"),
    new Letter(0x0063, 0.0, "C"),
    new Letter(0x0064, 0.0, "D"),
  ]);

  assert.strictEqual(model.nextWord(new Filter(null, null)), "");
  assert.strictEqual(model.nextWord(new Filter([a], null)), "");
  assert.strictEqual(model.nextWord(new Filter([a], a)), "a");
  assert.strictEqual(model.nextWord(new Filter([a, b, c, d], a)), "a");
});

test("generate text from a partial transition table", () => {
  const alphabet = [0x0020, 0x0061, 0x0062, 0x0063, 0x0064];

  const builder = new TransitionTableBuilder(4, alphabet);

  builder.set([0x0020, 0x0020, 0x0020, 0x0020], 1);
  builder.set([0x0020, 0x0020, 0x0020, 0x0061], 1);
  builder.set([0x0020, 0x0020, 0x0020, 0x0062], 1);
  builder.set([0x0020, 0x0020, 0x0020, 0x0063], 1);
  builder.set([0x0020, 0x0020, 0x0020, 0x0064], 1);

  const model = makePhoneticModel(Language.EN, builder.build());
  const { letters } = model;
  const [a, b, c, d] = letters;

  assert.deepStrictEqual(letters, [
    new Letter(0x0061, 0.25, "A"),
    new Letter(0x0062, 0.25, "B"),
    new Letter(0x0063, 0.25, "C"),
    new Letter(0x0064, 0.25, "D"),
  ]);

  assert.match(model.nextWord(new Filter(null, null)), /^[abcd]$/);
  assert.match(model.nextWord(new Filter([a], null)), /^[a]$/);
  assert.match(model.nextWord(new Filter([a], a)), /^[a]$/);
  assert.match(model.nextWord(new Filter([a, b, c, d], a)), /^[a]$/);
});

test("generate text from a full transition table", () => {
  const alphabet = [0x0020, 0x0061, 0x0062, 0x0063, 0x0064];

  const builder = new TransitionTableBuilder(4, alphabet);

  for (const l1 of alphabet) {
    for (const l2 of alphabet) {
      for (const l3 of alphabet) {
        for (const l4 of alphabet) {
          builder.set([l1, l2, l3, l4], 1);
        }
      }
    }
  }

  const model = makePhoneticModel(Language.EN, builder.build());
  const { letters } = model;
  const [a, b, c, d] = letters;

  assert.deepStrictEqual(letters, [
    new Letter(0x0061, 0.25, "A"),
    new Letter(0x0062, 0.25, "B"),
    new Letter(0x0063, 0.25, "C"),
    new Letter(0x0064, 0.25, "D"),
  ]);

  assert.match(model.nextWord(new Filter(null, null)), /^[abcd]{3,}$/);
  assert.match(model.nextWord(new Filter([a], null)), /^[a]{3,}$/);
  assert.match(model.nextWord(new Filter([a], a)), /^[a]{3,}$/);
  assert.match(model.nextWord(new Filter([a, b, c, d], a)), /^[abcd]{3,}$/);
});

test("appended words", () => {
  const alphabet = [...toCodePoints(" abcdefghijklmnopqrstuvw")];

  const builder = new TransitionTableBuilder(4, alphabet);

  builder.append("hello");

  const model = makePhoneticModel(Language.EN, builder.build());

  assert.strictEqual(model.nextWord(new Filter(null, null)), "hello");
  assert.strictEqual(model.nextWord(new Filter(null, null)), "hello");
  assert.strictEqual(model.nextWord(new Filter(null, null)), "hello");
});
