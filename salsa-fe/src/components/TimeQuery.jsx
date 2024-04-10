import React, { useState, useEffect, useContext } from "react";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";

function formateDate(time) {
  if (time >= 0 && time <= 9) {
    return "0" + time;
  }
  return String(time);
}

function TimeQuery() {
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [daysInMonth, setDaysInMonth] = useState(31);
  const { setRange } = useContext(SimilarAudioContext);

  useEffect(() => {
    const date = new Date(year, month - 1);
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    setDaysInMonth(days);
    if (day > days) setDay(days);
  }, [year, month, day]);

  const handleYearChange = (event) => {
    setYear(event.target.value);
    console.log(
      `Selected date: ${event.target.value}-${formateDate(month)}-${formateDate(
        day
      )}`
    );
    setRange(
      null,
      `${event.target.value}-${formateDate(month)}-${formateDate(day)}`,
      null
    );
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    console.log(`Selected date: ${year}-${event.target.value}-${day}`);
    setRange(
      null,
      `${year}-${formateDate(event.target.value)}-${formateDate(day)}`,
      null
    );
  };

  const handleDayChange = (event) => {
    setDay(event.target.value);
    console.log(`Selected date: ${year}-${month}-${event.target.value}`);
    setRange(
      null,
      `${year}-${formateDate(month)}-${formateDate(event.target.value)}`,
      null
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ marginRight: "10px", fontSize: "1.1em" }}>
        Show audios after:{" "}
      </div>
      <label
        htmlFor="year-select"
        style={{ marginRight: "5px", fontSize: "1.1em" }}
      >
        Year:{" "}
      </label>
      <select
        id="year-select"
        value={year}
        onChange={handleYearChange}
        style={{ marginRight: "5px", fontSize: "1.1em" }}
      >
        {[...Array(25).keys()]
          .map((i) => 2000 + i)
          .map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
      </select>

      <label
        htmlFor="month-select"
        style={{ marginRight: "5px", fontSize: "1.1em" }}
      >
        Month:{" "}
      </label>
      <select
        id="month-select"
        value={month}
        onChange={handleMonthChange}
        style={{ marginRight: "5px", fontSize: "1.1em" }}
      >
        {[...Array(12).keys()]
          .map((i) => i + 1)
          .map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
      </select>

      <label
        htmlFor="day-select"
        style={{ marginRight: "5px", fontSize: "1.1em" }}
      >
        Day:{" "}
      </label>
      <select
        id="day-select"
        value={day}
        onChange={handleDayChange}
        style={{ fontSize: "1.1em" }}
      >
        {[...Array(daysInMonth).keys()]
          .map((i) => i + 1)
          .map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
      </select>
    </div>
  );
}

export default TimeQuery;
