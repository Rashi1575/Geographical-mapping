import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  // State to hold what the user types
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  
  // State for loading and errors
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Basic frontend validation for signup
    if (!isLogin && formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const loginData = new URLSearchParams();
        loginData.append("username", formData.email); // FastAPI OAuth2 expects 'username'
        loginData.append("password", formData.password);

        const response = await fetch("http://localhost:8001/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: loginData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to log in");

        // Save token and go to dashboard
        localStorage.setItem("smarthealth_token", data.access_token);
        navigate({ to: "/" });
      } else {
        // --- SIGNUP LOGIC ---
        const response = await fetch("http://localhost:8001/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to sign up");

        // Alert and send to login page
        alert("Account created successfully! Please log in.");
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            required
            type="text"
            placeholder="Full Name"
            className="w-full rounded-lg border border-border px-4 py-2 bg-background"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        )}

        <input
          required
          type="email"
          placeholder="Email Address"
          className="w-full rounded-lg border border-border px-4 py-2 bg-background"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <input
          required
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-border px-4 py-2 bg-background"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {!isLogin && (
          <input
            required
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-lg border border-border px-4 py-2 bg-background"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
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
          disabled={isLoading}
          className="w-full rounded-lg py-2 text-white font-medium disabled:opacity-70 transition-opacity"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isLoading ? "Processing..." : isLogin ? "Log In" : "Create Account"}
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