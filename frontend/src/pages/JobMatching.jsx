
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  BriefcaseBusiness,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";

const actions = [
  {
    key: "analyze-match",
    label: "Analyze Match",
  },
  {
    key: "improve-resume",
    label: "Improve Resume",
  },
  {
    key: "generate-cover-letter",
    label: "Generate Cover Letter",
  },
];

const mainContentKeys = [
  "coverLetter",
  "improvedResume",
  "analysis",
  "matchAnalysis",
  "resumeImprovement",
];

function formatHeading(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseOutput(data) {
  let output = data?.output ?? data;

  // Handle AI responses returned as JSON strings
  if (typeof output === "string") {
    try {
      output = JSON.parse(output);
    } catch {
      return output;
    }
  }

  return output;
}

function formatValue(value, depth = 0) {
  if (value == null) return "";

  if (typeof value === "string") {
    return value.replace(/\\n/g, "\n");
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          return `• ${formatValue(item)}`;
        }

        return `• ${formatValue(item, depth + 1)}`;
      })
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(
        ([key, val]) =>
          key !== "source" &&
          val !== null &&
          val !== undefined
      )
      .map(([key, val]) => {
        const heading = formatHeading(key);
        const formatted = formatValue(val, depth + 1);

        if (!formatted) return "";

        return `${heading}\n${formatted}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return String(value);
}

function formatResult(data) {
  const output = parseOutput(data);

  if (!output) return "No result returned.";

  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    return formatValue(output);
  }

  if (typeof output === "object") {
    const mainKey = mainContentKeys.find(
      (key) => output[key] != null
    );

    if (mainKey) {
      const mainText = formatValue(output[mainKey]);

      const remaining = Object.fromEntries(
        Object.entries(output).filter(
            ([key]) =>
            key !== mainKey &&
            key !== "source" &&
            !(mainKey === "coverLetter" && key === "summary")
        )
        );

      const extraText = formatValue(remaining);

      return [mainText, extraText]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  return formatValue(output);
}

export default function JobMatching() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingJob, setSavingJob] = useState(false);
  const [runningAction, setRunningAction] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumeResponse, jobResponse] =
          await Promise.all([
            api.get("/resumes"),
            api.get("/jobs"),
          ]);

        const savedResumes =
          resumeResponse.data.data || [];

        const savedJobs =
          jobResponse.data.data || [];

        setResumes(savedResumes);
        setJobs(savedJobs);

        if (savedResumes.length > 0) {
          setResumeId(savedResumes[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load resumes and jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveJob = async (e) => {
    e.preventDefault();

    if (savingJob) return;

    setError("");
    setMessage("");
    setResult(null);
    setCopied(false);
    setSavingJob(true);

    try {
      const response = await api.post("/jobs", {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        link: link.trim(),
      });

      const savedJob = response.data.data;

      setJobs((prev) => [savedJob, ...prev]);
      setJobId(savedJob._id);

      setTitle("");
      setCompany("");
      setDescription("");
      setLink("");

      setMessage(
        "Job saved successfully. You can now run AI analysis."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save job."
      );
    } finally {
      setSavingJob(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!resumeId || !jobId || runningAction) return;

    setError("");
    setMessage("");
    setResult(null);
    setCopied(false);
    setRunningAction(action);

    try {
      const response = await api.post(
        `/ai/${action}`,
        {
          resumeId,
          jobId,
        }
      );

      setResult({
        action,
        data: response.data.data,
      });

      setMessage(
        response.data.message ||
          "AI request completed successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI request failed. Check your backend and API key."
      );
    } finally {
      setRunningAction("");
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        formatResult(result.data)
      );

      setCopied(true);
    } catch {
      setError("Unable to copy the result.");
    }
  };

  const selectedActionLabel = result
    ? actions.find(
        (action) => action.key === result.action
      )?.label
    : "";

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <Sparkles
            className="text-blue-600"
            size={30}
          />

          <h1 className="text-3xl font-bold text-slate-900">
            AI Job Matching
          </h1>
        </div>

        <p className="text-slate-500 mb-8">
          Compare your resume with job descriptions
          and generate AI-powered recommendations.
        </p>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 text-red-700 p-4 rounded-lg mb-5"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="bg-green-50 text-green-700 p-4 rounded-lg mb-5"
          >
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">
            Loading resumes and jobs...
          </p>
        ) : (
          <>
            {/* Step 1: Resume Selection */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-600" />

                <h2 className="text-xl font-semibold">
                  1. Select Resume
                </h2>
              </div>

              {resumes.length === 0 ? (
                <p className="text-slate-600">
                  No resumes found.{" "}
                  <Link
                    to="/resumes"
                    className="text-blue-600 underline"
                  >
                    Upload a resume first.
                  </Link>
                </p>
              ) : (
                <select
                  value={resumeId}
                  onChange={(e) => {
                    setResumeId(e.target.value);
                    setResult(null);
                    setCopied(false);
                  }}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  {resumes.map((resume) => (
                    <option
                      key={resume._id}
                      value={resume._id}
                    >
                      {resume.title}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {/* Step 2: Create Job */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BriefcaseBusiness className="text-blue-600" />

                <h2 className="text-xl font-semibold">
                  2. Add Job Description
                </h2>
              </div>

              <form
                onSubmit={handleSaveJob}
                className="space-y-4"
              >
                <input
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Job title"
                  className="w-full border border-slate-300 rounded-lg p-3"
                />

                <input
                  required
                  value={company}
                  onChange={(e) =>
                    setCompany(e.target.value)
                  }
                  placeholder="Company"
                  className="w-full border border-slate-300 rounded-lg p-3"
                />

                <input
                  value={link}
                  onChange={(e) =>
                    setLink(e.target.value)
                  }
                  placeholder="Job posting URL (optional)"
                  className="w-full border border-slate-300 rounded-lg p-3"
                />

                <textarea
                  required
                  rows={7}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Paste the full job description here..."
                  className="w-full border border-slate-300 rounded-lg p-3"
                />

                <button
                  type="submit"
                  disabled={savingJob}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {savingJob
                    ? "Saving..."
                    : "Save Job"}
                </button>
              </form>
            </section>

            {/* Step 3: Job Selection */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                3. Select Saved Job
              </h2>

              {jobs.length === 0 ? (
                <p className="text-slate-500">
                  Save a job above to continue.
                </p>
              ) : (
                <select
                  value={jobId}
                  onChange={(e) => {
                    setJobId(e.target.value);
                    setResult(null);
                    setCopied(false);
                  }}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="">
                    Select a job
                  </option>

                  {jobs.map((job) => (
                    <option
                      key={job._id}
                      value={job._id}
                    >
                      {job.title} — {job.company}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {/* Step 4: AI Actions */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-blue-600" />

                <h2 className="text-xl font-semibold">
                  4. Run AI Analysis
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    disabled={
                      !resumeId ||
                      !jobId ||
                      Boolean(runningAction)
                    }
                    onClick={() =>
                      handleAIAction(action.key)
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    {runningAction === action.key
                      ? "Processing..."
                      : action.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-slate-500 mt-4">
                AI requests may take several seconds.
                Successful results are saved to your
                analysis history.
              </p>

              <Link
                to="/ai-history"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                View AI History
              </Link>
            </section>

            {/* Step 5: AI Result */}
            {result && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h2 className="text-xl font-semibold text-slate-900">
                    AI Result: {selectedActionLabel}
                  </h2>

                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50"
                  >
                    {copied ? (
                      <>
                        <Check
                          size={17}
                          className="text-green-600"
                        />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copy Result
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                    {formatResult(result.data)}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
