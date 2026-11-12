
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Platform = "LeetCode" | "GeeksforGeeks" | "CodeChef" | "Codeforces";

type Account = {
  id: string;
  user_id: string;
  platform: Platform;
  username: string;
};

type Props = {
  user: User | null;
  colors: {
    background: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
    hover: string;
  };
  accent: string;
  requireLogin: () => boolean;
};

const platforms: {
  name: Platform;
  short: string;
  description: string;
}[] = [
  {
    name: "LeetCode",
    short: "LC",
    description: "Track problem-solving and contest performance.",
  },
  {
    name: "GeeksforGeeks",
    short: "GFG",
    description: "Track practice and coding activity.",
  },
  {
    name: "CodeChef",
    short: "CC",
    description: "Track submissions and contest ratings.",
  },
  {
    name: "Codeforces",
    short: "CF",
    description: "Track submissions and competitive programming.",
  },
];

export default function Platforms({
  user,
  colors,
  accent,
  requireLogin,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAccounts() {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("platform_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      const records = (data ?? []) as Account[];
      setAccounts(records);

      const values: Record<string, string> = {};
      records.forEach((account) => {
        values[account.platform] = account.username;
      });
      setUsernames(values);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAccounts();
  }, [user?.id]);

  async function connectPlatform(platform: Platform) {
    if (!user) {
      requireLogin();
      return;
    }

    const username = (usernames[platform] ?? "").trim();

    if (!username) {
      setError(`Enter your ${platform} username first.`);
      return;
    }

    setSaving(platform);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("platform_accounts")
      .upsert(
        {
          user_id: user.id,
          platform,
          username,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform" }
      );

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`${platform} username saved successfully.`);
      await loadAccounts();
    }

    setSaving(null);
  }

  async function disconnectPlatform(platform: Platform) {
    if (!user) {
      requireLogin();
      return;
    }

    const confirmed = window.confirm(
      `Disconnect your ${platform} account?`
    );

    if (!confirmed) return;

    setSaving(platform);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("platform_accounts")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    if (error) {
      setError(error.message);
    } else {
      setUsernames((previous) => ({
        ...previous,
        [platform]: "",
      }));
      setSuccess(`${platform} disconnected.`);
      await loadAccounts();
    }

    setSaving(null);
  }

  const inputStyle = {
    background: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold">
          Platform Connections
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: colors.muted }}
        >
          Connect your coding profiles in one place.
        </p>
      </div>

      <div
        className="mb-5 rounded-lg border p-4"
        style={{
          background: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              Your connected platforms
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: colors.muted }}
            >
              {accounts.length} of {platforms.length} accounts saved
            </p>
          </div>

          <span
            className="rounded-md px-3 py-1.5 text-xs"
            style={{
              background: `${accent}18`,
              color: accent,
            }}
          >
            {accounts.length} connected
          </span>
        </div>
      </div>

      {!user && (
        <div
          className="mb-5 rounded-lg border p-4 text-xs"
          style={{
            borderColor: colors.border,
            color: colors.muted,
          }}
        >
          You can explore this section without signing in.
          Login is required to connect your own accounts.
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-md border border-red-500/40 p-3 text-xs text-red-500">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-md border border-green-500/40 p-3 text-xs text-green-600">
          {success}
        </p>
      )}

      {loading ? (
        <p
          className="py-12 text-center text-sm"
          style={{ color: colors.muted }}
        >
          Loading platforms...
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((platform) => {
            const account = accounts.find(
              (item) => item.platform === platform.name
            );

            const isConnected = Boolean(account);

            return (
              <div
                key={platform.name}
                className="rounded-lg border p-5"
                style={{
                  background: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold"
                      style={{
                        background: `${accent}18`,
                        color: accent,
                      }}
                    >
                      {platform.short}
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        {platform.name}
                      </h2>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: colors.muted }}
                      >
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-2 py-1 text-[10px]"
                    style={{
                      background: isConnected
                        ? "rgba(34,197,94,0.12)"
                        : colors.hover,
                      color: isConnected
                        ? "#22a06b"
                        : colors.muted,
                    }}
                  >
                    {isConnected ? "Saved" : "Not connected"}
                  </span>
                </div>

                <div className="mt-5">
                  <label
                    className="mb-2 block text-xs"
                    style={{ color: colors.muted }}
                  >
                    Platform username
                  </label>

                  <input
                    value={usernames[platform.name] ?? ""}
                    onChange={(e) =>
                      setUsernames((previous) => ({
                        ...previous,
                        [platform.name]: e.target.value,
                      }))
                    }
                    disabled={!user || saving === platform.name}
                    placeholder={`Enter ${platform.name} username`}
                    className="w-full rounded-md border px-3 py-2.5 text-xs outline-none disabled:opacity-60"
                    style={inputStyle}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => connectPlatform(platform.name)}
                    disabled={saving === platform.name || !user}
                    className="flex-1 rounded-md px-3 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                    style={{ background: accent }}
                  >
                    {saving === platform.name
                      ? "Saving..."
                      : isConnected
                        ? "Update username"
                        : "Save account"}
                  </button>

                  {isConnected && (
                    <button
                      onClick={() =>
                        disconnectPlatform(platform.name)
                      }
                      disabled={saving === platform.name}
                      className="rounded-md border px-3 py-2.5 text-xs disabled:opacity-50"
                      style={{
                        borderColor: colors.border,
                        color: colors.muted,
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p
        className="mt-5 text-xs leading-5"
        style={{ color: colors.muted }}
      >
        Saving a username does not verify the external account
        or fetch its activity yet. Automatic syncing will be
        implemented separately.
      </p>
    </div>
  );
}
