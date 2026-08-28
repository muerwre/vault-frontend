// @vault/common — shared enums, wire DTOs and constants (the client/server
// contract). Ported from examples/migration-spec/data-model.md, the Go
// backend's pkg/constants + pkg/codes, and the frontend's src/types.
//
// The wire format is a frozen compatibility contract: renaming anything here
// breaks either the live frontend or the existing data.
export * from './constants';
export * from './types';
