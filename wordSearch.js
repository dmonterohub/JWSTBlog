"use strict";

/*
   
   Word Search Game Script
   
   Global Variables
   
   allCells
      References all of the cells in the word search table
      
   found
      Stores a Boolean value indicating whether the currently
      selected letters represents a word in the word search list.
     
   Function List
   
   function drawWordSearch(letters, words)
      Returns the HTML code for a word search table based on the entries
      in the letters array and the location of the words
      in the words array
      
   showList(list)
      Returns the HTML for code for an unordered list of words based
      on the items in the list array

*/

var allCells;
var found = false;

// access the stylesheet
let stylesheet = document.styleSheets[0]

// variable to help make sure program knows exactly when mouse is still down
var isMouseDown = false;

// variable to contain the full word as letters are stored in
var fullWord = "";

// array that stores past elements inside to make sure found words are greened out
var selectedElements = [];

// number variable to be incremented for winning alert
var totalFound = 0;

// number variable totalFound needs to reach
var winningNum = 25;

// Global variables for tracking direction
let startRow, startCol;
let direction = null;

let solutionVisible = false; // Track whether the solution is visible

window.onload = init;

function init() {
   document.querySelectorAll("aside h1")[0].innerHTML = wordSearchTitle;
   document.getElementById("wordTable").innerHTML = drawWordSearch(letterGrid, wordGrid);
   document.getElementById("wordList").innerHTML = showList(wordArray);

   allCells = document.querySelectorAll("table#wordSearchTable td");

   /*
   The code below sets up eventlisteners to trigger each of the different action functions I have defined below.
   When the solution button is clicked, it will highlight each word by changing the background color of each cell
   */
   var pickedLetters = document.getElementById("pickedLetters")
   
   document.body.style.userSelect = "none";

   var singleCell = document.querySelectorAll("td");
   for (let i = 0; i < singleCell.length; i++) {
      singleCell[i].addEventListener("mouseover", onHover);
      singleCell[i].addEventListener("mousedown", onMousedown);
      singleCell[i].addEventListener("mouseup", onMouseup);
      singleCell[i].addEventListener("mouseenter", onMousedrag);
   }

   var showSolutionButton = document.getElementById("showSolution");
   
   showSolutionButton.addEventListener("click", function () {
      const solutions = document.querySelectorAll(".wordCell");
      if (!solutionVisible) {
         // Show the solution
         solutions.forEach(function (solution) {
            solution.style.setProperty("background-color", "pink");
         });
         solutionVisible = true; // Update state to visible
      } else {
         // Hide the solution
         solutions.forEach(function (solution) {
            solution.style.removeProperty("background-color");
         });
         solutionVisible = false; // Update state to hidden
      }
   })
         
}


/*============================================================*/

function drawWordSearch(letters, words) {
   var rowSize = letters.length;
   var colSize = letters[0].length;

   var htmlCode = "<table id='wordSearchTable'>";
   htmlCode += "<caption>Word Search</caption>";

   for (var i = 0; i < rowSize; i++) {
      htmlCode += "<tr>";

      for (var j = 0; j < colSize; j++) {
         if (words[i][j] == " ") {
            htmlCode += "<td>";
         } else {
            htmlCode += "<td class='wordCell'>";
         }
         htmlCode += letters[i][j];
         htmlCode += "</td>";
      }

      htmlCode += "</tr>";
   }
   htmlCode += "</table>";

   return htmlCode;
}

function showList(list) {
   var htmlCode = "<ul id='wordSearchList'>";

   for (var i = 0; i < list.length; i++) {
      htmlCode += "<li>" + list[i] + "</li>";
   }

   htmlCode += "</ul>";

   return htmlCode;
}

/*============================================================*/

/*
   onHover function
   -  changes cursor style to pointer while mousing over letters
*/
var onHover = function() {
   this.style.cursor = "pointer";
}

// Function to determine the direction of movement
function getDirection(start, current) {
    const [startRow, startCol] = start;
    const [currentRow, currentCol] = current;
 
    const rowDiff = currentRow - startRow;
    const colDiff = currentCol - startCol;
 
    if (rowDiff === 0 && colDiff !== 0) return "horizontal";
    if (colDiff === 0 && rowDiff !== 0) return "vertical";
    if (Math.abs(rowDiff) === Math.abs(colDiff)) return "diagonal";
 
    return null; // Invalid move
 }

/*
   onMousedown function
   -  changes isMouseDown to true
   -  adds a letter to the fullWord each time it happens
   -  adds the letter to the textbox (pickedLetters)
   -  changes background color to orange
   -  pushes the selected element into an array for onMouseup
*/
var onMousedown = function() {
    isMouseDown = true;

    // Get the starting cell's row and column
    const cellIndex = Array.from(allCells).indexOf(this);
    startRow = Math.floor(cellIndex / letterGrid[0].length);
    startCol = cellIndex % letterGrid[0].length;
 
    let letter = this.textContent;
    fullWord += letter;
 
    pickedLetters.value += letter;
 
    this.style.setProperty("background-color", "orange");
    selectedElements.push(this);
    direction = null; 
}

/*
   onMousedrag function
   -  if isMousedown is true it will execute the following:
   -  adds a letter to the fullWord each time it happens
   -  adds the letter to the textbox (pickedLetters)
   -  changes background color to orange
   -  pushes the selected element into an array for onMouseup
*/
var onMousedrag = function() {
    if (isMouseDown) {
        // Get the current cell's row and column
        const cellIndex = Array.from(allCells).indexOf(this);
        const currentRow = Math.floor(cellIndex / letterGrid[0].length);
        const currentCol = cellIndex % letterGrid[0].length;
  
        // Determine direction if not yet set
        if (!direction && (currentRow !== startRow || currentCol !== startCol)) {
           direction = getDirection([startRow, startCol], [currentRow, currentCol]);
        }
  
        // Validate the direction
        if (direction) {
           const valid = getDirection([startRow, startCol], [currentRow, currentCol]) === direction;
           if (!valid) return; // Ignore invalid moves
        }
  
        let letter = this.textContent;
        fullWord += letter;
  
        pickedLetters.value += letter;
  
        this.style.setProperty("background-color", "orange");
        selectedElements.push(this);
     }
}

/*
   onMouseup function
   -  now that mouse is up, make isMouseDown false
   -  determine if the word selected is found within the answer array, then set found to true.
   -  if found is true
   -     it will go through each prior selected element and change background color to green
   -     increment totalFound
   -     crosses out the found word in the list underneath the text box
   -  otherwise
   -     it will remove the background color that was previously selected
   -  each value that had a letter or element added to it is reset for the next word
   -  finally, if totalFound reaches winningNum, a congratulatory alert is displayed
*/
var onMouseup = function() {
    isMouseDown = false;

    for (var i = 0; i < wordArray.length; i++) {
       if (wordArray[i] === fullWord) {
          found = true;
       }
    }
 
    if (found) {
       selectedElements.forEach(function(element) {
          element.style.removeProperty("background-color");
          element.classList.add("found");
          stylesheet.insertRule(".found { background-color: green; z-index: 5; }");
       });
       totalFound++;
       var crossout = document.querySelectorAll("li");
       for (var i = 0; i < crossout.length; i++) {
          if (crossout[i].textContent === fullWord) {
             crossout[i].style.setProperty("text-decoration", "line-through");
          }
       }
    } else {
       selectedElements.forEach(function(element) {
          element.style.removeProperty("background-color");
       });
    }
 
    fullWord = "";
    selectedElements = [];
    found = false;
    pickedLetters.value = "";
    direction = null; // Reset direction
 
    if (totalFound === winningNum) {
       window.alert("Congratulations, you found them all!");
    }
}