import { vi, describe, expect, it } from "vitest";
import { SignUpFormCOM } from "./sign-up-form.com";

describe("SignUpForm", () => {
  it("calls onSubmit with values", async () => {
    // Setup
    const onSubmit = vi.fn();
    const form = new SignUpFormCOM({ onSubmit });
    const email = "fred@example.com";
    const password = "password";
    const confirmPassword = password;

    // Test
    await form.fillForm({ email, password, confirmPassword });
    await form.submit();

    // Asserts
    expect(onSubmit).toBeCalledWith({ email, password, confirmPassword });
  });
});
