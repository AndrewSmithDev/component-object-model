import { cleanup } from "@testing-library/react";
import { vi, describe, expect, it, afterEach, beforeEach, Mock } from "vitest";
import { SignUpFormCOM } from "./sign-up-form.com";

describe("SignUpForm", () => {
  let onSubmit: Mock;
  let form: SignUpFormCOM;

  beforeEach(() => {
    onSubmit = vi.fn();
    form = new SignUpFormCOM({ onSubmit });
  });

  afterEach(() => {
    cleanup();
  });

  it("calls onSubmit with values when the form is valid", async () => {
    const formData = {
      email: "fred@example.com",
      password: "password",
      confirmPassword: "password",
    };

    await form.fillForm(formData);
    await form.submit();

    expect(onSubmit).toBeCalledWith(formData);
  });

  it("does not call onSubmit when the form is invalid", async () => {
    await form.fillForm({});
    await form.submit();

    expect(onSubmit).toBeCalledTimes(0);
  });

  it("ensures that an email is provided", async () => {
    await form.fillForm({});
    await form.submit();

    const errorMessage = form.getEmailRequiredMessage();
    expect(errorMessage).toBeDefined();
  });

  it("ensures that a password is provided", async () => {
    await form.fillForm({});
    await form.submit();

    const errorMessage = form.getPasswordRequiredMessage();
    expect(errorMessage).toBeDefined();
  });

  it("ensures that a confirmation password is provided", async () => {
    await form.fillForm({});
    await form.submit();

    const errorMessage = form.getConfirmPasswordRequiredMessage();
    expect(errorMessage).toBeDefined();
  });

  it("ensures that the password is at least 8", async () => {
    await form.fillForm({ password: "short" });
    await form.submit();

    const errorMessage = form.getPasswordLengthMessage();
    expect(errorMessage).toBeDefined();
  });

  it("ensures that the passwords match", async () => {
    await form.fillForm({ password: "password1", confirmPassword: "password2" });
    await form.submit();

    const errorMessage = form.getPasswordsDoNotMatchMessage();
    expect(errorMessage).toBeDefined();
  });
});
