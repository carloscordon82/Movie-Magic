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
console.log("checking", dates[0].attributes[0].value);
if (myParam)
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].attributes[0].value === myParam) {
      dates[i].classList.remove("bg-black");
      dates[i].classList.add("bg-orange-600");
    }
  }
