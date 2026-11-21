
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  History,
  FileText,
  BriefcaseBusiness,
  Copy,
} from "lucide-react";
import api from "../services/api";

const typeLabels = {
  "match-analysis": "Match Analysis",
  "resume-improvement": "Resume Improvement",
  "cover-letter": "Cover Letter",
};


function formatOutput(data) {
  if (data == null) return "No output available.";

  let output = data;

  if (typeof output === "string") {
    try {
      output = JSON.parse(output);
    } catch {
      return output;
    }
  }

  const formatValue = (value) => {
    if (value == null) return "";

    if (typeof value === "string") {
      return value.replace(/\\n/g, "\n");
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => `• ${formatValue(item)}`)
        .join("\n");
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .filter(([key]) => key !== "source")
        .map(([key, val]) => {
          const heading = key
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            );

          return `${heading}\n${formatValue(val)}`;
        })
        .join("\n\n");
    }

    return String(value);
  };

  const mainKeys = [
    "coverLetter",
    "improvedResume",
    "analysis",
    "matchAnalysis",
    "resumeImprovement",
  ];

  if (output && typeof output === "object" && !Array.isArray(output)) {
    const mainKey = mainKeys.find(
      (key) => output[key] != null
    );

    if (mainKey) {
      const remaining = Object.fromEntries(
        Object.entries(output).filter(
            ([key]) =>
            key !== mainKey &&
            key !== "source" &&
            !(mainKey === "coverLetter" && key === "summary")
        )
        );

      return [
        formatValue(output[mainKey]),
        formatValue(remaining),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  return formatValue(output);
}


export default function AIHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/ai/history");
        setHistory(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load AI history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCopy = async (output) => {
    try {
      await navigator.clipboard.writeText(
        formatOutput(output)
      );
      setCopyMessage("Copied to clipboard!");
    } catch {
      setCopyMessage("Unable to copy the result.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <History size={30} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            AI History
          </h1>
        </div>

        <p className="text-slate-500 mb-8">
          Review your previous AI analyses, resume
          improvements, and cover letters.
        </p>

        {loading && (
          <p className="text-slate-500">
            Loading history...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="bg-red-50 text-red-700 p-4 rounded-lg"
          >
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <History
              size={40}
              className="text-slate-400 mx-auto mb-4"
            />
            <p className="text-slate-600">
              No AI history yet.
            </p>
            <Link
              to="/job-matching"
              className="text-blue-600 hover:underline mt-3 inline-block"
            >
              Start AI Job Matching
            </Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => {
              const isOpen = selectedId === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {typeLabels[item.type] ||
                          item.type ||
                          "AI Analysis"}
                      </h2>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                        <FileText size={16} />
                        <span>
                          {item.resume?.title ||
                            "Deleted resume"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                        <BriefcaseBusiness size={16} />
                        <span>
                          {item.job
                            ? `${item.job.title} — ${item.job.company}`
                            : "Deleted job"}
                        </span>
                      </div>

                      {item.createdAt && (
                        <p className="text-xs text-slate-400 mt-3">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(
                          isOpen ? null : item._id
                        );
                        setCopyMessage("");
                      }}
                      className="self-start bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      {isOpen ? "Hide Result" : "View Result"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-5 border-t border-slate-200 pt-5">
                      <pre className="whitespace-pre-wrap break-words text-sm text-slate-700 bg-slate-50 p-5 rounded-lg overflow-x-auto">
                        {formatOutput(item.output)}
                      </pre>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(item.output)
                        }
                        className="inline-flex items-center gap-2 mt-4 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50"
                      >
                        <Copy size={16} />
                        Copy Result
                      </button>

                      {copyMessage && (
                        <p role="status" className="text-sm text-slate-500 mt-2">
                          {copyMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
