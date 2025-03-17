/**
 * Optimizes Mermaid flowchart layout based on node count and complexity
 * @param mermaidCode The original Mermaid code
 * @returns Optimized Mermaid code
 */
export function optimizeFlowchartLayout(mermaidCode: string): string {
  // Count nodes to determine complexity
  const nodeMatches = mermaidCode.match(/\[[^\]]+\]/g) || []
  const nodeCount = nodeMatches.length

  // Extract the graph declaration
  const firstLine = mermaidCode.split("\n")[0].trim()
  const isHorizontalLayout = firstLine.includes("LR") || firstLine.includes("RL")

  // If already using vertical layout and has many nodes, keep it vertical but add subgraphs
  if (!isHorizontalLayout && nodeCount > 15) {
    return organizeIntoSubgraphs(mermaidCode)
  }

  // If using horizontal layout and has many nodes, switch to vertical with subgraphs
  if (isHorizontalLayout && nodeCount > 10) {
    // Replace LR/RL with TD
    const verticalLayout = mermaidCode.replace(/graph\s+(LR|RL)/, "graph TD")
    return organizeIntoSubgraphs(verticalLayout)
  }

  // For smaller diagrams, just return the original
  return mermaidCode
}

/**
 * Organizes a large flowchart into subgraphs for better visualization
 * @param mermaidCode The original Mermaid code
 * @returns Mermaid code with subgraphs
 */
function organizeIntoSubgraphs(mermaidCode: string): string {
  const lines = mermaidCode.split("\n")
  const graphDeclaration = lines[0]
  const connections = lines.slice(1)

  // Extract all node definitions
  const nodeDefinitions: Record<string, string> = {}
  const nodePattern = /\s*([A-Za-z0-9_-]+)\s*\["?([^"]*)"?\]/

  connections.forEach((line) => {
    const match = line.match(nodePattern)
    if (match) {
      const [, id, label] = match
      nodeDefinitions[id] = label
    }
  })

  // Group nodes (for this example, we'll group by 5 nodes per subgraph)
  const groupSize = 5
  let result = graphDeclaration + "\n"

  // Create subgraphs
  const nodeIds = Object.keys(nodeDefinitions)
  for (let i = 0; i < nodeIds.length; i += groupSize) {
    const groupNodes = nodeIds.slice(i, i + groupSize)
    if (groupNodes.length > 0) {
      result += `  subgraph Group${Math.floor(i / groupSize) + 1}\n`
      groupNodes.forEach((id) => {
        result += `    ${id}["${nodeDefinitions[id]}"]\n`
      })
      result += "  end\n"
    }
  }

  // Add all connections
  connections.forEach((line) => {
    if (line.includes("-->")) {
      result += line + "\n"
    }
  })

  return result
}

/**
 * Detects if a flowchart would be better displayed with a specific orientation
 * @param input The user's input description
 * @returns The recommended orientation ('TD' or 'LR')
 */
export function detectOptimalOrientation(input: string): string {
  // Check for keywords suggesting a timeline, sequence, or process flow
  const horizontalKeywords = [
    "timeline",
    "sequence",
    "step by step",
    "progression",
    "evolution",
    "history",
    "chronological",
    "succession",
    "presidents",
    "kings",
    "rulers",
    "dynasty",
    "lineage",
    "generations",
  ]

  // Check for keywords suggesting hierarchical relationships
  const verticalKeywords = [
    "hierarchy",
    "organization",
    "reporting",
    "structure",
    "tree",
    "parent",
    "child",
    "descendant",
    "inheritance",
    "taxonomy",
    "classification",
    "category",
    "decision",
  ]

  // Count matches for each type
  const horizontalScore = horizontalKeywords.filter((keyword) =>
    input.toLowerCase().includes(keyword.toLowerCase()),
  ).length

  const verticalScore = verticalKeywords.filter((keyword) => input.toLowerCase().includes(keyword.toLowerCase())).length

  // Determine orientation based on scores
  if (horizontalScore > verticalScore) {
    return "LR" // Left to Right
  } else {
    return "TD" // Top Down
  }
}

