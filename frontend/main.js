// ==============
// The main file that connects the frontend and the backend
// Should not contain too much logic, should put logic in other files 
// ==============


import { getReccomendations } from "../agents/ReccomendationAgent.js";

const userId = "YOUR-REAL-SUPABASE-USER-UUID";

try {
  const data = await getReccomendations(userId);

  console.log(data);

  document.getElementById("responseBox").textContent =
    data.summary;
} catch (error) {
  console.error(error);
}