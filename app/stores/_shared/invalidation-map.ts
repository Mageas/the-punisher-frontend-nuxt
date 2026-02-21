// Map resource to dependent stores
export const invalidationMap: Record<string, string[]> = {
  // Creating/Deleting a student affects classroom counts
  students: ['classrooms'],
  
  // Creating/Updating/Deleting bonuses/penalties/punishments affects student KPIs and classroom stats
  bonuses: ['students', 'classrooms'],
  penalties: ['students', 'classrooms'],
  punishments: ['students', 'classrooms'],
  
  // Updating types might affect rules or drop-downs if we cache them
  // For now, let's say types affect rules if rules use them
  'bonus-types': ['rules'],
  'penalty-types': ['rules'],
  'punishment-types': ['rules'],
}

export function getDependentStores(resource: string): string[] {
  return invalidationMap[resource] || []
}
