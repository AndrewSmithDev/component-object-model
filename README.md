## Introduction

Testing React components can be a daunting task, particularly when dealing with complex components that have many elements and complex interactions. To make the process more manageable, it's useful to separate the test code from the implementation details of the component. This means extracting the interactions and queries outside of your tests into a reusable module. This separation will make your tests easier to read and understand, while also making them easier to write and maintain.

In this post, we'll take a look at a powerful pattern that will allow us to do just that. I call this pattern the "Component Object Model" (COM) pattern. This pattern is inspired by the Page Object Model (POM) pattern, which is commonly used in end-to-end testing.

The COM pattern is a way to organize your test code by abstracting the implementation details of the component into a separate class. This class, referred to as the COM, contains all of the interactions and queries that you will use to test the component. By separating the component logic from the test logic, the COM pattern makes it easy to reuse the same component interactions across multiple tests. It will also makes it easier to make changes to the component without affecting the test code.

## Example

Here's an example of how the COM pattern might be used to test a simple sign up form:

### The Component

The `SignUpForm` is a basic sign-up form that includes some basic validation. It has an `onSubmit` property, which is a callback function that is invoked when the form is submitted with valid data. The form includes three input fields for email, password, and confirm password. These fields are validated using the `validateForm` function, which checks for empty fields, ensures that the password and confirm password fields match, and that the password is at least 8 characters long. If any errors are present when the form is submitted, they will be displayed and the `onSubmit` callback will not be executed.

```tsx
// sign-up-form.tsx
import { useState } from "react";

export type SignUpData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignUpProps = {
  onSubmit: (data: SignUpData) => void;
};

export const SignUpForm = ({ onSubmit }: SignUpProps) => {
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordMsg, setConfirmPasswordMsg] = useState("");

  const validateForm = () => {
    const errors: Partial<SignUpData> = {};

    if (email === "") errors.email = "Email is required";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (password === "") errors.password = "Password is required";
    if (confirmPassword === "") errors.confirmPassword = "You must confirm your password";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const errors = validateForm();
    setEmailMsg(errors.email ?? "");
    setPasswordMsg(errors.password ?? "");
    setConfirmPasswordMsg(errors.confirmPassword ?? "");

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
      <p>{confirmPasswordMsg}</p>
      <label>
        Confirm Password:
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### The Component Object Model

The `SignUpFormCOM` class encapsulates all of the interactions with the `SignUpForm` component. The test code will use the methods provided by the `SignUpFormCOM` class to fill in the form and submit it, making the test code simple and easy to understand.

The `fillForm` method will take in an object with the values for the email, password, and confirm password fields and will simulate the user filling in the form with those values. Similarly, the `submitForm` method will simulate a user submitting the form. This abstraction makes it easy to test the component and makes the test code easy to read and understand.

This abstraction allows for easy reuse of the same component interactions across multiple tests, making it easy to make changes to the component without affecting the test code, since all interactions are located in one place rather than scattered throughout the test code.

```typescript
// sign-up-form.com.tsx
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
```

### The Tests

The test code tests the functionality of a `SignUpForm` component by testing the interactions that occur when the form is filled and submitted. To do this, it creates a new instance of the `SignUpFormCOM` class before each test, passing in a mock `onSubmit` function. After each test, the cleanup function is called to reset the test environment.

The `SignUpFormCOM` class is used to encapsulate all interactions with the form, making it easy for the test code to use the methods provided by this class to fill in the form and submit it, making the test code simple and easy to understand.

The tests check that:

- When the form is filled with valid data, the `onSubmit` function is called with the form data.
- When the form is filled with invalid data, the `onSubmit` function is not called.
- An error message is displayed when the email field is left empty.
- An error message is displayed when the password field is left empty.
- An error message is displayed when the confirmation password field is left empty.
- An error message is displayed when the password is less than 8 characters.
- An error message is displayed when the passwords do not match.

```tsx
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
```

## Conclusion

In conclusion, the Component Object Model (COM) pattern is a powerful technique that can greatly improve the maintainability and efficiency of your test suite. By extracting the interactions and queries of your React components into a reusable module, the COM pattern makes it easier to read, understand, and write tests. Additionally, it allows for easy reuse of the same component interactions across multiple tests, and also makes it easier to make changes to the component without affecting the test code. I hope this post has provided valuable insights into the benefits of using the COM pattern in your React testing strategy.

## Bonus

If you don't like to use classes here is an alternative way to create a Component Object Model using functional approach.

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

  const getValidationMessage = (errorMessage: string | RegExp) => 
    utils.getByText(errorMessage);

  const getEmailRequiredMessage = () => 
    getValidationMessage("Email is required");

  const getPasswordLengthMessage = () =>
    getValidationMessage("Password must be at least 8 characters");

  const getPasswordRequiredMessage = () => 
    getValidationMessage("Password is required");

  const getConfirmPasswordRequiredMessage = () =>
    getValidationMessage("You must confirm your password");

  const getPasswordsDoNotMatchMessage = () => 
    getValidationMessage("Passwords do not match");

  return {
    fillForm,
    submit,
    getEmailRequiredMessage,
    getPasswordLengthMessage,
    getPasswordRequiredMessage,
    getConfirmPasswordRequiredMessage,
    getPasswordsDoNotMatchMessage,
  };
};
```
