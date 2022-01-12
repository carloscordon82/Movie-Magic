const container = document.querySelector(".container");
const seats = document.querySelectorAll(".row .seat:not(.occupied)");
const count = document.getElementById("count");
const total = document.getElementById("total");
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
//Seat click event
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("seat") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    if (e.target.classList.contains("selected")) {
      selectedSeats.push(e.target.id);
      console.log(selectedSeats);
    } else {
      selectedSeats.forEach((element, i) => {
        if (element === e.target.id) {
          selectedSeats.splice(i, 1);
          console.log(selectedSeats);
        }
      });
    }
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
