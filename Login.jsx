import { useState } from "react";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

export default function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async (e) => {

    e.preventDefault();

    setError("");

    setMessage("");

    try {

      if (isSignup) {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Account Created Successfully");

      } else {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Login Successful");
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

        setError("Password should be at least 6 characters");

      }

      else {

        setError(err.message);
      }
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-900">

      <div className="bg-slate-800 p-8 rounded-2xl w-96 shadow-2xl">

        <h1 className="text-3xl font-bold text-white text-center mb-6">

          {isSignup ? "Sign Up" : "Login"}

        </h1>

        <form
          onSubmit={handleAuth}
          className="space-y-4"
        >

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 rounded-lg outline-none"
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 rounded-lg outline-none"
            required
          />

          {error && (

            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg">

              {error}

            </div>
          )}

          {message && (

            <div className="bg-green-500/20 text-green-400 p-3 rounded-lg">

              {message}

            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition p-3 rounded-lg font-bold text-white"
          >

            {isSignup ? "Sign Up" : "Login"}

          </button>

        </form>

        <button
          onClick={() =>
            setIsSignup(!isSignup)
          }
          className="text-cyan-400 mt-5 w-full"
        >

          {isSignup
            ? "Already have an account? Login"
            : "Create new account"}

        </button>

      </div>

    </div>
  );
}