export interface Exercise {
  id: string;
  hint: string;
  checkFragments: string[];
  errorMessages: string[];
}

export interface ExerciseResult {
  passed: boolean;
  failures: { fragment: string; message: string }[];
}

export function verifyExercise(
  exercise: Exercise,
  userCode: string
): ExerciseResult {
  const normalized = userCode.replace(/\s+/g, " ").trim();
  const failures: { fragment: string; message: string }[] = [];

  exercise.checkFragments.forEach((fragment, i) => {
    const normalizedFragment = fragment.replace(/\s+/g, " ").trim();
    if (!normalized.includes(normalizedFragment)) {
      failures.push({
        fragment: normalizedFragment,
        message: exercise.errorMessages[i] || `缺少关键代码片段`,
      });
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}
