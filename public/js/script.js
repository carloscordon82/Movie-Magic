document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("Don't be a hacker");
  },
  false
);

const dates = document.getElementsByClassName("dates");
const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get("movieDate");
if (myParam)
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].attributes[0].value === myParam) {
      dates[i].classList.remove("bg-black");
      dates[i].classList.add("bg-orange-600");
    }
  }

const message = document.getElementsByClassName("message");
setTimeout(() => {
  if (message[0]) message[0].style["display"] = "none";
}, 5000);
