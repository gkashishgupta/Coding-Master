
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Projects from "@/components/Projects";
import Platforms from "@/components/Platforms";
import type { User } from "@supabase/supabase-js";

const accentColors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#2daf5d" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky Blue", value: "#1199d7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Magenta", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
];

const navigation = [
  { name: "Overview", icon: "⌂" },
  { name: "Platforms", icon: "◫" },
  { name: "Practice", icon: "⌘" },
  { name: "Contest Rating", icon: "↗" },
  { name: "Code Vault", icon: "⌘" },
  { name: "Projects", icon: "▤" },
  { name: "Goals", icon: "◎" },
  { name: "Analytics", icon: "▥" },
];

const platformNames = [
  "GitHub",
  "LeetCode",
  "GeeksforGeeks",
  "CodeChef",
];

type Theme = "dark" | "light";

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState("#3b82f6");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("cm-theme") as Theme | null;
    const savedAccent = localStorage.getItem("cm-accent");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedAccent && accentColors.some((c) => c.value === savedAccent)) {
      setAccent(savedAccent);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cm-theme", theme);
    localStorage.setItem("cm-accent", accent);
  }, [theme, accent]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(error.message);
      }

      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const dark = theme === "dark";

  const colors = {
    background: dark ? "#0d1117" : "#ffffff",
    sidebar: dark ? "#0d1117" : "#f6f8fa",
    surface: dark ? "#161b22" : "#ffffff",
    border: dark ? "#30363d" : "#d1d9e0",
    text: dark ? "#e6edf3" : "#1f2328",
    muted: dark ? "#8b949e" : "#656d76",
    hover: dark ? "#21262d" : "#eaeef2",
  };

  const pageStyle = {
    backgroundColor: colors.background,
    color: colors.text,
    "--accent": accent,
  } as React.CSSProperties;

  function changePage(name: string) {
    setActive(name);
    setSettingsOpen(false);
  }

  function requireLogin() {
    if (!user) {
      window.location.href = "/login";
      return false;
    }

    return true;
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
    }
  }

  function renderOverview() {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-2 text-sm" style={{ color: colors.muted }}>
            Your developer activity, all in one place.
          </p>
        </div>

        <section
          className="mb-6 rounded-lg border p-5"
          style={{ borderColor: colors.border, background: colors.surface }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Your workspace</h2>
              <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                Connect your coding platforms to get started.
              </p>
            </div>
            <button
              onClick={() => changePage("Platforms")}
              className="rounded-md px-3 py-2 text-xs font-medium text-white"
              style={{ background: accent }}
            >
              {user ? "Connect platforms" : "Explore platforms"}
            </button>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            "Coding activity",
            "Current streak",
            "Problems solved",
            "Active projects",
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg border p-4"
              style={{
                borderColor: colors.border,
                background: colors.surface,
              }}
            >
              <p className="text-xs" style={{ color: colors.muted }}>
                {item}
              </p>
              <p className="mt-3 text-xl font-semibold">—</p>
              <p className="mt-1 text-[11px]" style={{ color: colors.muted }}>
                No data yet
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <section
            className="rounded-lg border p-5"
            style={{ borderColor: colors.border, background: colors.surface }}
          >
            <h2 className="text-sm font-semibold">Contribution activity</h2>
            <p className="mt-1 text-xs" style={{ color: colors.muted }}>
              Your activity will appear here after connecting platforms.
            </p>

            <div
              className="mt-8 flex min-h-32 items-center justify-center rounded-md border border-dashed text-xs"
              style={{ borderColor: colors.border, color: colors.muted }}
            >
              No activity recorded yet
            </div>
          </section>

          <section
            className="rounded-lg border p-5"
            style={{ borderColor: colors.border, background: colors.surface }}
          >
            <h2 className="text-sm font-semibold">Coding platforms</h2>

            <div className="mt-4 space-y-4">
              {platformNames.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3"
                >
                  <p className="text-xs font-medium">{name}</p>
                  <span className="text-xs" style={{ color: colors.muted }}>
                    View
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => changePage("Platforms")}
              className="mt-5 text-xs font-medium hover:underline"
              style={{ color: accent }}
            >
              Manage platforms →
            </button>
          </section>
        </div>

        <section
          className="mt-5 rounded-lg border p-5"
          style={{ borderColor: colors.border, background: colors.surface }}
        >
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <div
            className="mt-5 flex min-h-20 items-center justify-center text-xs"
            style={{ color: colors.muted }}
          >
            Your recent coding activity will appear here.
          </div>
        </section>
      </>
    );
  }

  function renderEmptySection(title: string, description: string) {
    return (
      <>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          {description}
        </p>

        <div
          className="mt-6 flex min-h-48 items-center justify-center rounded-lg border border-dashed text-sm"
          style={{ borderColor: colors.border, color: colors.muted }}
        >
          Nothing here yet.
        </div>
      </>
    );
  }

  function renderComingSoon() {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          ⌘
        </div>

        <span
          className="rounded-full px-3 py-1 text-[10px] font-medium"
          style={{ background: `${accent}18`, color: accent }}
        >
          COMING SOON
        </span>

        <h1 className="mt-5 text-2xl font-semibold">Code Vault</h1>

        <p
          className="mt-3 max-w-sm text-sm leading-6"
          style={{ color: colors.muted }}
        >
          Your coding solutions, submissions and saved snippets
          will have a dedicated home here.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen md:flex" style={pageStyle}>
      <aside
        className="flex w-full shrink-0 flex-col border-b md:min-h-screen md:w-60 md:border-b-0 md:border-r"
        style={{
          background: colors.sidebar,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            CM
          </div>
          <div>
            <p className="text-sm font-semibold">Coding Master</p>
            <p className="text-[11px]" style={{ color: colors.muted }}>
              Developer workspace
            </p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          <p
            className="hidden px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider md:block"
            style={{ color: colors.muted }}
          >
            Workspace
          </p>

          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => changePage(item.name)}
              className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors"
              style={{
                background: active === item.name ? colors.hover : "transparent",
                color: active === item.name ? colors.text : colors.muted,
              }}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div
          className="mt-auto hidden border-t p-4 md:block"
          style={{ borderColor: colors.border }}
        >
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full rounded-md px-3 py-2 text-left text-xs"
            style={{ color: colors.muted }}
          >
            ⚙ Settings
          </button>
          <p className="mt-4 px-3 text-[10px]" style={{ color: colors.muted }}>
            CODING MASTER
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header
          className="flex items-center justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: colors.border }}
        >
          <p className="text-xs" style={{ color: colors.muted }}>
            Workspace / {settingsOpen ? "Settings" : active}
          </p>

          <div className="flex items-center gap-3">
            {!authLoading &&
              (user ? (
                <>
                  <span
                    className="hidden max-w-40 truncate text-xs sm:block"
                    style={{ color: colors.muted }}
                  >
                    {user.email}
                  </span>

                  <button
                    onClick={handleSignOut}
                    className="rounded-md border px-3 py-2 text-xs"
                    style={{ borderColor: colors.border }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="rounded-md px-3 py-2 text-xs font-medium text-white"
                  style={{ background: accent }}
                >
                  Sign in
                </button>
              ))}

            <button
              onClick={() => setTheme(dark ? "light" : "dark")}
              className="rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: colors.border }}
            >
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-5 md:p-8">
          {settingsOpen ? (
            <>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="mb-8 mt-2 text-sm" style={{ color: colors.muted }}>
                Personalise your workspace.
              </p>

              <section
                className="rounded-lg border p-5"
                style={{ borderColor: colors.border, background: colors.surface }}
              >
                <h2 className="text-sm font-semibold">Appearance</h2>
                <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                  Choose your preferred display mode.
                </p>

                <div className="mt-4 flex gap-2">
                  {(["light", "dark"] as Theme[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTheme(mode)}
                      className="rounded-md border px-4 py-2 text-xs capitalize"
                      style={{
                        borderColor: theme === mode ? accent : colors.border,
                        background:
                          theme === mode ? `${accent}18` : "transparent",
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div
                  className="mt-8 border-t pt-5"
                  style={{ borderColor: colors.border }}
                >
                  <h2 className="text-sm font-semibold">Accent colour</h2>
                  <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                    Choose from these 13 colours.
                  </p>

                  <div className="mt-5 grid grid-cols-4 gap-4 sm:grid-cols-7">
                    {accentColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setAccent(color.value)}
                        className="flex flex-col items-center gap-2"
                        title={color.name}
                        aria-label={color.name}
                      >
                        <span
                          className="h-8 w-8 rounded-full border-2"
                          style={{
                            background: color.value,
                            borderColor:
                              accent === color.value
                                ? colors.text
                                : "transparent",
                            outline:
                              accent === color.value
                                ? `2px solid ${color.value}`
                                : "none",
                            outlineOffset: "3px",
                          }}
                        />
                        <span
                          className="text-[10px]"
                          style={{ color: colors.muted }}
                        >
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : active === "Overview" ? (
            renderOverview()
          ) : active === "Platforms" ? (
            <Platforms
              user={user}
              colors={colors}
              accent={accent}
              requireLogin={requireLogin}
            />
          ) : active === "Projects" ? (
            <Projects
              user={user}
              colors={colors}
              accent={accent}
              requireLogin={requireLogin}
            />
          ) : active === "Practice" ? (
            renderEmptySection(
              "Practice History",
              "Your daily coding activity across connected platforms will appear here."
            )
          ) : active === "Contest Rating" ? (
            renderEmptySection(
              "Contest Rating",
              "Select a coding platform to view your current rating and contest history."
            )
          ) : active === "Code Vault" ? (
            renderComingSoon()
          ) : active === "Goals" ? (
            renderEmptySection(
              "Goals",
              "Set coding goals and track your progress."
            )
          ) : (
            renderEmptySection(
              "Analytics",
              "Understand your coding progress and consistency."
            )
          )}

          <footer
            className="mt-12 border-t pt-5 text-[11px]"
            style={{ borderColor: colors.border, color: colors.muted }}
          >
            Coding Master · Developer workspace
          </footer>
        </div>
      </section>
    </main>
  );
}
