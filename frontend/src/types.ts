/** Shared shape for the Login / Register form fields. */
export interface AuthFormData {
  email: string;
  password: string;
}

/** Handler signature passed to Login/Register via the onSubmit prop. */
export type AuthSubmitHandler = (data: AuthFormData) => void;