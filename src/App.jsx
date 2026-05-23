import React from "react";

import {
  Upload,
  Receipt,
  IndianRupee,
  Calendar,
  Sparkles,
  LogOut,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { signOut } from "firebase/auth";

import { auth } from "./firebase";

import { useNavigate } from "react-router-dom";

const data = [
  { name: "Food", value: 35 },
  { name: "Travel", value: 20 },
  { name: "Shopping", value: 25 },
  { name: "Bills", value: 20 },
];

const COLORS = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b"];

export default function App() {

  const navigate = useNavigate();

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");

  };

  return (

    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

        <div>

          <h1 className="text-4xl font-bold text-cyan-400">
            AI Invoice Analyzer
          </h1>

          <p className="text-slate-400 mt-2">
            Upload invoices • AI extraction • Expense insights
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-2xl font-semibold shadow-lg flex items-center gap-2"
        >

          <LogOut className="w-5 h-5" />

          Logout

        </button>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SECTION */}

        <div className="lg:col-span-2 space-y-6">

          {/* UPLOAD */}

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">

            <h2 className="text-2xl font-bold mb-5">
              Upload Invoice
            </h2>

            <label className="border-2 border-dashed border-cyan-500 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/10 transition">

              <Upload className="w-16 h-16 text-cyan-400 mb-4" />

              <p className="text-xl font-semibold">
                Drag & Drop Invoice
              </p>

              <p className="text-slate-400 mt-2">
                PDF • JPG • PNG
              </p>

              <input type="file" className="hidden" />

            </label>

          </div>

          {/* EXTRACTED DATA */}

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Extracted Data
              </h2>

              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
                AI Processed
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-slate-800 rounded-2xl p-5">

                <div className="flex items-center gap-2 text-slate-400">

                  <Receipt className="w-4 h-4" />

                  Merchant

                </div>

                <h3 className="text-2xl font-bold mt-3">
                  Starbucks
                </h3>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5">

                <div className="flex items-center gap-2 text-slate-400">

                  <Calendar className="w-4 h-4" />

                  Date

                </div>

                <h3 className="text-2xl font-bold mt-3">
                  23 May 2026
                </h3>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5">

                <div className="flex items-center gap-2 text-slate-400">

                  <IndianRupee className="w-4 h-4" />

                  Amount

                </div>

                <h3 className="text-2xl font-bold text-cyan-400 mt-3">
                  ₹1,240
                </h3>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5">

                <div className="flex items-center gap-2 text-slate-400">

                  <Sparkles className="w-4 h-4" />

                  Category

                </div>

                <h3 className="text-2xl font-bold text-yellow-400 mt-3">
                  Food & Beverage
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">

          {/* AI INSIGHT */}

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">

            <h2 className="text-2xl font-bold mb-5">
              AI Recommendation
            </h2>

            <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-5">

              <p className="leading-8 text-slate-300">

                You spent

                <span className="text-cyan-400 font-bold">
                  {" "}35% more{" "}
                </span>

                on food this month.

              </p>

            </div>

          </div>

          {/* CHART */}

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">

            <h2 className="text-2xl font-bold mb-5">
              Expense Summary
            </h2>

            <div className="h-72">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >

                    {data.map((entry, index) => (

                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
