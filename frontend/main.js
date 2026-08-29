// ==============
// The main file that connects the frontend and the backend
// Should not contain too much logic, should put logic in other files 
// ==============


// Import other files
import { searchAgent } from "../agents/SearchAgent";


const form = document.getElementById("myForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const textFieldValue = document.getElementById("prompt").value;

  console.log("Submitted:", textFieldValue);

  try {
    const result = await searchAgent(textFieldValue);
    document.getElementById("responseBox").textContent = result.output;
  } catch (error) {
    console.error(error);
  }
});

const response = await fetch(`/api/recommendations/${userId}`);
const data = await response.json();