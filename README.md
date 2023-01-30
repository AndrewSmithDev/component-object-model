## Introduction

React components can be complex and difficult to test, especially when they contain multiple elements and interactions. To simplify testing, it's best to separate the test code from the component implementation details by creating a reusable module for interactions and queries. This makes tests easier to read, write, and maintain.

The Component Object Model (COM) pattern is a powerful way to organize test code by abstracting the implementation details of the component into a separate class. This class, referred to as the COM, contains all the interactions and queries used to test the component. By separating the component logic from the test logic, the COM pattern enables easy reuse of component interactions across multiple tests and minimizes the impact of component changes on the test code, while also making the tests easier to read and understand.

## Example

Consider a simple SignUpForm component with basic validation. The form is validated before submission. If there are no errors, the onSubmit prop is executed with the form data. If errors are present, they will be shown and the onSubmit callback will not run.

```tsx
// sign-up-form.tsx
import { useState } from "react";

export type SignUpData = {
  email: string;
  password: string;
};

export type SignUpProps = {
  onSubmit: (data: SignUpData) => void;
};

export const SignUpForm = ({ onSubmit }: SignUpProps) => {
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setEmailMsg("");
    setPasswordMsg("");

    if (email === "") setEmailMsg("Email is required");
    if (password.length < 8) setPasswordMsg("Password must be at least 8 characters");

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    onSubmit({ email, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>{emailMsg}</p>
      <label>
        Email:
        <input
          type="text"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <p>{passwordMsg}</p>
      <label>
        Password:
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### The Component Object Model

To test this component, we create the SignUpFormCOM class, which encapsulates all interactions with the SignUpForm component. The test code will use the methods provided by SignUpFormCOM to fill in the form and submit it, making the test code easy to read and understand.

For example, the `fillForm` method will take in values for email and password and simulate the user filling in the form. The `submitForm` method will simulate a user submitting the form. This abstraction makes it easy to test the component and easy to reuse component interactions across multiple tests, without affecting the test code, since all interactions are in one place.

```typescript
// sign-up-form.com.tsx
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpData, SignUpForm, SignUpProps } from "./sign-up-form";

export class SignUpFormCOM {
  #utils: RenderResult;
  #emailInput: HTMLElement;
  #passwordInput: HTMLElement;
  #submitButton: HTMLElement;

  constructor(props: SignUpProps) {
    this.#utils = render(<SignUpForm {...props} />);
    this.#emailInput = this.#utils.getByLabelText("Email:");
    this.#passwordInput = this.#utils.getByLabelText("Password:");
    this.#submitButton = this.#utils.getByText("Submit");
  }

  async fillForm({ email, password }: Partial<SignUpData>) {
    if (email) await userEvent.type(this.#emailInput, email);
    if (password) await userEvent.type(this.#passwordInput, password);
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
}
```

To use the COM in tests, create an instance of the COM and use its methods to interact with the component and assert its behavior.

In the below example, we create an instance of the SignUpFormCOM and use its fillForm and submitForm methods to simulate filling out the form and submitting it. We also use the getEmailErrorMessage and getPasswordErrorMessage methods to retrieve any error messages displayed by the form.

```tsx
// sign-up-form.spec.ts
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

  it("ensures that an email and password is provided", async () => {
    await form.fillForm({});
    await form.submit();

    const emailMessage = form.getEmailRequiredMessage();
    const passwordMessage = form.getPasswordRequiredMessage();
    expect(emailMessage).toBeDefined();
    expect(passwordMessage).toBeDefined();
  });

  it("ensures that the password is at least 8", async () => {
    await form.fillForm({ password: "short" });
    await form.submit();

    const errorMessage = form.getPasswordLengthMessage();
    expect(errorMessage).toBeDefined();
  });
});
```

## Conclusion

Extracting the component interactions and queries into a separate "Component Object Model" (COM) class can provide numerous benefits when testing React components. This separation allows for the reuse of interactions across multiple tests, reducing the need for repetitive code. As a result, updating the component becomes a smoother process, since only the COM needs to be updated, instead of each individual test. Also, by abstracting the implementation details of the component into a distinct class, the test code becomes more concise and easy to read, making it easier for developers to comprehend and maintain the test suite. This simplicity makes it easier to identify and fix any potential bugs. This leads to a more streamlined and manageable testing process, ultimately resulting in higher-quality software.

## Bonus

If you don't like to use classes here is an alternative way to create a Component Object Model using a functional approach.

```tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpData, SignUpForm, SignUpProps } from "./sign-up-form";

export const setupSignUpForm = (props: SignUpProps) => {
  const utils = render(<SignUpForm {...props} />);

  const emailInput = utils.getByLabelText("Email:");
  const passwordInput = utils.getByLabelText("Password:");
  const confirmPasswordInput = utils.getByLabelText("Confirm Password:");
  const submitButton = utils.getByText("Submit");

  const fillForm = async ({ email, password, confirmPassword }: Partial<SignUpData>) => {
    if (email) await userEvent.type(emailInput, email);
    if (password) await userEvent.type(passwordInput, password);
    if (confirmPassword) await userEvent.type(confirmPasswordInput, confirmPassword);
  };

  const submit = () => userEvent.click(submitButton);

  const getValidationMessage = (errorMessage: string | RegExp) => utils.getByText(errorMessage);

  const getEmailRequiredMessage = () => getValidationMessage("Email is required");

  const getPasswordLengthMessage = () =>
    getValidationMessage("Password must be at least 8 characters");

  return {
    fillForm,
    submit,
    getEmailRequiredMessage,
    getPasswordLengthMessage,
  };
};
```
