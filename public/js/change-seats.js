const container = document.querySelector(".container2");
const seats = document.querySelectorAll(".row .seat:not(.occupied)");
const count = document.getElementById("count");
const total = document.getElementById("total");

const selected = document.getElementsByClassName("selected-seats");
const seatChange = document.getElementsByClassName("seat-change");
const finalLink = document.getElementsByClassName("final-link");
const movieSelect = document.getElementById("movie");

let ticketPrice = 20;

//Update total and count
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll(".row .seat.selected");
  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
}

let selectedSeats = "";
let selectedLetters = "";
const params = new URLSearchParams(window.location.search);
console.log("PARAMS", params.get("seat"));
//Seat click event
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("seat") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    if (e.target.classList.contains("selected")) {
      selectedSeats = e.target.id;
      selectedLetters = e.target.innerText;
    }
  }
  let dialogue = `Replacing ${params.get("seat")} with ${selectedLetters}`;
  console.log("DIALO", selectedSeats);
  for (let i = 0; i < seatChange.length; i++) {
    seatChange[i].innerText = dialogue;
  }
  for (let i = 0; i < finalLink.length; i++) {
    finalLink[i].action = `/seats/change/${params.get("id")}/${selectedSeats}`;
  }
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
