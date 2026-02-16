const ERROR_MESSAGES_FR: Record<string, string> = {
  internal_error: "Une erreur interne est survenue.",
  invalid_request_body: "Le corps de la requête est invalide.",
  unauthorized: "Vous n'êtes pas autorisé à effectuer cette action.",
  register_not_allowed: "L'inscription est désactivée.",
  malformed_parameter: "Un paramètre est mal formé.",
  validation_failed: "Certains champs sont invalides.",
  conflict: "Conflit détecté.",
  invalid_credentials_or_user_doesnt_exist: "Identifiants invalides.",
  jwt_invalid_signing_method: "Jeton invalide (signature).",
  jwt_invalid_token: "Jeton invalide.",
  jwt_expired: "Votre session a expiré.",
  student_not_found: "Élève introuvable.",
  bonus_type_not_found: "Type de bonus introuvable.",
  penalty_type_not_found: "Type de pénalité introuvable.",
  rule_not_found: "Règle introuvable.",
  bonus_not_found: "Bonus introuvable.",
  penalty_not_found: "Pénalité introuvable.",
  punishment_type_not_found: "Type de punition introuvable.",
  punishment_not_found: "Punition introuvable.",
  punishment_already_resolved: "Cette punition est déjà résolue.",
  bonus_already_used: "Ce bonus est déjà consommé.",
  classroom_not_found: "Classe introuvable.",
  student_classroom_relation_exists: "Cet élève est déjà rattaché à cette classe.",
  student_or_classroom_not_found: "Élève ou classe introuvable.",
  validation_field_required: "Ce champ est obligatoire.",
  validation_invalid_email: "Adresse email invalide.",
  validation_unknown_field: "Ce champ n'est pas autorisé.",
  validation_email_already_exists: "Cette adresse email est déjà utilisée.",
}

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue. Merci de réessayer."

function formatExpectedValue(raw: string): string {
  return raw
    .replace(/^expected_/, "")
    .replaceAll("_", " ")
    .trim()
}

export function translateApiErrorKey(errorKey: string): string {
  if (!errorKey) {
    return GENERIC_ERROR_MESSAGE
  }

  if (errorKey.startsWith("validation_error:")) {
    const innerKey = errorKey.slice("validation_error:".length)
    return translateApiErrorKey(innerKey)
  }

  if (errorKey.startsWith("validation_min_length:")) {
    const value = errorKey.slice("validation_min_length:".length)
    return `Minimum ${value} caractères.`
  }

  if (errorKey.startsWith("validation_max_length:")) {
    const value = errorKey.slice("validation_max_length:".length)
    return `Maximum ${value} caractères.`
  }

  if (errorKey.startsWith("validation_malformed_parameter:")) {
    const expected = errorKey.slice("validation_malformed_parameter:".length)
    return `Paramètre mal formé. Attendu: ${formatExpectedValue(expected)}.`
  }

  return ERROR_MESSAGES_FR[errorKey] ?? GENERIC_ERROR_MESSAGE
}
