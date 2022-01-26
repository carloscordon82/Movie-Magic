const container = document.querySelector(".container2");
const seats = document.querySelectorAll(".row .seat:not(.occupied)");
const count = document.getElementById("count");
const total = document.getElementById("total");
const selected = document.getElementsByClassName("selected-seats");
const button = document.getElementById("btn");
const movieSelect = document.getElementById("movie");

let ticketPrice = 20;

//Update total and count
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll(".row .seat.selected");
  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
}
button.disabled = true;
button.classList.add("bg-gray-200");
button.addEventListener("click", (e) => {
  console.log("button");
  button.disabled = true;
  const respo = fetch("../../checkout/pre-summary", {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      selectedSeats,
    }),
  }).then((res) => {
    location.href = "../../checkout/summary";
  });
});

let selectedSeats = [];
let selectedLetters = [];

//Seat click event
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("seat") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    if (e.target.classList.contains("selected")) {
      selectedSeats.push(e.target.id);
      selectedLetters.push(e.target.innerText);
    } else {
      selectedSeats.forEach((element, i) => {
        if (element === e.target.id) {
          selectedSeats.splice(i, 1);
        }
      });
      selectedLetters.forEach((element, i) => {
        if (element === e.target.innerText) {
          selectedLetters.splice(i, 1);
        }
      });
    }
  }
  if (selectedSeats.length) button.disabled = false;
  console.log(selectedLetters);
  selected[0].innerText = "";
  let line = "";
  // selected.innerText = selectedLetters[0];
  selectedLetters.forEach((element, i) => {
    if (i) line += "-";
    line += ` ${element} `;
  });
  selected[0].innerText = line;
  console.log("LINER", line);
  if (!line) {
    selected[0].innerText = "None";
    button.disabled = true;
    button.classList.remove("bg-blue-600");
    button.classList.add("bg-gray-200");
  } else {
    button.disabled = false;
    button.classList.add("bg-blue-600");
    button.classList.remove("bg-gray-200");
  }

  //   updateSelectedCount();
});

let allData = {
  test: "test",
};
const getPayment = function (a) {
  const respo = fetch("/test", {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      allData,
    }),
  }).then((res) => {
    console.log("sent");
  });
};
console.log("Starting Promise Client Side", getPayment());
