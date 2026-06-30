import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { ApiClientError } from "@/lib/api";
import { AppSettings } from "@/components/app-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password, "EMPLOYEE");
      toast.success(t("auth.welcome", { name: user.displayName }));
      navigate(user.mustChangePassword ? "/change-password" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <AppSettings />
      </div>
      <Card className="w-full max-w-md dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>{t("auth.staffLogin")}</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.staffDesc")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="text-orange-600 hover:underline dark:text-orange-400">
              {t("auth.backHome")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
