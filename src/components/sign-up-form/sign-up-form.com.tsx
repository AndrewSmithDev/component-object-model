import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpData, SignUpForm, SignUpProps } from "./sign-up-form";

export class SignUpFormCOM {
  #utils: RenderResult;
  #emailInput: HTMLElement;
  #passwordInput: HTMLElement;
  #confirmPasswordInput: HTMLElement;
  #submitButton: HTMLElement;

  constructor(props: SignUpProps) {
    this.#utils = render(<SignUpForm {...props} />);
    this.#emailInput = this.#utils.getByLabelText("Email:");
    this.#passwordInput = this.#utils.getByLabelText("Password:");
    this.#confirmPasswordInput = this.#utils.getByLabelText("Confirm Password:");
    this.#submitButton = this.#utils.getByText("Submit");
  }

  async fillForm({ email, password, confirmPassword }: Partial<SignUpData>) {
    if (email) await userEvent.type(this.#emailInput, email);
    if (password) await userEvent.type(this.#passwordInput, password);
    if (confirmPassword) await userEvent.type(this.#confirmPasswordInput, confirmPassword);
  }

  submit() {
    return userEvent.click(this.#submitButton);
  }

  #getValidationMessage(errorMessage: string | RegExp) {
    return this.#utils.getByText(errorMessage);
  }

  getEmailRequiredMessage() {
    return this.#getValidationMessage("Email is required");
  }

  getPasswordLengthMessage() {
    return this.#getValidationMessage("Password must be at least 8 characters");
  }

  getPasswordRequiredMessage() {
    return this.#getValidationMessage("Password is required");
  }

  getConfirmPasswordRequiredMessage() {
    return this.#getValidationMessage("You must confirm your password");
  }

  getPasswordsDoNotMatchMessage() {
    return this.#getValidationMessage("Passwords do not match");
  }
}
