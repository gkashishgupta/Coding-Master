
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        if (data.session) {
          window.location.href = "/";
        } else {
          setMessage(
            "Account created! Check your email to verify your account."
          );
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function exploreAsGuest() {
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#08090b] px-5 text-white">
      <div className="w-full max-w-md border border-white/10 p-8 rounded-xl">
        <h1 className="text-2xl font-semibold mb-2">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>

        <p className="text-sm text-gray-400 mb-8">
          {isLogin
            ? "Sign in to continue to Coding Master."
            : "Start managing your coding journey."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-white/50"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-md border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-white/50"
            />
          </div>

          {message && (
            <p className="text-sm text-amber-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white py-3 font-medium text-black disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="text-white underline underline-offset-4"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

        <div className="flex items-center gap-4 my-7">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={exploreAsGuest}
          className="w-full rounded-md border border-white/20 py-3 text-sm font-medium text-white transition hover:bg-white/5"
        >
          Explore as Guest →
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          No account required to explore Coding Master.
        </p>
      </div>
    </main>
  );
}
