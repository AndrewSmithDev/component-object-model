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
