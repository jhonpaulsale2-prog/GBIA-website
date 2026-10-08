/* ===== TEACHERS LIST =====
   To add a teacher: copy one line, change the details.
   level must be exactly: "Elementary", "High School", or "College"
   photo: put the picture in the images folder, e.g. "images/teacher1.jpg"
*/
const teachers = [
  { name: "Teacher Name 1", role: "Grade 1 Teacher",       level: "Elementary",  photo: "images/teacher1.jpg" },
  { name: "Teacher Name 2", role: "Grade 4 Teacher",       level: "Elementary",  photo: "images/teacher2.jpg" },
  { name: "Teacher Name 3", role: "English Teacher",       level: "High School", photo: "images/teacher3.jpg" },
  { name: "Teacher Name 4", role: "Science Teacher",       level: "High School", photo: "images/teacher4.jpg" },
  { name: "Professor Name 5", role: "College Instructor",  level: "College",     photo: "images/teacher5.jpg" },
  { name: "Professor Name 6", role: "College Instructor",  level: "College",     photo: "images/teacher6.jpg" }
];

const grid = document.getElementById("teacherGrid");

function initials(name){
  return name.split(" ").filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("");
}

function showTeachers(level){
  grid.innerHTML = "";
  teachers
    .filter(t => level === "all" || t.level === level)
    .forEach(t => {
      const card = document.createElement("article");
      card.className = "teacher";
      const img = document.createElement("img");
      img.src = t.photo; img.alt = t.name; img.className = "photo";
      img.onerror = () => swapForInitials(img, t.name, false);
      card.appendChild(img);
      card.insertAdjacentHTML("beforeend",
        `<h4>${t.name}</h4><p class="role">${t.role}</p><small>${t.level}</small>`);
      grid.appendChild(card);
    });
}

/* If a photo is missing, show the person's initials instead */
function swapForInitials(img, name, big){
  const div = document.createElement("div");
  div.className = "initials" + (big ? " big" : "");
  div.textContent = initials(name);
  img.replaceWith(div);
}

/* Owner & principal photos */
document.querySelectorAll(".leader .photo").forEach(img => {
  img.onerror = () => swapForInitials(img, img.dataset.name, true);
});

/* Logo: hide if the file is not there yet */
document.getElementById("logo").onerror = function(){ this.style.display = "none"; };

/* Level tabs */
document.getElementById("tabs").addEventListener("click", e => {
  const btn = e.target.closest(".tab");
  if(!btn) return;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  showTeachers(btn.dataset.level);
});

/* Mobile menu */
const toggle = document.getElementById("menuToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  links.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));

document.getElementById("year").textContent = new Date().getFullYear();
showTeachers("all");
