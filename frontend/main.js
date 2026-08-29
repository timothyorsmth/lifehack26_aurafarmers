// ==============
// The main file that connects the frontend and the backend
// Should not contain too much logic, should put logic in other files 
// ==============


// Import other files
import { askAgent } from "../agents/test_agent";

const response = await fetch("/api/products");
const data = await response.json();

console.log(data.products);


