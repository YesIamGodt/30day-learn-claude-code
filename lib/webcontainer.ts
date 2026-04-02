let bootPromise: Promise<unknown> | null = null;

export async function bootWebContainer(): Promise<unknown> {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    const { WebContainer } = await import("@webcontainer/api");
    return await WebContainer.boot();
  })();
  return bootPromise;
}

/** 重置 WebContainer 状态，用于换一个新容器实例 */
export function resetWebContainer(): void {
  bootPromise = null;
}
