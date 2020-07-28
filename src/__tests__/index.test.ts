import omt, { replaceWorkerPathToInlineWorker } from "../index";
import memfs from "memfs/lib/promises";
import { Volume } from "memfs";
import { memfsPlugin } from "rollup-plugin-memfs";
import { rollup, OutputChunk } from "rollup";
import assert from "assert";

const fs = memfs(
  Volume.fromJSON({
    "/worker.js": "self.onmessage = (ev) => console.log(ev)",
    "/index.js": "new Worker('./worker.js')",
  })
);

test("build", async () => {
  const rolled = await rollup({
    input: "/index.js",
    plugins: [memfsPlugin(fs as any), omt({})],
  });
  const gen = await rolled.generate({
    format: "es",
  });
  const code = gen.output[0].code;
  assert.ok(code.includes('new Worker("./'));
});

test("build inline", async () => {
  const rolled = await rollup({
    input: "/index.js",
    plugins: [memfsPlugin(fs as any), omt({})],
  });
  const gen = await rolled.generate({
    format: "es",
  });
  const chunks = gen.output.filter((o) => o.type === "chunk") as OutputChunk[];
  const main = chunks.find((e) => e.fileName === "index.js")!.code;
  const inlined = replaceWorkerPathToInlineWorker(main, chunks);
  assert.ok(inlined.includes("URL.createObjectURL(new Blob("));
});
