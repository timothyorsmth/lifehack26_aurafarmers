// Test AI agent :)
export async function searchAgent(message) {
  const response = await fetch("/api/test", { // Note the things after fetch
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }), // The actual body text that we put into the console
  });

  // Error checking
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  // Return content
  return response.json();
}