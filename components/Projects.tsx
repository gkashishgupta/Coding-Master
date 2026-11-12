
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  repository_url: string | null;
  live_demo_url: string | null;
  tech_stack: string[];
  is_public: boolean;
  created_at: string;
};

type Props = {
  user: User | null;
  colors: {
    background: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
    hover: string;
  };
  accent: string;
  requireLogin: () => boolean;
};

const emptyForm = {
  name: "",
  description: "",
  repository_url: "",
  live_demo_url: "",
  tech_stack: "",
  status: "Planning",
  is_public: true,
};

export default function Projects({
  user,
  colors,
  accent,
  requireLogin,
}: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects((data ?? []) as Project[]);
      setError("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const term = search.toLowerCase();

      const matchesSearch =
        project.name.toLowerCase().includes(term) ||
        (project.description ?? "").toLowerCase().includes(term) ||
        project.tech_stack?.some((tech) =>
          tech.toLowerCase().includes(term)
        );

      const matchesFilter =
        filter === "All" || project.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  function openAdd() {
    if (!requireLogin()) return;

    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    if (!requireLogin()) return;

    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description ?? "",
      repository_url: project.repository_url ?? "",
      live_demo_url: project.live_demo_url ?? "",
      tech_stack: (project.tech_stack ?? []).join(", "),
      status: project.status,
      is_public: project.is_public,
    });

    setModalOpen(true);
  }

  async function saveProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      requireLogin();
      return;
    }

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const projectData = {
      name: form.name.trim(),
      description: form.description.trim(),
      repository_url: form.repository_url.trim() || null,
      live_demo_url: form.live_demo_url.trim() || null,
      tech_stack: form.tech_stack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      status: form.status,
      is_public: form.is_public,
    };

    const result = editingId
      ? await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingId)
          .eq("user_id", user.id)
      : await supabase
          .from("projects")
          .insert({ ...projectData, user_id: user.id });

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    await loadProjects();
    setSaving(false);
  }

  async function deleteProject(id: string) {
    if (!user) {
      requireLogin();
      return;
    }

    if (!window.confirm("Delete this project permanently?")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadProjects();
  }

  const inputStyle = {
    background: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-2 text-sm" style={{ color: colors.muted }}>
            Explore and manage development projects.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-md px-4 py-2.5 text-xs font-medium text-white"
          style={{ background: accent }}
        >
          + New project
        </button>
      </div>

      <div
        className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border p-3"
        style={{ borderColor: colors.border, background: colors.surface }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a repository..."
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-xs outline-none"
          style={inputStyle}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-xs outline-none"
          style={inputStyle}
        >
          <option>All</option>
          <option>Planning</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <button
          onClick={loadProjects}
          className="rounded-md border px-3 py-2 text-xs"
          style={{ borderColor: colors.border }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-500/40 p-3 text-xs text-red-500">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm" style={{ color: colors.muted }}>
          Loading projects...
        </p>
      ) : visibleProjects.length === 0 ? (
        <div
          className="rounded-lg border border-dashed py-16 text-center"
          style={{ borderColor: colors.border }}
        >
          <p className="text-sm font-medium">No projects found</p>
          <p className="mt-2 text-xs" style={{ color: colors.muted }}>
            {search
              ? "Try another search."
              : "Be the first to add a project."}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: colors.border }}
        >
          {visibleProjects.map((project, index) => {
            const isOwner = user?.id === project.user_id;

            return (
              <div
                key={project.id}
                className="border-b p-5 last:border-b-0"
                style={{ borderColor: colors.border }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span style={{ color: accent }}>▤</span>
                      <h2 className="text-sm font-semibold">
                        {project.name}
                      </h2>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px]"
                        style={{
                          borderColor: colors.border,
                          color: colors.muted,
                        }}
                      >
                        {project.is_public ? "Public" : "Private"}
                      </span>
                    </div>

                    <p
                      className="mt-2 text-xs leading-5"
                      style={{ color: colors.muted }}
                    >
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <span
                    className="rounded-full px-2.5 py-1 text-[10px]"
                    style={{
                      background: `${accent}18`,
                      color: accent,
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {!!project.tech_stack?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md px-2 py-1 text-[10px]"
                        style={{
                          background: colors.hover,
                          color: colors.muted,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      style={{ color: accent }}
                    >
                      GitHub ↗
                    </a>
                  )}

                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      style={{ color: accent }}
                    >
                      Live Demo ↗
                    </a>
                  )}

                  <span style={{ color: colors.muted }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>

                  <span className="ml-auto flex gap-3">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => openEdit(project)}
                          className="hover:underline"
                          style={{ color: colors.muted }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs" style={{ color: colors.muted }}>
        Showing {visibleProjects.length} of {projects.length} projects
      </p>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div
            className="my-auto w-full max-w-lg rounded-xl border p-6"
            style={{
              background: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit project" : "New project"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-lg"
                style={{ color: colors.muted }}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProject} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs">Project name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                  style={inputStyle}
                  placeholder="My awesome project"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                  style={inputStyle}
                  placeholder="What does your project do?"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs">Tech stack</label>
                <input
                  value={form.tech_stack}
                  onChange={(e) =>
                    setForm({ ...form, tech_stack: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                  style={inputStyle}
                  placeholder="React, Next.js, Supabase"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs">GitHub repository URL</label>
                <input
                  type="url"
                  value={form.repository_url}
                  onChange={(e) =>
                    setForm({ ...form, repository_url: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                  style={inputStyle}
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs">Live demo URL</label>
                <input
                  type="url"
                  value={form.live_demo_url}
                  onChange={(e) =>
                    setForm({ ...form, live_demo_url: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                  style={inputStyle}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                    style={inputStyle}
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs">Visibility</label>
                  <select
                    value={form.is_public ? "public" : "private"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_public: e.target.value === "public",
                      })
                    }
                    className="w-full rounded-md border px-3 py-2.5 text-xs outline-none"
                    style={inputStyle}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border px-4 py-2.5 text-xs"
                  style={{ borderColor: colors.border }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60"
                  style={{ background: accent }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
