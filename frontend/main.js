// ==============
// The main file that connects the frontend and the backend
// Should not contain too much logic, should put logic in other files 
// ==============


// Import other files
import { askAgent } from "../agents/test_agent";

try {
    const result = await askAgent("Hello");
    console.log(result.output)
} catch (error) {
    console.error(error);
}