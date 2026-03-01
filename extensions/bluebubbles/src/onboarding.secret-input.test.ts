import type { WizardPrompter } from "openclaw/plugin-sdk";
import { describe, expect, it, vi } from "vitest";

vi.mock("openclaw/plugin-sdk", () => ({
  DEFAULT_ACCOUNT_ID: "default",
  addWildcardAllowFrom: vi.fn(),
  formatDocsLink: (_url: string, fallback: string) => fallback,
  mergeAllowFromEntries: (_existing: unknown, entries: string[]) => entries,
  normalizeAccountId: (value?: string | null) =>
    value && value.trim().length > 0 ? value : "default",
  promptAccountId: vi.fn(),
}));

describe("bluebubbles onboarding SecretInput", () => {
  it("preserves existing password SecretRef when user keeps current credential", async () => {
    const { blueBubblesOnboardingAdapter } = await import("./onboarding.js");
    const passwordRef = { source: "env", provider: "default", id: "BLUEBUBBLES_PASSWORD" };
    const confirm = vi
      .fn()
      .mockResolvedValueOnce(true) // keep server URL
      .mockResolvedValueOnce(true) // keep password SecretRef
      .mockResolvedValueOnce(false); // keep default webhook path
    const text = vi.fn();
    const note = vi.fn();

    const prompter = {
      confirm,
      text,
      note,
    } as unknown as WizardPrompter;

    const result = await blueBubblesOnboardingAdapter.configure({
      cfg: {
        channels: {
          bluebubbles: {
            enabled: true,
            serverUrl: "http://127.0.0.1:1234",
            password: passwordRef,
          },
        },
      },
      prompter,
      accountOverrides: {},
      shouldPromptAccountIds: false,
    });

    expect(result.cfg.channels?.bluebubbles?.password).toEqual(passwordRef);
    expect(text).not.toHaveBeenCalled();
  });
});
