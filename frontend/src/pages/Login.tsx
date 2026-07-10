import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginProps {
  /** Called with { email, password } when the form is submitted */
  onSubmit?: (data: LoginFormData) => void;
  /** Called when the user clicks the "Sign up" link */
  onSwitchToRegister?: () => void;
}

/**
 * Login
 * Self-contained sign-in page (no external components) — split layout
 * with a form panel on the left and a gradient promo panel on the right.
 */
export default function Login({
  onSubmit,
  onSwitchToRegister,
}: LoginProps) {
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit?.(form);
  };

  // Loose sine-like curve so it reads as an audio waveform, not a bar chart.
  const waveformHeights: number[] = [30, 55, 80, 45, 65, 90, 50, 35, 60, 40, 70, 48, 32];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#d8d7dd] px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* Left: form panel */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your details to access your dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1f3a2e] focus:ring-1 focus:ring-[#1f3a2e]"
                />
              </div>

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1f3a2e] focus:ring-1 focus:ring-[#1f3a2e]"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full rounded-md bg-[#1f3a2e] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16281f] focus:outline-none focus:ring-2 focus:ring-[#1f3a2e] focus:ring-offset-2"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="mt-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.94v2.33A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.97 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.94a9 9 0 0 0 0 8.08l3.03-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.96l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-gray-900 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Right: promo panel */}
        <div
          className="relative hidden md:flex flex-col justify-between overflow-hidden p-10"
          style={{
            backgroundImage:
              "linear-gradient(150deg, #14261c 0%, #33422f 22%, #6a6a4f 46%, #a3826d 72%, #dc9d80 100%)",
          }}
        >
          {/* top spacer keeps the waveform band centered in the upper half */}
          <div />

          <div
            className="pointer-events-none mx-auto flex h-36 w-full max-w-[260px] select-none items-center justify-center gap-2.5 opacity-40"
            aria-hidden="true"
          >
            {waveformHeights.map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-white"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              Ads that fit their moment.
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              The creative studio meets SaaS dashboard for modern audio campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}