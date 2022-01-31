function filterRows() {
  function separate(myString) {
    let myArray = [];
    let myRegexp = /[^\s"]+|"([^"]*)"/gi;
    do {
      //Each call to exec returns the next regex match as an array
      var match = myRegexp.exec(myString);
      if (match != null) {
        //Index 1 in the array is the captured group if it exists
        //Index 0 is the matched text, which we use if no captured group exists
        myArray.push(match[1] ? match[1] : match[0]);
      }
    } while (match != null);
    return myArray;
  }
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  let allWords = [];
  allWords = separate(input.value.toUpperCase());

  if (allWords.length === 0)
    for (i = 0; i < tr.length; i++) {
      tr[i].style.display = "";
    }
  for (i = 0; i < tr.length; i++) {
    let found = true;
    allWords.forEach((filter) => {
      td = tr[i].getElementsByTagName("td")[0];
      td2 = tr[i].getElementsByTagName("td")[1];
      td3 = tr[i].getElementsByTagName("td")[2];
      td4 = tr[i].getElementsByTagName("td")[3];
      if (td || td2 || td3 || td4) {
        txtValue = td.textContent || td.innerText;
        txtValue2 = td2.textContent || td2.innerText;
        txtValue3 = td3.textContent || td3.innerText;
        txtValue4 = td4.textContent || td4.innerText;
        if (
          txtValue.toUpperCase().indexOf(filter) > -1 ||
          txtValue2.toUpperCase().indexOf(filter) > -1 ||
          txtValue3.toUpperCase().indexOf(filter) > -1 ||
          txtValue4.toUpperCase().indexOf(filter) > -1
        ) {
        } else {
          found = false;
        }
      }
    });
    if (found) {
      tr[i].style.display = "";
    } else {
      tr[i].style.display = "none";
    }
  }
}
filterRows();
