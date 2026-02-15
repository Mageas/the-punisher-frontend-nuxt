const ERROR_MESSAGES_FR: Record<string, string> = {
  internal_error: "Une erreur interne est survenue.",
  invalid_request_body: "Le corps de la requete est invalide.",
  unauthorized: "Vous n'etes pas autorise a effectuer cette action.",
  register_not_allowed: "L'inscription est desactivee.",
  malformed_parameter: "Un parametre est mal forme.",
  validation_failed: "Certains champs sont invalides.",
  conflict: "Conflit detecte.",
  invalid_credentials_or_user_doesnt_exist: "Identifiants invalides.",
  jwt_invalid_signing_method: "Jeton invalide (signature).",
  jwt_invalid_token: "Jeton invalide.",
  jwt_expired: "Votre session a expire.",
  student_not_found: "Eleve introuvable.",
  bonus_type_not_found: "Type de bonus introuvable.",
  penalty_type_not_found: "Type de penalite introuvable.",
  rule_not_found: "Regle introuvable.",
  bonus_not_found: "Bonus introuvable.",
  penalty_not_found: "Penalite introuvable.",
  punishment_type_not_found: "Type de punition introuvable.",
  punishment_not_found: "Punition introuvable.",
  punishment_already_resolved: "Cette punition est deja resolue.",
  bonus_already_used: "Ce bonus est deja consomme.",
  classroom_not_found: "Classe introuvable.",
  student_classroom_relation_exists: "Cet eleve est deja rattache a cette classe.",
  student_or_classroom_not_found: "Eleve ou classe introuvable.",
  validation_field_required: "Ce champ est obligatoire.",
  validation_invalid_email: "Adresse email invalide.",
  validation_unknown_field: "Ce champ n'est pas autorise.",
  validation_email_already_exists: "Cette adresse email est deja utilisee.",
}

function formatExpectedValue(raw: string): string {
  return raw
    .replace(/^expected_/, "")
    .replaceAll("_", " ")
    .trim()
}

export function translateApiErrorKey(errorKey: string): string {
  if (!errorKey) {
    return "Une erreur est survenue. Merci de reessayer."
  }

  if (errorKey.startsWith("validation_error:")) {
    const innerKey = errorKey.slice("validation_error:".length)
    return translateApiErrorKey(innerKey)
  }

  if (errorKey.startsWith("validation_min_length:")) {
    const value = errorKey.slice("validation_min_length:".length)
    return `Minimum ${value} caracteres.`
  }

  if (errorKey.startsWith("validation_max_length:")) {
    const value = errorKey.slice("validation_max_length:".length)
    return `Maximum ${value} caracteres.`
  }

  if (errorKey.startsWith("validation_malformed_parameter:")) {
    const expected = errorKey.slice("validation_malformed_parameter:".length)
    return `Parametre mal forme. Attendu: ${formatExpectedValue(expected)}.`
  }

  return ERROR_MESSAGES_FR[errorKey] ?? errorKey
}
