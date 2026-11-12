"use client";

import * as React from "react";
import { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typewriter } from "./typewriter-text";

export { Typewriter, type TypewriterProps } from "./typewriter-text";

const labelVariants = cva(
  "text-sm font-medium leading-none text-[#1E1F33] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-[#FBF7EE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86601F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#1E1F33] text-[#FCF6E3] hover:bg-[#303143]",
        destructive:
          "bg-[#B64536] text-white hover:opacity-90",
        outline:
          "border border-[#978E77]/60 bg-[#FFFFFF] text-[#1E1F33] hover:bg-[#F4EEDF]",
        secondary:
          "bg-[#F4EEDF] text-[#1E1F33] hover:opacity-90",
        ghost: "hover:bg-[#F4EEDF] hover:text-[#1E1F33]",
        link: "text-[#1E1F33] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[8px] px-3",
        lg: "h-12 rounded-[10px] px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-[#978E77]/60 bg-[#FFFFFF] px-3 py-2 text-sm text-[#1E1F33] shadow-sm shadow-black/5 transition-colors placeholder:text-[#656482]/70 focus-visible:border-[#86601F] focus-visible:ring-2 focus-visible:ring-[#86601F]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, label, ...props }, ref) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="grid w-full items-center gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-[#656482]/80 transition-colors hover:text-[#1E1F33] focus-visible:text-[#1E1F33] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

interface SignInFormProps {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  submitLabel: string;
  loadingLabel: string;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onSignIn?: (credentials: { email: string; password: string }) => Promise<void> | void;
}

function SignInForm({
  title,
  subtitle,
  emailPlaceholder,
  submitLabel,
  loadingLabel,
  isLoading,
  error,
  onClearError,
  onSignIn,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSignIn) {
      await onSignIn({ email, password });
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#1E1F33]">
          {title}
        </h1>
        <p className="text-balance text-sm text-[#656482]">{subtitle}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-[#B64536] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={emailPlaceholder}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onClearError?.();
            }}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            onClearError?.();
          }}
        />
        <Button type="submit" className="mt-2 h-10" disabled={isLoading}>
          {isLoading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#1E1F33]">
          Create an account
        </h1>
        <p className="text-balance text-sm text-[#656482]">
          Enter your details below to sign up
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Full name"
            required
            autoComplete="name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="name@startup.in"
            required
            autoComplete="email"
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
        />
        <Button type="submit" variant="outline" className="mt-2 h-10">
          Sign Up
        </Button>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
    fit?: "cover" | "contain";
    bgClassName?: string;
  };
  emblem?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

export interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  title?: string;
  subtitle?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onSignIn?: (credentials: { email: string; password: string }) => Promise<void> | void;
  onGoogleClick?: () => void;
  showSignUpToggle?: boolean;
  signUpPrompt?: string;
  signUpLinkLabel?: string;
  signUpHref?: string;
  topBarSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}

const defaultSignInContent: Required<Omit<AuthContentProps, "emblem">> = {
  image: {
    src: "/login-assets/oasis-temple-waves.jpg",
    alt: "OASIS Odisha twilight temple skyline with golden waves",
  },
  quote: {
    text: "Welcome back. The journey continues.",
    author: "OASIS Odisha",
  },
};

const defaultSignUpContent: Required<Omit<AuthContentProps, "emblem">> = {
  image: {
    src: "/login-assets/oasis-temple-waves.jpg",
    alt: "OASIS Odisha twilight temple skyline with golden waves",
  },
  quote: {
    text: "Create an account. A new chapter awaits.",
    author: "OASIS Odisha",
  },
};

export function AuthUI({
  signInContent = {},
  signUpContent = {},
  title = "Sign in to your account",
  subtitle = "Enter your email below to sign in",
  emailPlaceholder = "name@startup.in",
  submitLabel = "Sign In",
  loadingLabel = "Signing in...",
  isLoading = false,
  error = null,
  onClearError,
  onSignIn,
  onGoogleClick,
  showSignUpToggle = true,
  signUpPrompt = "Don't have an account?",
  signUpLinkLabel = "Sign up",
  signUpHref = "/join",
  topBarSlot,
  bottomSlot,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    emblem: signInContent.emblem,
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    emblem: signUpContent.emblem,
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div
      style={{ colorScheme: "light" }}
      className="auth-split-light w-full min-h-screen bg-[#FBF7EE] text-[#1E1F33] md:grid md:grid-cols-2"
    >
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Left Column: Auth Form */}
      <div className="flex min-h-screen flex-col justify-between bg-[#FBF7EE] text-[#1E1F33] p-6 sm:p-10 md:min-h-0">
        <div>{topBarSlot}</div>

        <div className="mx-auto grid w-full max-w-[360px] gap-4 py-8">
          {currentContent.emblem && (
            <div className="flex md:hidden justify-center pb-1">
              <div className="relative h-24 w-24">
                <Image
                  src={currentContent.emblem.src}
                  alt={currentContent.emblem.alt}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {isSignIn ? (
            <SignInForm
              title={title}
              subtitle={subtitle}
              emailPlaceholder={emailPlaceholder}
              submitLabel={submitLabel}
              loadingLabel={loadingLabel}
              isLoading={isLoading}
              error={error}
              onClearError={onClearError}
              onSignIn={onSignIn}
            />
          ) : (
            <SignUpForm />
          )}

          <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#D9CDAE]">
            <span className="relative z-10 bg-[#FBF7EE] px-2 text-[#656482] uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            className="h-10"
            onClick={() => onGoogleClick?.()}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="text-center text-sm text-[#656482]">
            {isSignIn ? signUpPrompt : "Already have an account?"}{" "}
            {showSignUpToggle ? (
              <Button
                variant="link"
                type="button"
                className="pl-1 text-[#1E1F33]"
                onClick={toggleForm}
              >
                {isSignIn ? signUpLinkLabel : "Sign in"}
              </Button>
            ) : (
              <Link
                href={signUpHref}
                className="font-medium text-[#1E1F33] underline-offset-4 hover:underline"
              >
                {signUpLinkLabel}
              </Link>
            )}
          </div>
        </div>

        <div>{bottomSlot}</div>
      </div>

      {/* Right Column: Visual Showcase + Typewriter Quote */}
      <div
        className={cn(
          "hidden md:block relative overflow-hidden",
          currentContent.image.bgClassName || "bg-black"
        )}
        key={currentContent.image.src}
      >
        <Image
          src={currentContent.image.src}
          alt={currentContent.image.alt}
          fill
          priority
          unoptimized
          sizes="50vw"
          className={
            currentContent.image.fit === "contain"
              ? "object-contain object-center"
              : "object-cover object-center"
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-between p-10">
          <div className="flex-1 flex items-center justify-center">
            {currentContent.emblem && (
              <div className="relative h-56 w-56 lg:h-64 lg:w-64 drop-shadow-[0_14px_38px_rgba(243,211,136,0.22)]">
                <Image
                  src={currentContent.emblem.src}
                  alt={currentContent.emblem.alt}
                  fill
                  priority
                  sizes="256px"
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <blockquote className="max-w-md space-y-2 text-center text-[#F8F6F0]">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={50}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-light text-white/75 not-italic">
              &mdash; {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

