/* ===== SETTINGS: edit these ===== */
const SCHOOL_EMAIL = "yourschool@email.com";   // where the enrollment is sent
const SCHOOL_NAME  = "Grace Bible Integrated Academy";

// Grade / year choices for each level (edit if your school has other levels)
const gradeOptions = {
  "Elementary":  ["Kinder", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
  "High School": ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "College":     ["1st Year", "2nd Year", "3rd Year", "4th Year"]
};

// Requirements checklist (edit to match your school)
const requirements = [
  "Birth certificate (PSA)",
  "Report card / Form 138",
  "Certificate of good moral character",
  "2x2 ID pictures",
  "Baptismal certificate (if any)",
  "Transcript of records (college / transferee)"
];
/* ================================= */

const form = document.getElementById("enrollForm");
const level = document.getElementById("level");
const grade = document.getElementById("grade");
const courseField = document.getElementById("courseField");
const course = document.getElementById("course");
const errorMsg = document.getElementById("errorMsg");
const summary = document.getElementById("summary");
const summaryBody = document.getElementById("summaryBody");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("logo").onerror = function(){ this.style.display = "none"; };

/* Default school year, e.g. 2026-2027 */
const y = new Date().getFullYear();
document.getElementById("schoolYear").value = `${y}-${y + 1}`;

/* Build the requirements checklist */
document.getElementById("checks").innerHTML = requirements
  .map((r, i) => `<label><input type="checkbox" name="req" value="${r}" id="req${i}"> ${r}</label>`)
  .join("");

/* Level changes the grade list; College also asks for a course */
level.addEventListener("change", () => {
  const list = gradeOptions[level.value];
  if (list) {
    grade.disabled = false;
    grade.innerHTML = `<option value="">Select</option>` + list.map(g => `<option>${g}</option>`).join("");
  } else {
    grade.disabled = true;
    grade.innerHTML = `<option value="">Select level first</option>`;
  }
  const isCollege = level.value === "College";
  courseField.classList.toggle("hidden", !isCollege);
  course.required = isCollege;
  if (!isCollege) course.value = "";
});

/* Check required fields */
function validate() {
  let firstBad = null;
  form.querySelectorAll("[required]").forEach(el => {
    const empty = el.type === "checkbox" ? !el.checked : !el.value.trim();
    el.classList.toggle("invalid", empty);
    if (empty && !firstBad) firstBad = el;
  });

  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const badEmail = email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  const badPhone = phone.value && phone.value.replace(/\D/g, "").length < 10;
  email.classList.toggle("invalid", badEmail);
  phone.classList.toggle("invalid", badPhone);

  if (firstBad) { errorMsg.textContent = "Please fill out all required fields."; firstBad.focus(); return false; }
  if (badPhone) { errorMsg.textContent = "Please enter a valid mobile number."; phone.focus(); return false; }
  if (badEmail) { errorMsg.textContent = "Please enter a valid email address."; email.focus(); return false; }
  errorMsg.textContent = "";
  return true;
}

/* Clear red marks while typing */
form.addEventListener("input", e => e.target.classList.remove("invalid"));

function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function collect() {
  const v = id => document.getElementById(id).value.trim();
  const fullName = [v("firstName"), v("middleName"), v("lastName")].filter(Boolean).join(" ");
  const submitted = [...form.querySelectorAll('input[name="req"]:checked')].map(c => c.value);
  return [
    ["Enrollment", [
      ["Level", v("level")], ["Grade / Year", v("grade")],
      ...(v("course") ? [["Course", v("course")]] : []),
      ["Student type", v("studentType")], ["School year", v("schoolYear")]
    ]],
    ["Student", [
      ["Full name", fullName], ["Date of birth", v("birthdate")], ["Sex", v("gender")],
      ["Religion", v("religion") || "—"], ["Address", v("address")],
      ["Previous school", v("prevSchool") || "—"]
    ]],
    ["Parent / Guardian", [
      ["Name", v("guardian")], ["Relationship", v("relationship")], ["Mobile", v("phone")],
      ["Email", v("email") || "—"], ["Occupation", v("occupation") || "—"]
    ]],
    ["Requirements to submit", [["Documents", submitted.length ? submitted.join(", ") : "None checked"]]]
  ];
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!validate()) return;

  const data = collect();
  summaryBody.innerHTML = data.map(([title, rows]) =>
    `<div class="summary-block"><h3>${title}</h3><dl>` +
    rows.map(([k, val]) => `<dt>${k}</dt><dd>${escapeHTML(val)}</dd>`).join("") +
    `</dl></div>`).join("");

  /* Email link with the full summary as plain text */
  const text = data.map(([title, rows]) =>
    `${title.toUpperCase()}\n` + rows.map(([k, val]) => `${k}: ${val}`).join("\n")).join("\n\n");
  const studentName = data[1][1][0][1];
  document.getElementById("emailBtn").href =
    `mailto:${SCHOOL_EMAIL}?subject=${encodeURIComponent("Enrollment – " + studentName)}` +
    `&body=${encodeURIComponent(SCHOOL_NAME + "\n\n" + text)}`;

  form.classList.add("hidden");
  summary.classList.remove("hidden");
  summary.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("editBtn").addEventListener("click", () => {
  summary.classList.add("hidden");
  form.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

document.getElementById("resetBtn").addEventListener("click", () => {
  setTimeout(() => {
    level.dispatchEvent(new Event("change"));
    errorMsg.textContent = "";
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    document.getElementById("schoolYear").value = `${y}-${y + 1}`;
  }, 0);
});

const FORM_ENDPOINT = "https://formspree.io/f/xqpeqerj";

document.getElementById("sendBtn").addEventListener("click", async () => {
  const btn = document.getElementById("sendBtn");
  const payload = {};
  collect().forEach(([title, rows]) =>
    rows.forEach(([k, val]) => payload[`${title} - ${k}`] = val));

  btn.disabled = true;
  btn.textContent = "Sending...";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    summaryBody.innerHTML = "<p><strong>Thank you! Your enrollment was received. The school will contact you soon.</strong></p>";
    document.querySelector("#summary .actions").classList.add("hidden");
  } catch {
    btn.disabled = false;
    btn.textContent = "Submit Enrollment";
    alert("Sorry, it could not be sent. Please check your internet or use 'Send by Email'.");
  }
});