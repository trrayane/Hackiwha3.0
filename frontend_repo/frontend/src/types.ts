/** Shared shape for the Login / Register form fields. */
export interface AuthFormData {
  email: string;
  password: string;
}

/** Handler signature passed to Login/Register via the onSubmit prop. */
export type AuthSubmitHandler = (data: AuthFormData) => void;export type JingleStatus = "Approved" | "In Review" | "Draft";

export interface Jingle {
  id: string;
  name: string;
  platform: string;
  feedback: number;
  status: JingleStatus;
  duration: string;
}

export interface PlatformUsage {
  name: string;
  /** 0-100 */
  percent: number;
  color: string;
}