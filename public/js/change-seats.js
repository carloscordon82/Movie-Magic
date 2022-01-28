const container = document.querySelector(".container2");
const seats = document.querySelectorAll(".row .seat:not(.occupied)");
const count = document.getElementById("count");
const total = document.getElementById("total");

const selected = document.getElementsByClassName("selected-seats");
const seatChange = document.getElementsByClassName("seat-change");
const finalLink = document.getElementsByClassName("final-link");
const movieSelect = document.getElementById("movie");

let ticketPrice = 20;

function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll(".row .seat.selected");
  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
}

let selectedSeats = "";
let selectedLetters = "";
const params = new URLSearchParams(window.location.search);

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
  let dialogue = `Replacing Old Seat ${params.get(
    "seat"
  )} with New Seat ${selectedLetters}`;
  console.log("DIALO", selectedSeats);
  for (let i = 0; i < seatChange.length; i++) {
    seatChange[i].innerText = dialogue;
  }
  for (let i = 0; i < finalLink.length; i++) {
    finalLink[i].action = `/seats/change/${params.get("id")}/${selectedSeats}`;
  }
});
