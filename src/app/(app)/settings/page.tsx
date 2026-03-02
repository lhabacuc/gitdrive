"use client";

import { useState, useEffect } from "react";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { useDriveConfig, useUpdateConfig } from "@/hooks/use-drive-config";
import { DriveConfig, GitHubRepo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FolderGit2,
  Lock,
  Globe,
  Check,
  Loader2,
  LayoutGrid,
  List,
  ArrowUpAZ,
  ArrowDownAZ,
  Eye,
  EyeOff,
  Upload,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: repos, isLoading: reposLoading } = useGitHubRepos();
  const [selectedRepo, setSelectedRepo] = useState<{
    owner: string;
    repo: string;
  } | null>(null);

  const { config, isLoading: configLoading } = useDriveConfig(
    selectedRepo?.owner,
    selectedRepo?.repo
  );
  const updateConfig = useUpdateConfig();

  const [form, setForm] = useState<DriveConfig>({
    defaultRepo: null,
    displayName: "My Drive",
    viewMode: "grid",
    sortBy: "name",
    sortOrder: "asc",
    showHiddenFiles: false,
    uploadLimitMB: 100,
  });

  // Load default repo from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gitdrive_default_repo");
    if (stored) {
      try {
        setSelectedRepo(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Sync form when config loads
  useEffect(() => {
    if (config && selectedRepo) {
      setForm(config);
    }
  }, [config, selectedRepo]);

  const handleSelectRepo = (repo: GitHubRepo) => {
    const next = { owner: repo.owner.login, repo: repo.name };
    setSelectedRepo(next);
  };

  const handleSave = async () => {
    if (!selectedRepo) {
      toast.error("Select a repository first");
      return;
    }

    const configToSave: DriveConfig = {
      ...form,
      defaultRepo: selectedRepo,
    };

    try {
      await updateConfig.mutateAsync({
        owner: selectedRepo.owner,
        repo: selectedRepo.repo,
        config: configToSave,
      });

      // Cache default repo in localStorage for fast redirect
      localStorage.setItem(
        "gitdrive_default_repo",
        JSON.stringify(selectedRepo)
      );

      toast.success("Settings saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-3 sm:p-6">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your drive preferences. Settings are stored in the selected
          repository.
        </p>
      </div>

      {/* Drive Repository */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Drive Repository
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose which repository to use as your default drive
          </p>
        </div>

        {reposLoading ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto rounded-xl border border-foreground/[0.06] p-2">
            {repos?.map((repo: GitHubRepo) => {
              const isSelected =
                selectedRepo?.owner === repo.owner.login &&
                selectedRepo?.repo === repo.name;
              return (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo)}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2.5 text-left transition-all",
                    isSelected
                      ? "bg-primary/15 border border-primary/40"
                      : "bg-foreground/[0.03] border border-foreground/[0.06] hover:bg-foreground/[0.06]"
                  )}
                >
                  <FolderGit2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate flex-1 min-w-0">
                    {repo.owner.login}/{repo.name}
                  </span>
                  {repo.private ? (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedRepo && configLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading config...
          </div>
        )}
      </section>

      {/* Display Name */}
      <section className="space-y-3">
        <Label htmlFor="displayName" className="text-sm font-medium">
          Display Name
        </Label>
        <Input
          id="displayName"
          value={form.displayName}
          onChange={(e) =>
            setForm((f) => ({ ...f, displayName: e.target.value }))
          }
          placeholder="My Drive"
        />
      </section>

      {/* Display Settings */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">Display</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How files are displayed in the drive view
          </p>
        </div>

        {/* View Mode */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">View Mode</Label>
          <div className="flex gap-2">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setForm((f) => ({ ...f, viewMode: mode }))}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm transition-colors border",
                  form.viewMode === mode
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "bg-foreground/[0.03] border-foreground/[0.06] text-muted-foreground hover:bg-foreground/[0.06]"
                )}
              >
                {mode === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort By</Label>
          <div className="flex flex-wrap gap-2">
            {(["name", "size", "date"] as const).map((field) => (
              <button
                key={field}
                onClick={() => setForm((f) => ({ ...f, sortBy: field }))}
                className={cn(
                  "rounded-lg px-3 sm:px-4 py-2 text-sm transition-colors border",
                  form.sortBy === field
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "bg-foreground/[0.03] border-foreground/[0.06] text-muted-foreground hover:bg-foreground/[0.06]"
                )}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort Order</Label>
          <div className="flex gap-2">
            {(["asc", "desc"] as const).map((order) => (
              <button
                key={order}
                onClick={() => setForm((f) => ({ ...f, sortOrder: order }))}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm transition-colors border",
                  form.sortOrder === order
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "bg-foreground/[0.03] border-foreground/[0.06] text-muted-foreground hover:bg-foreground/[0.06]"
                )}
              >
                {order === "asc" ? (
                  <ArrowUpAZ className="h-4 w-4" />
                ) : (
                  <ArrowDownAZ className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {order === "asc" ? "Ascending" : "Descending"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Files Settings */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">Files</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            File display and upload preferences
          </p>
        </div>

        {/* Show Hidden Files */}
        <button
          onClick={() =>
            setForm((f) => ({ ...f, showHiddenFiles: !f.showHiddenFiles }))
          }
          className="flex items-center justify-between w-full rounded-lg px-3 sm:px-4 py-3 border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors"
        >
          <div className="flex items-center gap-3">
            {form.showHiddenFiles ? (
              <Eye className="h-4 w-4 text-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="text-left">
              <p className="text-sm text-foreground">Show Hidden Files</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Display dotfiles and hidden folders
              </p>
            </div>
          </div>
          <div
            className={cn(
              "w-9 h-5 rounded-full transition-colors relative",
              form.showHiddenFiles ? "bg-primary" : "bg-foreground/[0.12]"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                form.showHiddenFiles ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </div>
        </button>

        {/* Upload Limit */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Upload className="h-3.5 w-3.5" />
            Upload Limit: {form.uploadLimitMB} MB
          </Label>
          <input
            type="range"
            min={1}
            max={100}
            value={form.uploadLimitMB}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                uploadLimitMB: Number(e.target.value),
              }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>1 MB</span>
            <span>100 MB</span>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end pt-2 pb-6 safe-bottom">
        <Button
          onClick={handleSave}
          disabled={!selectedRepo || updateConfig.isPending}
          className="gap-2"
        >
          {updateConfig.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
