
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  History,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

const dashboardCards = [
  {
    title: "Resume Management",
    description:
      "Upload PDF resumes, create resumes from text, and manage your saved resumes.",
    path: "/resumes",
    icon: FileText,
    iconColor: "text-blue-600",
    iconBackground: "bg-blue-50",
  },
  {
    title: "AI Job Matching",
    description:
      "Analyze job matches, improve resumes, and generate tailored cover letters.",
    path: "/job-matching",
    icon: Sparkles,
    iconColor: "text-purple-600",
    iconBackground: "bg-purple-50",
  },
  {
    title: "AI History",
    description:
      "Review previous match analyses, resume improvements, and cover letters.",
    path: "/ai-history",
    icon: History,
    iconColor: "text-green-600",
    iconBackground: "bg-green-50",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.data);
          setAuthError("");
        }
      } catch (error) {
        if (active) {
          setAuthError(
            error.response?.data?.message ||
              "Unable to verify your session."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <BriefcaseBusiness
              className="text-blue-600"
              size={30}
            />

            <h1 className="text-2xl font-bold text-slate-900">
              JobPilot AI
            </h1>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {loading
              ? "Loading Dashboard..."
              : user?.name
                ? `Welcome, ${user.name}!`
                : "Dashboard"}
          </h2>

          <p className="text-slate-500 mt-2">
            Your AI-powered job application assistant
          </p>

          {authError && (
            <p
              role="alert"
              className="text-red-600 mt-3"
            >
              {authError}
            </p>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.path}
                to={card.path}
                className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${card.iconBackground}`}
                >
                  <Icon
                    size={30}
                    className={card.iconColor}
                  />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>

                <p className="text-slate-500 text-sm mt-2 leading-6 flex-1">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mt-6 group-hover:gap-3 transition-all">
                  Open Feature
                  <ArrowRight size={17} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Start */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Quick Start
          </h3>

          <p className="text-slate-600 text-sm leading-7">
            1. Upload or create a resume.
            <br />
            2. Add a job description in AI Job Matching.
            <br />
            3. Analyze the match, improve your resume,
            or generate a cover letter.
            <br />
            4. Review saved results in AI History.
          </p>
        </section>
      </main>
    </div>
  );
}
