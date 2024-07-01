const seedCTE = ({ identifier, identifierValue, isFirstPage }) => `
WITH updateSeed AS (
  UPDATE seed
  SET seed = CASE
    WHEN ${isFirstPage} THEN FLOOR(1 + RANDOM() * 999999999)
    ELSE seed
  END
  WHERE ${identifier} = '${identifierValue}'
  RETURNING *
),
insertSeed AS (
  INSERT INTO seed (${identifier}, seed)
  SELECT '${identifierValue}', FLOOR(1 + RANDOM() * 999999999)
  WHERE NOT EXISTS (SELECT 1 FROM updateSeed)
  RETURNING *
),
seedRecord AS (
  SELECT * FROM updateSeed
  UNION ALL
  SELECT * FROM insertSeed
)
`;

export default seedCTE;
