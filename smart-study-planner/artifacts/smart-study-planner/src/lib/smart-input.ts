import { CreateTaskBodyCategory, CreateTaskBodyPriority } from "@workspace/api-client-react";

export function parseSmartInput(input: string) {
  let title = input;
  let priority: CreateTaskBodyPriority | undefined;
  let category: CreateTaskBodyCategory | undefined;
  let dueDate: string | undefined;

  // Priority — @high / @medium / @low (also legacy #high etc.)
  if (/@high|#high/i.test(title)) {
    priority = CreateTaskBodyPriority.high;
    title = title.replace(/@high|#high/gi, "");
  } else if (/@medium|#medium/i.test(title)) {
    priority = CreateTaskBodyPriority.medium;
    title = title.replace(/@medium|#medium/gi, "");
  } else if (/@low|#low/i.test(title)) {
    priority = CreateTaskBodyPriority.low;
    title = title.replace(/@low|#low/gi, "");
  }

  // Due Dates — @tomorrow / @nextweek / @today (also plain words)
  const today = new Date();
  if (/@tomorrow|tomorrow/i.test(title)) {
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    dueDate = tmrw.toISOString();
    title = title.replace(/@tomorrow|tomorrow/gi, "");
  } else if (/@nextweek|@next week|next week/i.test(title)) {
    const nextWk = new Date(today);
    nextWk.setDate(nextWk.getDate() + 7);
    dueDate = nextWk.toISOString();
    title = title.replace(/@nextweek|@next week|next week/gi, "");
  } else if (/@today|today/i.test(title)) {
    dueDate = today.toISOString();
    title = title.replace(/@today|today/gi, "");
  } else {
    const daysMatch = title.match(/@?in (\d+) days/i);
    if (daysMatch && daysMatch[1]) {
      const d = new Date(today);
      d.setDate(d.getDate() + parseInt(daysMatch[1], 10));
      dueDate = d.toISOString();
      title = title.replace(daysMatch[0], "");
    }
  }

  // Categories — all use @ prefix
  if (/@study/i.test(title)) {
    category = CreateTaskBodyCategory.study;
    title = title.replace(/@study/gi, "");
  } else if (/@work/i.test(title)) {
    category = CreateTaskBodyCategory.work;
    title = title.replace(/@work/gi, "");
  } else if (/@personal/i.test(title)) {
    category = CreateTaskBodyCategory.personal;
    title = title.replace(/@personal/gi, "");
  } else if (/@health/i.test(title)) {
    category = CreateTaskBodyCategory.health;
    title = title.replace(/@health/gi, "");
  } else if (/@finance/i.test(title)) {
    category = CreateTaskBodyCategory.finance;
    title = title.replace(/@finance/gi, "");
  } else if (/@hobby/i.test(title)) {
    category = CreateTaskBodyCategory.hobby;
    title = title.replace(/@hobby/gi, "");
  } else if (/@social/i.test(title)) {
    category = CreateTaskBodyCategory.social;
    title = title.replace(/@social/gi, "");
  }

  return {
    title: title.trim().replace(/\s+/g, " "),
    priority,
    category,
    dueDate,
  };
}
