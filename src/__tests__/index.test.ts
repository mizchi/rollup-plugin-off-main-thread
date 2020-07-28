import omt from "../index";
import memfs from "memfs/lib/promises";
import { Volume } from "memfs";
import { memfsPlugin } from "rollup-plugin-memfs";
import { rollup } from "rollup";

const fs = memfs(
  Volume.fromJSON({
    "/worker.js": "self.onmessage = (ev) => console.log(ev)",
    "/index.js": "new Worker('./worker.js')",
  })
);

test("xxx", async () => {
  const rolled = await rollup({
    input: "/index.js",
    plugins: [
      memfsPlugin(fs as any),
      omt({
        // publicPath: "./",
      }),
    ],
  });
  const gen = await rolled.generate({
    format: "es",
  });
  console.log(gen.output);
});
