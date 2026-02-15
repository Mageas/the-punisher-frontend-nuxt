# API Errors - Contract and Translation Keys

Version: 2026-02-15

## 1) Error response format

```json
{
  "error": "validation_failed",
  "error_details": [
    {
      "field": "password",
      "error": "validation_min_length:8"
    }
  ],
  "error_code": 400
}
```

Backend structures:

```go
type ErrorResponse struct {
  Error        string        `json:"error"`
  ErrorDetails []ErrorDetail `json:"error_details,omitempty"`
  ErrorCode    int           `json:"error_code"`
}

type ErrorDetail struct {
  Field string `json:"field"`
  Error string `json:"error"`
}
```

## 2) Top-level error keys

- `internal_error` (500)
- `invalid_request_body` (400)
- `unauthorized` (401)
- `register_not_allowed` (401)
- `malformed_parameter` (400)
- `validation_failed` (400)
- `conflict` (409)
- `invalid_credentials_or_user_doesnt_exist` (401)
- `jwt_invalid_signing_method` (401)
- `jwt_invalid_token` (401)
- `jwt_expired` (401)
- `student_not_found` (404)
- `bonus_type_not_found` (404)
- `penalty_type_not_found` (404)
- `rule_not_found` (404)
- `bonus_not_found` (404)
- `penalty_not_found` (404)
- `punishment_type_not_found` (404)
- `punishment_not_found` (404)
- `punishment_already_resolved` (409)
- `bonus_already_used` (409)
- `classroom_not_found` (404)
- `student_classroom_relation_exists` (409)
- `student_or_classroom_not_found` (404)

## 3) Validation keys (`error_details[].error`)

Keys sent by backend:

- `validation_field_required`
- `validation_invalid_email`
- `validation_unknown_field`
- `validation_email_already_exists`
- `validation_min_length:%s`
- `validation_max_length:%s`
- `validation_error:%s`
- `validation_malformed_parameter:expected_%s`

Examples:

- `validation_min_length:8` -> password must be at least 8 chars
- `validation_max_length:255` -> value must be at most 255 chars
- `validation_error:validation_invalid_email` -> wrapped validation error
- `validation_malformed_parameter:expected_uuid` -> malformed parameter, expected uuid

## 4) Auth DTOs (login/register/refresh)

```go
type LoginRequestDto struct {
  Email      string `json:"email" validate:"required,email"`
  Password   string `json:"password" validate:"required,min=8"`
  RemoteAddr string `json:"-"`
}

type LoginResponseDto struct {
  AccessToken  string `json:"access_token"`
  RefreshToken string `json:"-"`
}

type RefreshResponseDto struct {
  AccessToken string `json:"access_token"`
}
```

Register payload expected by backend contract:

```json
{
  "email": "professeur@ecole.fr",
  "password": "password123",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

## 5) Frontend behavior implemented

- Translate backend keys to UI messages (French for now).
- Show global message from `error`.
- Show per-field messages from `error_details` on matching inputs.
- Parse dynamic keys with parameters:
- `validation_min_length:*`
- `validation_max_length:*`
- `validation_error:*` (unwrap)
- `validation_malformed_parameter:*`
