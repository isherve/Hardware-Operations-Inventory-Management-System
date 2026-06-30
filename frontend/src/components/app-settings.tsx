import { Moon, Sun, Languages } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSettings({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        title={theme === "dark" ? t("settings.light") : t("settings.dark")}
        aria-label={t("settings.theme")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {theme === "dark" ? t("settings.light") : t("settings.dark")}
        </span>
      </Button>
      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        <Languages className="mx-1 h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Button
          type="button"
          variant={locale === "en" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-2"
          onClick={() => setLocale("en")}
        >
          EN
        </Button>
        <Button
          type="button"
          variant={locale === "fr" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-2"
          onClick={() => setLocale("fr")}
        >
          FR
        </Button>
      </div>
    </div>
  );
}
