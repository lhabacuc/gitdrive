import { z } from "zod";

export const repoParamsSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export const contentsParamsSchema = repoParamsSchema.extend({
  path: z.string().default(""),
});

export const uploadSchema = repoParamsSchema.extend({
  path: z.string().min(1),
  content: z.string().min(1), // base64
  message: z.string().optional(),
  sha: z.string().optional(), // for overwrite
});

export const deleteSchema = repoParamsSchema.extend({
  path: z.string().min(1),
  sha: z.string().min(1),
  message: z.string().optional(),
});

export const folderSchema = repoParamsSchema.extend({
  path: z.string().min(1),
  message: z.string().optional(),
});

export const searchSchema = repoParamsSchema.extend({
  query: z.string().min(1),
});

export const driveConfigSchema = z.object({
  defaultRepo: z
    .object({ owner: z.string().min(1), repo: z.string().min(1) })
    .nullable()
    .default(null),
  displayName: z.string().default("My Drive"),
  viewMode: z.enum(["grid", "list"]).default("grid"),
  sortBy: z.enum(["name", "size", "date"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  showHiddenFiles: z.boolean().default(false),
  uploadLimitMB: z.number().min(1).max(100).default(100),
});

export const configUpdateSchema = repoParamsSchema.extend({
  config: driveConfigSchema,
});

export const folderColorNameSchema = z.enum([
  "blue",
  "green",
  "red",
  "orange",
  "yellow",
  "purple",
  "pink",
  "teal",
  "brown",
  "gray",
]);

export const folderColorsConfigSchema = z.record(z.string(), folderColorNameSchema);

export const folderColorsUpdateSchema = repoParamsSchema.extend({
  colors: folderColorsConfigSchema,
});

export const renameSchema = repoParamsSchema.extend({
  oldPath: z.string().min(1),
  newPath: z.string().min(1),
  type: z.enum(["file", "dir"]),
  sha: z.string().optional(),
});
