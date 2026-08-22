/**
 * Pure billing helpers — run with:
 *   npx --yes tsx --test utils/billing.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  escapeIlikeLiteral,
  formatAmountFromCents,
  resolvePlanFromPayload,
  settingsSaveErrorMessage,
} from "./billing";

describe("escapeIlikeLiteral", () => {
  it("escapes underscore so emails are not treated as wildcards", () => {
    assert.equal(escapeIlikeLiteral("john_doe@gmail.com"), "john\\_doe@gmail.com");
  });

  it("escapes percent and backslash", () => {
    assert.equal(escapeIlikeLiteral("a%b\\c"), "a\\%b\\\\c");
  });
});

describe("formatAmountFromCents", () => {
  it("formats whole dollars", () => {
    assert.equal(formatAmountFromCents(1900), "19.00");
  });

  it("returns 0.00 for bad input", () => {
    assert.equal(formatAmountFromCents(null), "0.00");
    assert.equal(formatAmountFromCents(Number.NaN), "0.00");
  });
});

describe("resolvePlanFromPayload", () => {
  it("maps starter product id env to PRO", () => {
    process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID = "pdt_starter_test";
    delete process.env.NEXT_PUBLIC_DODO_TEAM_PRODUCT_ID;

    const plan = resolvePlanFromPayload({
      product: { id: "pdt_starter_test" },
    });
    assert.equal(plan.tier, "PRO");
  });

  it("maps team product id env to BUSINESS", () => {
    process.env.NEXT_PUBLIC_DODO_TEAM_PRODUCT_ID = "pdt_team_test";
    const plan = resolvePlanFromPayload({
      product: { id: "pdt_team_test" },
    });
    assert.equal(plan.tier, "BUSINESS");
  });
});

describe("settingsSaveErrorMessage", () => {
  it("prefers the API error string", () => {
    assert.equal(
      settingsSaveErrorMessage(false, {
        error: "Free plan allows 1 active repository. Upgrade to connect more.",
      }),
      "Free plan allows 1 active repository. Upgrade to connect more."
    );
  });

  it("falls back when the body is empty", () => {
    assert.equal(settingsSaveErrorMessage(false, null), "Could not save settings. Try again.");
  });
});
