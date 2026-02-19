import { Temporal } from "@js-temporal/polyfill";

const calendar = document.getElementById("calendar")!;
const clock = document.getElementById("clock-de")!;

function highlightMonth(month: Temporal.PlainYearMonth) {
  // Clear previous highlights
  calendar.querySelectorAll(".active, .current, .weekend").forEach((active) => {
    active.classList.remove("active", "current", "weekend");
  });

  const today = Temporal.Now.plainDateISO();
  // Highlight the month
  calendar
    .querySelector(`#calendar > .month-row > :nth-child(${month.month}).month`)
    ?.classList.add(today.month === month.month ? "current" : "active");

  const firstDayInMonth = month.toPlainDate({ day: 1 });
  const monthDays = calendar.querySelectorAll(
    [
      `#calendar > :nth-child(13n + ${7 + 1 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 2 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 3 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 4 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 5 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 6 - firstDayInMonth.dayOfWeek}).day`,
      `#calendar > :nth-child(13n + ${7 + 7 - firstDayInMonth.dayOfWeek}).day`,
    ].join(", "),
  );

  let currentDate = firstDayInMonth;
  for (const day of monthDays) {
    day.classList.add("active");

    if (currentDate.equals(today)) {
      day.classList.add("current");
    }

    if ([6, 7].includes(currentDate.dayOfWeek)) {
      day.classList.add("weekend");
    }

    currentDate = currentDate.add({ days: 1 });

    if (currentDate.month !== month.month) {
      break;
    }
  }
}

function isBetween(a: number, lower: number, upper: number) {
  return lower <= a && a <= upper;
}

function highlightClock(now: Temporal.PlainTime) {
  let hour = now.hour % 12 || 12;
  const minute = now.minute;

  // ES IST is always lit
  const classesToEnable = [".es", ".ist"];

  // Determine which hour to display
  // German uses the next hour for HALB (half) and VOR (before)
  let displayHour = hour;
  if (minute >= 25) {
    displayHour = (hour % 12) + 1;
  }

  // Minute expressions
  if (isBetween(minute, 0, 4)) {
    // [HOUR] UHR
    classesToEnable.push(".uhr");
  } else if (isBetween(minute, 5, 9)) {
    // FÜNF NACH
    classesToEnable.push(".fuenf-min");
    classesToEnable.push(".nach");
  } else if (isBetween(minute, 10, 14)) {
    // ZEHN NACH
    classesToEnable.push(".zehn-min");
    classesToEnable.push(".nach");
  } else if (isBetween(minute, 15, 19)) {
    // VIERTEL NACH (or just VIERTEL in some regions)
    classesToEnable.push(".viertel");
    classesToEnable.push(".nach");
  } else if (isBetween(minute, 20, 24)) {
    // ZWANZIG NACH
    classesToEnable.push(".zwanzig");
    classesToEnable.push(".nach");
  } else if (isBetween(minute, 25, 29)) {
    // FÜNF VOR HALB
    classesToEnable.push(".fuenf-min");
    classesToEnable.push(".vor");
    classesToEnable.push(".halb");
  } else if (isBetween(minute, 30, 34)) {
    // HALB
    classesToEnable.push(".halb");
  } else if (isBetween(minute, 35, 39)) {
    // FÜNF NACH HALB
    classesToEnable.push(".fuenf-min");
    classesToEnable.push(".nach");
    classesToEnable.push(".halb");
  } else if (isBetween(minute, 40, 44)) {
    // ZWANZIG VOR
    classesToEnable.push(".zwanzig");
    classesToEnable.push(".vor");
  } else if (isBetween(minute, 45, 49)) {
    // VIERTEL VOR (or DREIVIERTEL in some regions)
    classesToEnable.push(".viertel");
    classesToEnable.push(".vor");
  } else if (isBetween(minute, 50, 54)) {
    // ZEHN VOR
    classesToEnable.push(".zehn-min");
    classesToEnable.push(".vor");
  } else {
    // FÜNF VOR (55-59)
    classesToEnable.push(".fuenf-min");
    classesToEnable.push(".vor");
  }

  // Display the hour
  const hourClasses = {
    1: ".eins",
    2: ".zwei",
    3: ".drei",
    4: ".vier",
    5: ".fuenf",
    6: ".sechs",
    7: ".sieben",
    8: ".acht",
    9: ".neun",
    10: ".zehn",
    11: ".elf",
    12: ".zwoelf",
  } as const;

  if (displayHour === 1 && classesToEnable.includes(".uhr")) {
    // Use "ein" for 1 o'clock instead of "eins"
    classesToEnable.push(".ein");
  } else {
    const hourClass = hourClasses[displayHour as keyof typeof hourClasses];
    classesToEnable.push(hourClass);
  }

  // Update the clock display
  clock.querySelectorAll(`:not(${classesToEnable.join(",")})`).forEach((el) => {
    el.classList.remove("light");
  });
  clock.querySelectorAll(classesToEnable.join(",")).forEach((el) => {
    el.classList.add("light");
  });
}

highlightMonth(Temporal.Now.plainDateISO().toPlainYearMonth());

calendar.querySelectorAll(".month").forEach((month) => {
  month.addEventListener("click", () => {
    const monthIndex = Array.from(month.parentElement!.children).indexOf(month);
    highlightMonth(
      Temporal.Now.plainDateISO()
        .with({ month: monthIndex + 1 })
        .toPlainYearMonth(),
    );
  });
});

function refresh() {
  highlightClock(Temporal.Now.plainTimeISO());
}
refresh();
globalThis.setInterval(refresh, 1000);
