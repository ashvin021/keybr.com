import { test } from "node:test";
import { scramble, Writer } from "@keybr/binary";
import { Layout } from "@keybr/keyboard";
import { Result, ResultFaker, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { assert } from "chai";
import { writeResult } from "./binary.ts";
import { InvalidFormatError } from "./errors.ts";
import { HEADER, HEADER_SIGNATURE, HEADER_VERSION } from "./header.ts";
import { formatMessage, parseMessage } from "./sync.ts";

test("format and parse results", () => {
  const faker = new ResultFaker();
  const result = faker.nextResult();

  const buffer = formatMessage([result]);

  assert.strictEqual(buffer.byteLength, 78);

  const iter = parseMessage(buffer);

  assert.deepStrictEqual([...iter], [result]);
});

test("deserialize should ignore empty data", () => {
  const iter = parseMessage(scramble(new Uint8Array(0)));

  assert.deepStrictEqual([...iter], []);
});

test("deserialize should validate file header", () => {
  const iter = parseMessage(scramble(new Uint8Array(256)));

  assert.throws(() => [...iter], InvalidFormatError);
});

test("deserialize should validate file data", () => {
  const writer = new Writer();
  writer.putBuffer(HEADER);
  writer.putUint8(1);
  writer.putUint8(2);
  writer.putUint8(3);

  const iter = parseMessage(scramble(writer.buffer()));

  assert.throws(() => [...iter], InvalidFormatError);
});

test("deserialize should read invalid results", () => {
  const result = new Result(
    /* layout= */ Layout.EN_US,
    /* textType= */ TextType.GENERATED,
    /* timeStamp= */ Date.parse("2001-02-03T03:05:06Z"),
    /* length= */ 0,
    /* time= */ 0,
    /* errors= */ 0,
    /* histogram= */ new Histogram([]),
  );

  assert.isFalse(result.validate());

  const writer = new Writer();
  writer.putUint32(HEADER_SIGNATURE);
  writer.putUint32(HEADER_VERSION);
  writeResult(writer, result);

  const iter = parseMessage(scramble(writer.buffer()));

  assert.deepStrictEqual([...iter], [result]);
});
