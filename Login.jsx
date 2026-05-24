import { useState } from "react";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase";

import { useNavigate } from "react-router-dom";

export default function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const navigate = useNavigate();

  // PASSWORD VALIDATION

  const validatePassword = (password) => {

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

    return strongPassword.test(password);
  };

  // RESET PASSWORD

  const handleResetPassword = async () => {

    setError("");

    setMessage("");

    if (!email) {

      setError("Enter your email first");

      return;
    }

    try {

      await sendPasswordResetEmail(auth, email);

      setMessage("Password reset email sent");

    } catch (err) {

      setError("Unable to send reset email");
    }
  };

  // LOGIN / SIGNUP

  const handleAuth = async (e) => {

    e.preventDefault();

    setError("");

    setMessage("");

    try {

      // SIGNUP

      if (isSignup) {

        if (!validatePassword(password)) {

          setError(
            "Password must contain uppercase, lowercase, special character and minimum 6 characters"
          );

          return;
        }

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Account Created Successfully");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

      }

      // LOGIN

      else {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Login Successful");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }

    } catch (err) {

      if (err.code === "auth/user-not-found") {

        setError("No account exists");

      }

      else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {

        setError("Wrong email or password");

      }

      else if (
        err.code === "auth/email-already-in-use"
      ) {

        setError("Email already exists");

      }

      else if (
        err.code === "auth/weak-password"
      ) {

        setError(
          "Password should be stronger"
        );

      }

      else {

        setError(err.message);
      }
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">

      <div className="bg-[#1e293b] p-8 rounded-2xl w-[340px] shadow-xl border border-cyan-500/20">

        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-5">

          {isSignup ? "Create Account" : "Welcome Back"}

        </h1>

        <form
          onSubmit={handleAuth}
          className="space-y-4"
        >

          {/* EMAIL */}

          <div>

            <label className="block text-white text-lg mb-2 font-semibold">

              Email Address

            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="off"
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-3 rounded-xl bg-slate-900 text-white border border-cyan-400 outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block text-white text-lg mb-2 font-semibold">

              Password

            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              autoComplete="new-password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-3 rounded-xl bg-slate-900 text-white border border-cyan-400 outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />

          </div>

          {/* ERROR */}

          {error && (

            <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-center text-sm">

              {error}

            </div>
          )}

          {/* SUCCESS */}

          {message && (

            <div className="bg-green-500/20 text-green-300 p-3 rounded-xl text-center text-sm">

              {message}

            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 p-3 rounded-xl font-bold text-lg text-black shadow-lg"
          >

            {isSignup ? "Sign Up" : "Login"}

          </button>

          {/* RESET PASSWORD */}

          {!isSignup && (

            <button
              type="button"
              onClick={handleResetPassword}
              className="text-cyan-300 hover:text-cyan-200 w-full text-sm mt-2"
            >

              Forgot Password?

            </button>

          )}

        </form>

        {/* SWITCH LOGIN/SIGNUP */}

        <button
          onClick={() =>
            setIsSignup(!isSignup)
          }
          className="text-cyan-300 hover:text-cyan-200 mt-5 w-full text-center text-sm"
        >

          {isSignup
            ? "Already have an account? Login"
            : "Create new account"}

        </button>

      </div>

    </div>
  );
}
