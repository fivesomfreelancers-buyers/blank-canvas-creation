import { useTheme, type ThemePreference } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const Preview = ({ dark }: { dark: boolean }) => (
  <div className={cn("h-full w-full p-2 flex gap-1.5", dark ? "dark bg-background" : "bg-background")}>
    <div className="w-3 rounded bg-muted" />
    <div className="flex-1 space-y-1.5 pt-1">
      <div className="h-1.5 w-3/4 rounded bg-primary" />
      <div className="h-1.5 w-1/2 rounded bg-muted-foreground/40" />
      <div className="h-1.5 w-2/3 rounded bg-primary/70" />
    </div>
  </div>
);

const options: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ColorModePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-foreground">Color mode</p>
        <p className="text-sm text-muted-foreground">Use light or dark colors, or follow your system setting</p>
      </div>
      <div className="flex gap-3" role="radiogroup" aria-label="Color mode">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={preference === o.value}
            onClick={() => setPreference(o.value)} className="flex flex-col items-center gap-1">
            <span className={cn("block h-16 w-24 overflow-hidden rounded-xl border-2", preference === o.value ? "border-primary" : "border-border")}>
              {o.value === "system" ? (
                <span className="flex h-full"><span className="w-1/2 overflow-hidden"><Preview dark={false} /></span><span className="w-1/2 overflow-hidden"><Preview dark /></span></span>
              ) : <Preview dark={o.value === "dark"} />}
            </span>
            <span className="text-xs text-muted-foreground">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
