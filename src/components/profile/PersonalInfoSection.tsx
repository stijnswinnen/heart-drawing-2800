import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Lock } from "lucide-react";

export const PersonalInfoSection = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } =
        await supabase.auth.getSession();
      if (error || !currentSession) {
        navigate("/");
        return;
      }
      if (currentSession?.user?.user_metadata?.name) {
        setName(currentSession.user.user_metadata.name);
      }
    };
    checkSession();
  }, [supabase.auth, navigate]);

  const isVerified = !!session?.user?.email_confirmed_at;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      toast.success("Je profiel is bijgewerkt.");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profiel bijwerken mislukt. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) return null;

  const inputCls =
    "w-full font-sans rounded-[10px] border bg-surface text-ink px-4 py-3 outline-none transition-colors focus:border-ink-2";

  return (
    <section
      style={{
        marginTop: 80,
        paddingTop: 48,
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="flex flex-wrap items-baseline"
        style={{ gap: 16, marginBottom: 28 }}
      >
        <h2
          className="font-serif font-normal text-ink m-0"
          style={{ fontSize: 26, letterSpacing: "-0.01em" }}
        >
          Persoonlijke gegevens
        </h2>
        <span
          className="font-sans"
          style={{ fontSize: 13, color: "var(--ink-muted)" }}
        >
          Pas je naam, e-mail of wachtwoord aan.
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          <div>
            <label
              className="block font-sans"
              style={{
                fontSize: 13,
                color: "var(--ink-muted)",
                marginBottom: 8,
              }}
            >
              Naam
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
              className={inputCls}
              style={{ borderColor: "var(--line-strong)" }}
            />
          </div>
          <div>
            <label
              className="block font-sans"
              style={{
                fontSize: 13,
                color: "var(--ink-muted)",
                marginBottom: 8,
              }}
            >
              E-mailadres
            </label>
            <input
              value={session.user.email || ""}
              type="email"
              disabled
              className={inputCls}
              style={{
                borderColor: "var(--line-strong)",
                background: "var(--bg)",
                color: "var(--ink-muted)",
              }}
            />
            {isVerified && (
              <div
                className="inline-flex items-center font-sans"
                style={{
                  marginTop: 8,
                  gap: 6,
                  fontSize: 13,
                  color: "var(--green-700)",
                }}
              >
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>E-mailadres geverifieerd</span>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex flex-wrap items-center"
          style={{ marginTop: 28, gap: 10 }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center h-10 px-5 rounded-full font-sans font-medium transition-colors disabled:opacity-60"
            style={{
              fontSize: 14,
              background: "var(--pink-500)",
              color: "#fff",
            }}
          >
            {isLoading ? "Opslaan..." : "Wijzigingen opslaan"}
          </button>
          <Link
            to="/reset-password"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full font-sans font-medium text-ink bg-surface border border-line-strong hover:border-ink-2 transition-colors"
            style={{ fontSize: 14 }}
          >
            <Lock style={{ width: 14, height: 14 }} />
            Wachtwoord wijzigen
          </Link>
        </div>
      </form>
    </section>
  );
};
