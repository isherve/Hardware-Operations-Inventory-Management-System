import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSettings } from "@/components/app-settings";
import { useI18n } from "@/hooks/useI18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-950">
      <div className="absolute right-4 top-4">
        <AppSettings />
      </div>
      <Card className="w-full max-w-md dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-orange-700 dark:text-orange-400">{t("app.name")}</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("app.tagline")}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t("home.chooseLogin")}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/login/admin">{t("auth.adminLogin")}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link to="/login/user">{t("auth.staffLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
