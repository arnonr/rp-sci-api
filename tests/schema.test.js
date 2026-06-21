const fs = require('fs');
const path = require('path');

describe('user model schema', () => {
  const schema = fs.readFileSync(
    path.join(__dirname, '..', 'prisma', 'schema.prisma'),
    'utf8'
  );

  test('has sso_pid field with @unique on user model', () => {
    const userModelMatch = schema.match(/model user\s*\{[\s\S]*?\n\}/);
    expect(userModelMatch).not.toBeNull();
    const userModel = userModelMatch[0];
    expect(userModel).toMatch(/sso_pid\s+String\?\s+@unique/);
  });
});
