import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — DEX" }] }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-white/90 p-6">
        <h1 className="text-2xl font-semibold">Blog (Demo)</h1>
        <p className="mt-3 text-sm text-muted-foreground">Demo blog listing page.</p>
      </div>
    </div>
  );
}
