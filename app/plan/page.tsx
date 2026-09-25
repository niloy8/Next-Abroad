"use client";

import React, { useEffect, useState } from "react";
import {
  FiCheckSquare,
  FiPlus,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiTrash2,
  FiBookmark,
  FiExternalLink,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { ApplicationTask, SavedOpportunity, PlanSummary } from "@/types";

export default function PlanPage() {
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);
  const [tasks, setTasks] = useState<ApplicationTask[]>([]);
  const [savedItems, setSavedItems] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Documents");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await api.getPlanSummary();
      setPlanSummary(summary);
      setTasks(summary.tasks || []);
      const saved = await api.getSavedOpportunities();
      setSavedItems(saved || []);
    } catch (err) {
      console.warn("Could not load plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: ApplicationTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await api.updateTask(task.id, { status: newStatus as any });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t))
      );
      // Update plan summary progress
      if (planSummary) {
        const completed = tasks.filter((t) => (t.id === task.id ? newStatus === "completed" : t.status === "completed")).length;
        const total = tasks.length;
        setPlanSummary({
          ...planSummary,
          completed_tasks: completed,
          progress_percentage: Math.round((completed / total) * 100),
        });
      }
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t))
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createTask({
        title: newTitle,
        category: newCategory,
        deadline: newDeadline || undefined,
        description: newDesc || undefined,
      });
      setTasks((prev) => [...prev, created]);
      setShowModal(false);
      setNewTitle("");
      setNewDeadline("");
      setNewDesc("");
    } catch (err) {
      setShowModal(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleRemoveSaved = async (id: number) => {
    try {
      await api.removeSavedOpportunity(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const categories = ["Eligibility", "Documents", "Testing", "Submission", "Visa"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <FiCheckSquare className="w-3.5 h-3.5" />
            <span>Admissions Roadmap & Checklist</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Study Application Plan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track required documents, custom university milestones, and upcoming deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold inline-flex items-center shadow-xs transition"
        >
          <FiPlus className="w-4 h-4 mr-1.5" />
          Add Custom Milestone
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Roadmap Progress</h2>
            <p className="text-xs text-slate-500">
              {tasks.filter((t) => t.status === "completed").length} of {tasks.length} tasks completed
            </p>
          </div>
          <span className="text-2xl font-black text-teal-700">
            {planSummary?.progress_percentage || 0}%
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${planSummary?.progress_percentage || 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Checklist by Category */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((cat) => {
            const catTasks = tasks.filter((t) => t.category.toLowerCase() === cat.toLowerCase());
            if (catTasks.length === 0) return null;

            return (
              <div key={cat} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 pb-2 border-b border-slate-100">
                  {cat} Milestones
                </h3>

                <div className="space-y-2.5">
                  {catTasks.map((t) => {
                    const isDone = t.status === "completed";
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border transition flex items-start justify-between ${
                          isDone
                            ? "bg-slate-50/70 border-slate-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start space-x-3 flex-1 mr-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(t)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                              isDone
                                ? "bg-teal-700 border-teal-700 text-white"
                                : "border-slate-300 hover:border-teal-600"
                            }`}
                          >
                            {isDone && <FiCheckCircle className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                isDone ? "line-through text-slate-400" : "text-slate-800"
                              }`}
                            >
                              {t.title}
                            </p>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {t.description}
                              </p>
                            )}
                            {t.deadline && (
                              <span className="inline-flex items-center text-[11px] text-rose-600 font-medium mt-1">
                                <FiCalendar className="w-3 h-3 mr-1" />
                                Deadline: {t.deadline}
                              </span>
                            )}
                          </div>
                        </div>

                        {t.is_custom && (
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete task"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Saved Opportunities */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 mb-3 flex items-center">
              <FiBookmark className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Saved Study Targets ({savedItems.length})
            </h3>

            {savedItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No saved opportunities yet. Explore the Discovery page to save targets.
              </p>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.country} • Due: {item.deadline || "TBA"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSaved(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 ml-2"
                      title="Remove"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Custom Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule German visa appointment"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Eligibility">Eligibility</option>
                  <option value="Documents">Documents</option>
                  <option value="Testing">Testing</option>
                  <option value="Submission">Submission</option>
                  <option value="Visa">Visa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Bring certified bank guarantee and offer letter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
