import { render, RenderResult, screen } from "@testing-library/react";
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

  async fillForm({ email, password, confirmPassword }: SignUpData) {
    await userEvent.type(this.#emailInput, email);
    await userEvent.type(this.#passwordInput, password);
    await userEvent.type(this.#confirmPasswordInput, confirmPassword);
  }

  submit() {
    return userEvent.click(this.#submitButton);
  }

  getValidationMessage(errorMessage: string): HTMLElement {
    return this.#utils.getByText(errorMessage);
  }
}
