import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>

      <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
        Enter your email address and we'll send you a password reset link.
      </p>

      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-lg border border-border px-4 py-2 bg-background"
        />

        <button
          type="submit"
          className="w-full rounded-lg py-2 text-white font-medium"
          style={{ background: "var(--gradient-primary)" }}
        >
          Send Reset Link
        </button>
      </form>

      <p className="text-center mt-4 text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
