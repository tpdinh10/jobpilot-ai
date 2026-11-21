
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Plus,
  Upload,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch saved resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes");
        setResumes(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load resumes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  // Create resume from text
  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setFormError("");
    setSuccess("");

    try {
      const response = await api.post("/resumes", {
        title: title.trim(),
        content: content.trim(),
      });

      if (response.data.success) {
        setResumes((prev) => [
          response.data.data,
          ...prev,
        ]);
        setTitle("");
        setContent("");
        setSuccess("Resume saved successfully!");
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to save resume."
      );
    } finally {
      setSaving(false);
    }
  };

  // Upload PDF resume
  const handleUploadPDF = async (e) => {
    e.preventDefault();

    if (!selectedFile || uploading) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("PDF must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post(
        "/resumes/upload",
        formData,
        {
            headers: {
            "Content-Type": undefined,
            },
        }
        );

      if (response.data.success) {
        setResumes((prev) => [
          response.data.data,
          ...prev,
        ]);

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setSuccess("PDF uploaded successfully!");
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          "Unable to upload PDF."
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async (resume) => {
    const confirmed = window.confirm(
      `Delete "${resume.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(resume._id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/resumes/${resume._id}`);

      setResumes((prev) =>
        prev.filter((item) => item._id !== resume._id)
      );

      if (selectedResume?._id === resume._id) {
        setSelectedResume(null);
      }

      setSuccess("Resume deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete resume."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">
          Resume Management
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          Upload PDFs or create resumes from text.
        </p>

        {success && (
          <div
            role="status"
            className="bg-green-50 text-green-700 p-4 rounded-lg mb-6"
          >
            {success}
          </div>
        )}

        {/* PDF Upload */}
        <form
          onSubmit={handleUploadPDF}
          className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Upload className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">
              Upload PDF Resume
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Select a text-based PDF resume (maximum 5 MB).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] || null);
              setUploadError("");
            }}
            className="block w-full text-sm text-slate-600"
          />

          {uploadError && (
            <p role="alert" className="text-red-600 text-sm">
              {uploadError}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </form>

        {/* Text Resume Form */}
        <form
          onSubmit={handleCreateResume}
          className="bg-white rounded-xl p-6 shadow-sm mb-8 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Plus className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">
              Create Resume from Text
            </h2>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resume title"
            className="w-full border border-slate-300 rounded-lg p-3"
          />

          <textarea
            required
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste resume content here..."
            className="w-full border border-slate-300 rounded-lg p-3"
          />

          {formError && (
            <p role="alert" className="text-red-600 text-sm">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {saving ? "Saving..." : "Save Resume"}
          </button>
        </form>

        {/* Saved Resumes */}
        <h2 className="text-2xl font-bold text-slate-900 mb-5">
          Saved Resumes ({resumes.length})
        </h2>

        {loading && (
          <p className="text-slate-500">
            Loading resumes...
          </p>
        )}

        {error && (
          <p role="alert" className="text-red-600 mb-4">
            {error}
          </p>
        )}

        {!loading && !error && resumes.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <FileText
              size={40}
              className="text-slate-400 mx-auto mb-4"
            />
            <p className="text-slate-600">
              No resumes saved yet.
            </p>
          </div>
        )}

        {!loading && resumes.length > 0 && (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <FileText
                    className="text-blue-600 shrink-0"
                    size={24}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {resume.title}
                    </h3>

                    <p className="text-slate-500 text-sm mt-2 whitespace-pre-wrap break-words">
                      {resume.content?.length > 150
                        ? `${resume.content.slice(0, 150)}...`
                        : resume.content}
                    </p>

                    {resume.createdAt && (
                      <p className="text-xs text-slate-400 mt-3">
                        Created:{" "}
                        {new Date(
                          resume.createdAt
                        ).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-4 mt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedResume(resume)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Eye size={17} />
                        View
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === resume._id}
                        onClick={() => handleDeleteResume(resume)}
                        className="flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                        {deletingId === resume._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resume Preview Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-preview-title"
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start gap-4 mb-5">
                <h2
                  id="resume-preview-title"
                  className="text-xl font-bold"
                >
                  {selectedResume.title}
                </h2>

                <button
                  type="button"
                  aria-label="Close preview"
                  onClick={() => setSelectedResume(null)}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="whitespace-pre-wrap break-words text-slate-700">
                {selectedResume.content}
              </div>

              <button
                type="button"
                onClick={() => setSelectedResume(null)}
                className="mt-6 bg-slate-800 text-white px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
