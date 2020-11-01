export const acceptRelationship = jest.fn().mockResolvedValue(null);
export const blockRelationship = jest.fn().mockResolvedValue(null);
export const cancelRelationship = jest.fn().mockResolvedValue(null);
export const listAllRelationships = jest.fn().mockResolvedValue({
  active: ["abcdefabcdef", "bcdefabcdefa"],
  blocked: ["123456789012", "098765432109"],
  pending: ["a1b2c3d4e5f6", "1a2b3c4d5e6f"],
});
export const rejectRelationship = jest.fn().mockResolvedValue(null);
export const requestRelationship = jest.fn().mockResolvedValue(null);
export const unblockRelationship = jest.fn().mockResolvedValue(null);
