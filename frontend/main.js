import { askAgent } from "../agents/test_agent";

try {
    const result = await askAgent("Hello");
    console.log(result.output)
} catch (error) {
    console.error(error);
}