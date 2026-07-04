import { Link } from "@tanstack/react-router";
import * as authService from "@/services/authService";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      console.log("Login");
      // Later:
      // authService.login(...)
    } else {
      console.log("Signup");
      // Later:
      // authService.signup(...)
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>

      <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
        {isLogin
          ? "Log in to access your SmartHealth account."
          : "Create an account to save preferences and emergency history."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-lg border border-border px-4 py-2 bg-background"
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-lg border border-border px-4 py-2 bg-background"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-border px-4 py-2 bg-background"
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-lg border border-border px-4 py-2 bg-background"
          />
        )}

        {isLogin && (
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg py-2 text-white font-medium"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isLogin ? "Log In" : "Create Account"}
        </button>
      </form>

      <Link to="/" className="block text-center mt-4 text-sm text-muted-foreground hover:underline">
        Continue as Guest
      </Link>

      <p className="text-center text-sm mt-6">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log In
            </Link>
          </>
        )}
      </p>
    </>
  );
}
