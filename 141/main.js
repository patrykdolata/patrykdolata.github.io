const calendar = document.getElementById("calendar");
const done = [];
for (let i = 0; i < 100; i++) {
  const cell = document.createElement("div");
  if (done.includes(i + 141)) {
    cell.className = "cell done";
  } else {
    cell.className = "cell";
  }
  cell.innerText = i + 1;
  calendar.appendChild(cell);
}
