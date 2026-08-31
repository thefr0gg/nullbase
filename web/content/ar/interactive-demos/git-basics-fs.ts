import { dir, file } from "@/lib/terminal/vfs";

export const gitBasicsFs = dir({
  home: dir({
    user: dir({
      projects: dir({
        nullbase: dir({
          "README.md": file("# nullbase\n\nموقع مرجعي للمطورين.\n"),
        }),
      }),
    }),
  }),
});

export const gitBasicsCwd = ["home", "user", "projects", "nullbase"];

export const gitBasicsExpectedCommands = ["git status", "git add README.md", "git commit -m \"Initial commit\""];
