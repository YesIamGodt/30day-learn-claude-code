let bootPromise: Promise<unknown> | null = null;

export async function bootWebContainer(): Promise<unknown> {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    const { WebContainer } = await import("@webcontainer/api");
    return await WebContainer.boot();
  })();
  return bootPromise;
}

export async function runCode(
  code: string,
  onOutput: (text: string) => void
): Promise<void> {
  try {
    const container = (await bootWebContainer()) as {
      mount: (files: Record<string, unknown>) => Promise<unknown>;
      spawn: (cmd: string, args: string[]) => Promise<{
        output: { pipeTo: (ws: WritableStream<unknown>) => void };
        exit: Promise<number>;
      }>;
    };

    await container.mount({
      "index.js": { file: { contents: code } },
    });

    const proc = await container.spawn("node", ["index.js"]);

    proc.output.pipeTo(
      new WritableStream({
        write(data: string) {
          onOutput(data);
        },
      })
    );

    const exitCode = await proc.exit;
    if (exitCode !== 0) {
      onOutput(`\n[进程退出，代码: ${exitCode}]`);
    }
  } catch (e: unknown) {
    onOutput(`[错误] ${String(e)}`);
  }
}
